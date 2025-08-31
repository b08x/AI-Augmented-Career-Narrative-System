
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { OutputPanel } from './components/OutputPanel';
import { generateCareerNarrative } from './services/geminiService';
import { NarrativeOutput } from './types';
import { StrategicAnalysisPanel } from './components/StrategicAnalysisPanel';

const App: React.FC = () => {
    const [rawTruth, setRawTruth] = useState<string>('');
    const [jobDescription, setJobDescription] = useState<string>('');
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [resumeText, setResumeText] = useState<string>('');
    const [gitRepoUrl, setGitRepoUrl] = useState<string>('');
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
            const result = await generateCareerNarrative(rawTruth, jobDescription, resumeText, gitRepoUrl);
            setNarrativeOutput(result);
        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(`Failed to generate narrative: ${errorMessage}`);
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [rawTruth, jobDescription, resumeText, gitRepoUrl]);

    return (
        <div className="min-h-screen bg-gray-dark font-sans flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                <div className="lg:col-span-1">
                    <InputPanel
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
                </div>
                <div className="lg:col-span-1">
                    <OutputPanel 
                        isLoading={isLoading} 
                        narrativeOutput={narrativeOutput} 
                        rawTruth={rawTruth}
                    />
                </div>
                <div className="lg:col-span-1">
                    {narrativeOutput && !isLoading && (
                        <StrategicAnalysisPanel analysis={narrativeOutput.strategicAnalysis} />
                    )}
                </div>
            </main>
            <footer className="text-center p-4 text-gray-light text-sm">
                <p>Built with React, Tailwind, and the Gemini API.</p>
            </footer>
        </div>
    );
};

export default App;
