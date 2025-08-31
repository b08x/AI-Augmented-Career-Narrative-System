
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { OutputPanel } from './components/OutputPanel';
import { generateCareerNarrative } from './services/geminiService';
import { NarrativeOutput } from './types';
import { SparklesIcon } from './components/icons/SparklesIcon';

const App: React.FC = () => {
    const [rawTruth, setRawTruth] = useState<string>('');
    const [jobDescription, setJobDescription] = useState<string>('');
    const [narrativeOutput, setNarrativeOutput] = useState<NarrativeOutput | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

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

        try {
            const result = await generateCareerNarrative(rawTruth, jobDescription);
            setNarrativeOutput(result);
        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(`Failed to generate narrative: ${errorMessage}`);
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [rawTruth, jobDescription]);

    return (
        <div className="min-h-screen bg-gray-dark font-sans flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto p-4 md:p-8 flex flex-col gap-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <InputPanel
                        rawTruth={rawTruth}
                        setRawTruth={setRawTruth}
                        jobDescription={jobDescription}
                        setJobDescription={setJobDescription}
                        isDisabled={isLoading}
                    />
                </div>

                <div className="flex flex-col items-center">
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !rawTruth || !jobDescription}
                        className="flex items-center justify-center gap-3 bg-brand-secondary hover:bg-brand-primary disabled:bg-gray-medium disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-full transition-all duration-300 ease-in-out shadow-lg transform hover:scale-105"
                    >
                        <SparklesIcon />
                        {isLoading ? 'Translating Experience...' : 'Generate Narrative'}
                    </button>
                    {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
                </div>
                
                <OutputPanel 
                  isLoading={isLoading} 
                  narrativeOutput={narrativeOutput} 
                  rawTruth={rawTruth}
                />
            </main>
            <footer className="text-center p-4 text-gray-light text-sm">
                <p>Built with React, Tailwind, and the Gemini API.</p>
            </footer>
        </div>
    );
};

export default App;
