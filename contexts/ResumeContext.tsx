import React, { createContext, useState, useCallback, useContext, ReactNode, useEffect } from 'react';
import type { NarrativeOutput, ChatMessage } from '../types';
import { generateResumeFeedback, generateResumeDraft } from '../services/geminiService';
import { useNarrative } from './NarrativeContext';

// Define the shape of the context state
interface ResumeContextState {
    resumeFile: File | null;
    setResumeFile: React.Dispatch<React.SetStateAction<File | null>>;
    resumeText: string;
    setResumeText: React.Dispatch<React.SetStateAction<string>>;
    editedResume: string;
    resumeHistory: string[];
    resumeFeedback: ChatMessage[];
    isFeedbackLoading: boolean;
    selectedFeedbackIds: Set<string>;
    feedbackContext: Record<string, string>;
    isDrafting: boolean;
    oliverChat: ChatMessage[];
    steveChat: ChatMessage[];
    automatedAnalysis: boolean;
    setAutomatedAnalysis: React.Dispatch<React.SetStateAction<boolean>>;
    
    // Handlers
    handleInitialResumeAnalysis: () => Promise<void>;
    handleSendFeedbackMessage: (message: string) => Promise<void>;
    handleResumeEdit: (newText: string) => void;
    handleResumeUndo: () => void;
    handleToggleFeedbackSelection: (id: string) => void;
    handleFeedbackContextChange: (id: string, context: string) => void;
    handleUpdateResumeDraft: () => Promise<void>;
    resetResumeState: () => void;
}

const ResumeContext = createContext<ResumeContextState | undefined>(undefined);

interface ResumeProviderProps {
    children: ReactNode;
}

export const ResumeProvider: React.FC<ResumeProviderProps> = ({ children }) => {
    const { narrativeOutput } = useNarrative();

    // State
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [resumeText, setResumeText] = useState<string>('');
    const [editedResume, setEditedResume] = useState('');
    const [resumeHistory, setResumeHistory] = useState<string[]>([]);
    const [resumeFeedback, setResumeFeedback] = useState<ChatMessage[]>([]);
    const [isFeedbackLoading, setIsFeedbackLoading] = useState<boolean>(false);
    const [selectedFeedbackIds, setSelectedFeedbackIds] = useState<Set<string>>(new Set());
    const [feedbackContext, setFeedbackContext] = useState<Record<string, string>>({});
    const [isDrafting, setIsDrafting] = useState<boolean>(false);
    const [oliverChat, setOliverChat] = useState<ChatMessage[]>([]);
    const [steveChat, setSteveChat] = useState<ChatMessage[]>([]);
    const [automatedAnalysis, setAutomatedAnalysis] = useState(true);

    // This effect syncs the initial resume text and history when a new narrative is generated.
    useEffect(() => {
        if (narrativeOutput) {
            setEditedResume(resumeText);
            setResumeHistory([resumeText]);
            if (narrativeOutput.strategicAnalysis) {
                const timestamp = new Date().toISOString();
                setOliverChat([{ id: `oliver-${Date.now()}`, role: 'model', text: narrativeOutput.strategicAnalysis.oliversPerspective, timestamp }]);
                setSteveChat([{ id: `steve-${Date.now()}`, role: 'model', text: narrativeOutput.strategicAnalysis.stevesPerspective, timestamp }]);
            }
        }
    }, [narrativeOutput, resumeText]);

    const resetResumeState = useCallback(() => {
        setResumeFeedback([]);
        setOliverChat([]);
        setSteveChat([]);
        setSelectedFeedbackIds(new Set());
        setFeedbackContext({});
        setEditedResume('');
        setResumeHistory([]);
        // We don't reset resumeFile or resumeText as the user might want to regenerate with the same file.
    }, []);

    const handleInitialResumeAnalysis = useCallback(async () => {
        if (!narrativeOutput || !resumeText) {
            alert("Please ensure a narrative is generated and a resume is uploaded.");
            return;
        }
        setIsFeedbackLoading(true);
        setResumeFeedback([]);
        try {
            const { feedback, strategicAnalysis } = await generateResumeFeedback(narrativeOutput, resumeText, []);
            
            const newFeedbackMessages: ChatMessage[] = feedback.map(f => ({
                id: `feedback-${Date.now()}-${Math.random()}`, role: 'model', text: f
            }));
            setResumeFeedback(newFeedbackMessages);
            
            if (automatedAnalysis) {
                const timestamp = new Date().toISOString();
                setOliverChat(prev => [...prev, { id: `oliver-${Date.now()}`, role: 'model', text: strategicAnalysis.oliversPerspective, timestamp }]);
                setSteveChat(prev => [...prev, { id: `steve-${Date.now()}`, role: 'model', text: strategicAnalysis.stevesPerspective, timestamp }]);
            }
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setResumeFeedback([{ id: `err-${Date.now()}`, role: 'model', text: `Sorry, an error occurred: ${errorMessage}` }]);
            console.error(e);
        } finally {
            setIsFeedbackLoading(false);
        }
    }, [narrativeOutput, resumeText, automatedAnalysis]);

    const handleSendFeedbackMessage = useCallback(async (message: string) => {
        if (!narrativeOutput || !editedResume || !message.trim()) return;

        const newHistory: ChatMessage[] = [...resumeFeedback, { id: `user-${Date.now()}`, role: 'user', text: message }];
        setResumeFeedback(newHistory);
        setIsFeedbackLoading(true);

        try {
            const { feedback, strategicAnalysis } = await generateResumeFeedback(narrativeOutput, editedResume, newHistory);
            
            const newFeedbackMessages: ChatMessage[] = feedback.map(f => ({
                id: `feedback-${Date.now()}-${Math.random()}`, role: 'model', text: f
            }));
            setResumeFeedback([...newHistory, ...newFeedbackMessages]);

            if (automatedAnalysis) {
                const timestamp = new Date().toISOString();
                setOliverChat(prev => [...prev, { id: `oliver-${Date.now()}`, role: 'model', text: strategicAnalysis.oliversPerspective, timestamp }]);
                setSteveChat(prev => [...prev, { id: `steve-${Date.now()}`, role: 'model', text: strategicAnalysis.stevesPerspective, timestamp }]);
            }
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setResumeFeedback([...newHistory, { id: `err-${Date.now()}`, role: 'model', text: `Sorry, an error occurred: ${errorMessage}` }]);
            console.error(e);
        } finally {
            setIsFeedbackLoading(false);
        }
    }, [narrativeOutput, editedResume, resumeFeedback, automatedAnalysis]);

    const handleResumeEdit = (newText: string) => {
        setEditedResume(newText);
        setResumeHistory(prev => [...prev, newText]);
    };

    const handleResumeUndo = () => {
        if (resumeHistory.length > 1) {
            const newHistory = [...resumeHistory];
            newHistory.pop();
            setResumeHistory(newHistory);
            setEditedResume(newHistory[newHistory.length - 1]);
        }
    };

    const handleToggleFeedbackSelection = (id: string) => {
        setSelectedFeedbackIds(prev => {
            const newSet = new Set(prev);
            newSet.has(id) ? newSet.delete(id) : newSet.add(id);
            return newSet;
        });
    };

    const handleFeedbackContextChange = (id: string, context: string) => {
        setFeedbackContext(prev => ({ ...prev, [id]: context }));
    };

    const handleUpdateResumeDraft = async () => {
        if (selectedFeedbackIds.size === 0) {
            alert("Please select at least one feedback card to update the draft.");
            return;
        }
        setIsDrafting(true);
        try {
            const selectedMessages = resumeFeedback.filter(msg => selectedFeedbackIds.has(msg.id));
            const newDraft = await generateResumeDraft(editedResume, selectedMessages, feedbackContext);
            setResumeHistory(prev => [...prev, newDraft]);
            setEditedResume(newDraft);
            setSelectedFeedbackIds(new Set());
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            alert(`Failed to generate new draft: ${errorMessage}`);
            console.error(e);
        } finally {
            setIsDrafting(false);
        }
    };

    const value = {
        resumeFile, setResumeFile, resumeText, setResumeText, editedResume,
        resumeHistory, resumeFeedback, isFeedbackLoading, selectedFeedbackIds,
        feedbackContext, isDrafting, oliverChat, steveChat, automatedAnalysis, setAutomatedAnalysis,
        handleInitialResumeAnalysis, handleSendFeedbackMessage, handleResumeEdit,
        handleResumeUndo, handleToggleFeedbackSelection, handleFeedbackContextChange,
        handleUpdateResumeDraft, resetResumeState
    };

    return <ResumeContext.Provider value={value}>{children}</ResumeContext.Provider>;
};

export const useResume = (): ResumeContextState => {
    const context = useContext(ResumeContext);
    if (context === undefined) {
        throw new Error('useResume must be used within a ResumeProvider');
    }
    return context;
};
