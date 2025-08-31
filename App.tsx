
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { OutputPanel } from './components/OutputPanel';
import { generateCareerNarrative, generateResumeFeedback } from './services/geminiService';
import { NarrativeOutput, ChatMessage } from './types';
import { StrategicAnalysisPanel } from './components/StrategicAnalysisPanel';
import { ResumeFeedbackPanel } from './components/ResumeFeedbackPanel';

const App: React.FC = () => {
    const [rawTruth, setRawTruth] = useState<string>('');
    const [jobDescription, setJobDescription] = useState<string>('');
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [resumeText, setResumeText] = useState<string>('');
    const [gitRepoUrl, setGitRepoUrl] = useState<string>('');
    const [narrativeOutput, setNarrativeOutput] = useState<NarrativeOutput | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    const [resumeFeedback, setResumeFeedback] = useState<ChatMessage[]>([]);
    const [isFeedbackLoading, setIsFeedbackLoading] = useState<boolean>(false);

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
        setResumeFeedback([]); // Clear feedback on new narrative generation

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

    const handleInitialResumeAnalysis = useCallback(async () => {
        if (!narrativeOutput || !resumeText) {
            alert("Please generate a narrative and upload a resume first.");
            return;
        };
        setIsFeedbackLoading(true);
        setResumeFeedback([]);
        try {
            const responseText = await generateResumeFeedback(narrativeOutput, resumeText, []);
            setResumeFeedback([{ role: 'model', text: responseText }]);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setResumeFeedback([{ role: 'model', text: `Sorry, an error occurred: ${errorMessage}` }]);
            console.error(e);
        } finally {
            setIsFeedbackLoading(false);
        }
    }, [narrativeOutput, resumeText]);
    
    const handleSendFeedbackMessage = useCallback(async (message: string) => {
        if (!narrativeOutput || !resumeText || !message.trim()) return;

        const newHistory: ChatMessage[] = [...resumeFeedback, { role: 'user', text: message }];
        setResumeFeedback(newHistory);
        setIsFeedbackLoading(true);

        try {
            const responseText = await generateResumeFeedback(narrativeOutput, resumeText, newHistory);
            setResumeFeedback([...newHistory, { role: 'model', text: responseText }]);
        } catch (e) {
             const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setResumeFeedback([...newHistory, { role: 'model', text: `Sorry, an error occurred: ${errorMessage}` }]);
            console.error(e);
        } finally {
            setIsFeedbackLoading(false);
        }
    }, [narrativeOutput, resumeText, resumeFeedback]);

    return (
        <div className="min-h-screen bg-background text-text-primary font-sans flex flex-col">
            <Header />
            <main className="flex-grow max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 w-full">
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
                <div className="lg:col-span-1 flex flex-col gap-6">
                    {narrativeOutput && !isLoading && (
                        <>
                            <StrategicAnalysisPanel analysis={narrativeOutput.strategicAnalysis} />
                            <ResumeFeedbackPanel 
                                narrativeOutput={narrativeOutput}
                                resumeText={resumeText}
                                feedback={resumeFeedback}
                                isLoading={isFeedbackLoading}
                                onInitialAnalysis={handleInitialResumeAnalysis}
                                onSendMessage={handleSendFeedbackMessage}
                            />
                        </>
                    )}
                </div>
            </main>
            <footer className="text-center p-4 text-slate text-sm">
                <p>Built with React, Tailwind, and the Gemini API.</p>
            </footer>
        </div>
    );
};

export default App;
