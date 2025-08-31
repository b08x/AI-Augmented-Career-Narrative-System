import React, { createContext, useState, useCallback, useContext, ReactNode } from 'react';
import type { NarrativeOutput, KeyExperience } from '../types';
import { generateCareerNarrative } from '../services/geminiService';

// Define the shape of the context state
interface NarrativeContextState {
    rawTruth: string;
    setRawTruth: React.Dispatch<React.SetStateAction<string>>;
    jobDescription: string;
    setJobDescription: React.Dispatch<React.SetStateAction<string>>;
    gitRepoUrl: string;
    setGitRepoUrl: React.Dispatch<React.SetStateAction<string>>;
    narrativeOutput: NarrativeOutput | null;
    isLoading: boolean;
    error: string | null;
    handleGenerate: (resumeText: string) => Promise<NarrativeOutput | null>;
    updateKeyExperiences: (reorderedBreakdown: KeyExperience[]) => void;
}

// Create the context with a default undefined value
const NarrativeContext = createContext<NarrativeContextState | undefined>(undefined);

// Define the props for the provider
interface NarrativeProviderProps {
    children: ReactNode;
}

// Create the provider component
export const NarrativeProvider: React.FC<NarrativeProviderProps> = ({ children }) => {
    const [rawTruth, setRawTruth] = useState<string>('');
    const [jobDescription, setJobDescription] = useState<string>('');
    const [gitRepoUrl, setGitRepoUrl] = useState<string>('');
    const [narrativeOutput, setNarrativeOutput] = useState<NarrativeOutput | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = useCallback(async (resumeText: string): Promise<NarrativeOutput | null> => {
        if (!rawTruth.trim()) {
            setError('Please provide a description of your project or experience.');
            return null;
        }
        if (!jobDescription.trim()) {
            setError('Please provide a target job description.');
            return null;
        }

        setIsLoading(true);
        setError(null);
        setNarrativeOutput(null);

        try {
            const result = await generateCareerNarrative(rawTruth, jobDescription, resumeText, gitRepoUrl);
            setNarrativeOutput(result);
            return result;
        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(`Failed to generate narrative: ${errorMessage}`);
            console.error(e);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [rawTruth, jobDescription, gitRepoUrl]);
    
    const updateKeyExperiences = useCallback((reorderedBreakdown: KeyExperience[]) => {
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

    const value = {
        rawTruth,
        setRawTruth,
        jobDescription,
        setJobDescription,
        gitRepoUrl,
        setGitRepoUrl,
        narrativeOutput,
        isLoading,
        error,
        handleGenerate,
        updateKeyExperiences,
    };

    return (
        <NarrativeContext.Provider value={value}>
            {children}
        </NarrativeContext.Provider>
    );
};

// Create a custom hook for consuming the context
export const useNarrative = (): NarrativeContextState => {
    const context = useContext(NarrativeContext);
    if (context === undefined) {
        throw new Error('useNarrative must be used within a NarrativeProvider');
    }
    return context;
};
