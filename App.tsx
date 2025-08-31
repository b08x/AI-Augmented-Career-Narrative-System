import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { generateCareerNarrative, generateResumeFeedback, generateResumeDraft } from './services/geminiService';
import { NarrativeOutput, ChatMessage, KeyExperience } from './types';
import { InputPage } from './pages/InputPage';
import { WorkbenchPage } from './pages/WorkbenchPage';

const App: React.FC = () => {
    // App view state
    const [view, setView] = useState<'input' | 'workbench'>('input');

    // Input state
    const [rawTruth, setRawTruth] = useState<string>('');
    const [jobDescription, setJobDescription] = useState<string>('');
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [resumeText, setResumeText] = useState<string>('');
    const [gitRepoUrl, setGitRepoUrl] = useState<string>('');
    
    // Output state
    const [narrativeOutput, setNarrativeOutput] = useState<NarrativeOutput | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Resume Feedback Chat state
    const [resumeFeedback, setResumeFeedback] = useState<ChatMessage[]>([]);
    const [isFeedbackLoading, setIsFeedbackLoading] = useState<boolean>(false);
    const [selectedFeedbackIds, setSelectedFeedbackIds] = useState<Set<string>>(new Set());
    const [feedbackContext, setFeedbackContext] = useState<Record<string, string>>({});
    const [isDrafting, setIsDrafting] = useState<boolean>(false);

    // Persona Chat state
    const [oliverChat, setOliverChat] = useState<ChatMessage[]>([]);
    const [steveChat, setSteveChat] = useState<ChatMessage[]>([]);
    const [isPersonaLoading, setIsPersonaLoading] = useState(false);
    const [automatedAnalysis, setAutomatedAnalysis] = useState(true);

    // Resume Editor state
    const [editedResume, setEditedResume] = useState('');
    const [resumeHistory, setResumeHistory] = useState<string[]>([]);

    const handleGenerate = useCallback(async () => {
        if (!rawTruth.trim()) {
            setError('Please provide a description of your project or experience.');
            return;
        }
        if (!jobDescription.trim()) {
            setError('Please provide a target job description.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setNarrativeOutput(null);
        setResumeFeedback([]);
        setOliverChat([]);
        setSteveChat([]);
        setSelectedFeedbackIds(new Set());
        setFeedbackContext({});

        try {
            const result = await generateCareerNarrative(rawTruth, jobDescription, resumeText, gitRepoUrl);
            setNarrativeOutput(result);
            setEditedResume(resumeText);
            setResumeHistory([resumeText]);
            if (result.strategicAnalysis) {
                const timestamp = new Date().toISOString();
                setOliverChat([{ id: `oliver-${Date.now()}`, role: 'model', text: result.strategicAnalysis.oliversPerspective, timestamp }]);
                setSteveChat([{ id: `steve-${Date.now()}`, role: 'model', text: result.strategicAnalysis.stevesPerspective, timestamp }]);
            }
            setView('workbench');
        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(`Failed to generate narrative: ${errorMessage}`);
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [rawTruth, jobDescription, resumeText, gitRepoUrl]);

    const handleInitialResumeAnalysis = useCallback(async () => {
        if (!narrativeOutput || !resumeText) {
            alert("Please generate a narrative and upload a resume first.");
            return;
        };
        setIsFeedbackLoading(true);
        setResumeFeedback([]);
        try {
            const { feedback, strategicAnalysis } = await generateResumeFeedback(narrativeOutput, resumeText, []);
            
            const newFeedbackMessages: ChatMessage[] = feedback.map(f => ({
                id: `feedback-${Date.now()}-${Math.random()}`,
                role: 'model',
                text: f
            }));
            setResumeFeedback(newFeedbackMessages);

            setNarrativeOutput(prev => ({ ...prev!, strategicAnalysis }));
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
        if (!narrativeOutput || !resumeText || !message.trim()) return;

        const newHistory: ChatMessage[] = [...resumeFeedback, { id: `user-${Date.now()}`, role: 'user', text: message }];
        setResumeFeedback(newHistory);
        setIsFeedbackLoading(true);

        try {
            const { feedback, strategicAnalysis } = await generateResumeFeedback(narrativeOutput, editedResume, newHistory);
            
            const newFeedbackMessages: ChatMessage[] = feedback.map(f => ({
                id: `feedback-${Date.now()}-${Math.random()}`,
                role: 'model',
                text: f
            }));
            setResumeFeedback([...newHistory, ...newFeedbackMessages]);

            setNarrativeOutput(prev => ({ ...prev!, strategicAnalysis }));
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
    }, [narrativeOutput, resumeText, editedResume, resumeFeedback, automatedAnalysis]);

    const handleKeyExperienceReorder = useCallback((reorderedBreakdown: KeyExperience[]) => {
        setNarrativeOutput(prev => {
            if (!prev) return null;
            return {
                ...prev,
                corporateNarrative: {
                    ...prev.corporateNarrative,
                    keyExperienceBreakdown: reorderedBreakdown,
                },
            };
        });
    }, []);

    const handleResumeEdit = (newText: string) => {
        setEditedResume(newText);
        setResumeHistory(prev => [...prev, newText]);
    }

    const handleResumeUndo = () => {
        if (resumeHistory.length > 1) {
            const newHistory = [...resumeHistory];
            newHistory.pop();
            setResumeHistory(newHistory);
            setEditedResume(newHistory[newHistory.length - 1]);
        }
    }

    const handleToggleFeedbackSelection = (id: string) => {
        setSelectedFeedbackIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleFeedbackContextChange = (id: string, context: string) => {
        setFeedbackContext(prev => ({
            ...prev,
            [id]: context,
        }));
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
            
            // To properly track history for diffing, we must update both history and current state
            setResumeHistory(prev => [...prev, newDraft]);
            setEditedResume(newDraft);
            
            setSelectedFeedbackIds(new Set()); // Clear selection after use
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            alert(`Failed to generate new draft: ${errorMessage}`);
            console.error(e);
        } finally {
            setIsDrafting(false);
        }
    };


    return (
        <div className="min-h-screen bg-background text-text-primary font-sans flex flex-col">
            <Header />
            
            {view === 'input' ? (
                <InputPage
                    rawTruth={rawTruth}
                    setRawTruth={setRawTruth}
                    jobDescription={jobDescription}
                    setJobDescription={setJobDescription}
                    gitRepoUrl={gitRepoUrl}
                    setGitRepoUrl={setGitRepoUrl}
                    resumeFile={resumeFile}
                    setResumeFile={setResumeFile}
                    setResumeText={setResumeText}
                    isLoading={isLoading}
                    error={error}
                    handleGenerate={handleGenerate}
                />
            ) : (
                <WorkbenchPage
                    // Input Panel Props
                    rawTruth={rawTruth}
                    setRawTruth={setRawTruth}
                    jobDescription={jobDescription}
                    setJobDescription={setJobDescription}
                    gitRepoUrl={gitRepoUrl}
                    setGitRepoUrl={setGitRepoUrl}
                    resumeFile={resumeFile}
                    setResumeFile={setResumeFile}
                    setResumeText={setResumeText}
                    isLoading={isLoading}
                    handleGenerate={handleGenerate}
                    // Output Panel Props
                    narrativeOutput={narrativeOutput}
                    onKeyExperienceReorder={handleKeyExperienceReorder}
                    // Resume Feedback Props
                    resumeText={resumeText}
                    feedback={resumeFeedback}
                    isFeedbackLoading={isFeedbackLoading}
                    onInitialAnalysis={handleInitialResumeAnalysis}
                    onSendMessage={handleSendFeedbackMessage}
                    selectedFeedbackIds={selectedFeedbackIds}
                    onToggleFeedbackSelection={handleToggleFeedbackSelection}
                    feedbackContext={feedbackContext}
                    onFeedbackContextChange={handleFeedbackContextChange}
                    isDrafting={isDrafting}
                    onUpdateDraft={handleUpdateResumeDraft}
                    // Resume Editor Props
                    editedResume={editedResume}
                    previousResume={resumeHistory.length > 1 ? resumeHistory[resumeHistory.length - 2] : resumeText}
                    onResumeEdit={handleResumeEdit}
                    onUndo={handleResumeUndo}
                    canUndo={resumeHistory.length > 1}
                    // Persona Chat Props
                    oliverChat={oliverChat}
                    steveChat={steveChat}
                    setOliverChat={setOliverChat}
                    setSteveChat={setSteveChat}
                    isPersonaLoading={isPersonaLoading}
                    automatedAnalysis={automatedAnalysis}
                    setAutomatedAnalysis={setAutomatedAnalysis}
                />
            )}

            <footer className="text-center p-4 text-slate text-sm">
                <p>Built with React, Tailwind, and the Gemini API.</p>
            </footer>
        </div>
    );
};

export default App;
