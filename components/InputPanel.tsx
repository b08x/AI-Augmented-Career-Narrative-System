
import React, { useState, useEffect, useCallback } from 'react';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { StopIcon } from './icons/StopIcon';
import { UploadIcon } from './icons/UploadIcon';
import { SparklesIcon } from './icons/SparklesIcon';

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

interface InputPanelProps {
    rawTruth: string;
    setRawTruth: React.Dispatch<React.SetStateAction<string>>;
    jobDescription: string;
    setJobDescription: React.Dispatch<React.SetStateAction<string>>;
    gitRepoUrl: string;
    setGitRepoUrl: React.Dispatch<React.SetStateAction<string>>;
    resumeFile: File | null;
    setResumeFile: React.Dispatch<React.SetStateAction<File | null>>;
    setResumeText: React.Dispatch<React.SetStateAction<string>>;
    isLoading: boolean;
    error: string | null;
    handleGenerate: () => void;
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
    recognition.continuous = true;
    recognition.interimResults = true;
}

export const InputPanel: React.FC<InputPanelProps> = ({
    rawTruth,
    setRawTruth,
    jobDescription,
    setJobDescription,
    gitRepoUrl,
    setGitRepoUrl,
    resumeFile,
    setResumeFile,
    setResumeText,
    isLoading,
    error,
    handleGenerate
}) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isFetchingCommits, setIsFetchingCommits] = useState(false);
    const [commitError, setCommitError] = useState<string | null>(null);

    const handleContentFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                setRawTruth(prev => prev ? `${prev}\n\n--- FILE CONTENT (${file.name}) ---\n${text}` : text);
            };
            reader.readAsText(file);
        }
        event.target.value = ''; // Reset file input
    };

    const handleResumeFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setResumeFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                setResumeText(text);
            };
            reader.readAsText(file);
        }
    };

    const handleFetchCommits = useCallback(async () => {
        setCommitError(null);
        if (!gitRepoUrl) {
            setCommitError("Please enter a GitHub repository URL.");
            return;
        }

        const match = gitRepoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (!match) {
            setCommitError("Invalid GitHub URL. Please use the format 'https://github.com/owner/repo'.");
            return;
        }

        setIsFetchingCommits(true);
        const [, owner, repo] = match;
        const repoName = repo.replace(/\.git$/, '');

        try {
            const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}/commits?per_page=20`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to fetch commits (${response.status})`);
            }
            const commits = await response.json();
            
            if (commits.length === 0) {
                setRawTruth(prev => `${prev.trim()}\n\n--- GIT COMMIT HISTORY ---\nNo recent commits found in the repository.`);
            } else {
                const commitSummary = commits
                    .map((c: any) => `- ${c.commit.message.split('\n')[0]}`) // Take only first line
                    .join('\n');
                const summaryText = `\n\n--- RECENT GIT COMMIT HISTORY (last ${commits.length} commits) ---\n${commitSummary}`;
                setRawTruth(prev => prev.trim() + summaryText);
            }
        } catch (e: any) {
            setCommitError(`Error: ${e.message}. This may be a private repository, an invalid URL, or a rate-limited API.`);
            console.error(e);
        } finally {
            setIsFetchingCommits(false);
        }
    }, [gitRepoUrl, setRawTruth]);


    const toggleRecording = useCallback(() => {
        if (!recognition) {
            alert("Speech recognition is not supported in your browser.");
            return;
        }
        if (isRecording) {
            recognition.stop();
        } else {
            recognition.start();
        }
    }, [isRecording]);

    useEffect(() => {
        if (!recognition) return;

        recognition.onstart = () => setIsRecording(true);
        recognition.onend = () => setIsRecording(false);
        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsRecording(false);
        };
        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
             setRawTruth(prev => prev.slice(0, prev.length - interimTranscript.length) + finalTranscript + interimTranscript);
        };

        return () => {
            if (recognition) recognition.stop();
        };
    }, [setRawTruth]);

    return (
        <div className="bg-charcoal rounded-lg p-6 shadow-xl flex flex-col gap-6 h-full">
            {/* Literal Description */}
            <div className="flex flex-col h-full">
                <label htmlFor="rawTruth" className="text-lg font-semibold text-text-primary mb-2">
                    Literal Description
                </label>
                <p className="text-sm text-slate mb-4">
                    Explain what you built, why you built it, and the challenges you faced. You can also fetch commit history from a public GitHub repo below.
                </p>
                <div className="relative flex-grow min-h-[200px]">
                    <textarea
                        id="rawTruth"
                        value={rawTruth}
                        onChange={(e) => setRawTruth(e.target.value)}
                        placeholder="e.g., 'I built a small script to automate my home lighting...'"
                        className="w-full h-full p-4 pr-12 bg-background/50 border-2 border-slate/50 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary transition-colors placeholder:text-text-secondary"
                        disabled={isLoading}
                    />
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                        <button onClick={toggleRecording} disabled={isLoading || !recognition} title={isRecording ? "Stop Recording" : "Start Recording"} className={`p-2 rounded-full transition-colors ${isRecording ? 'bg-primary text-white animate-pulse' : 'bg-slate hover:bg-slate/80 text-text-primary'} disabled:bg-slate/50`}>
                            {isRecording ? <StopIcon /> : <MicrophoneIcon />}
                        </button>
                         <label htmlFor="file-upload" className="cursor-pointer p-2 rounded-full bg-slate hover:bg-slate/80 text-text-primary" title="Upload Code File">
                             <UploadIcon />
                         </label>
                         <input id="file-upload" type="file" className="hidden" onChange={handleContentFileChange} accept=".js,.jsx,.ts,.tsx,.py,.rb,.sh,.md,.txt" disabled={isLoading} />
                    </div>
                </div>
            </div>

            {/* Target Job Description */}
            <div className="flex flex-col h-full">
                <label htmlFor="jobDescription" className="text-lg font-semibold text-text-primary mb-2">
                    Target Job Description
                </label>
                <div className="flex-grow min-h-[200px]">
                    <textarea
                        id="jobDescription"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="e.g., 'Seeking a proactive Junior Developer with experience in Python...'"
                        className="w-full h-full p-4 bg-background/50 border-2 border-slate/50 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary transition-colors placeholder:text-text-secondary"
                        disabled={isLoading}
                    />
                </div>
            </div>

            {/* Professional Profile */}
            <div>
                 <label className="text-lg font-semibold text-text-primary mb-2">
                    Professional Profile (Optional)
                </label>
                <div className="mt-2 space-y-4">
                     <label htmlFor="resume-upload" className="w-full text-sm flex items-center justify-center gap-2 bg-background/50 border-2 border-dashed border-slate/50 rounded-md p-3 text-slate hover:border-primary hover:text-white transition-colors cursor-pointer">
                         <UploadIcon />
                         {resumeFile ? `${resumeFile.name}` : 'Upload Resume'}
                     </label>
                     <input id="resume-upload" type="file" className="hidden" onChange={handleResumeFileChange} accept=".txt,.md,.pdf" disabled={isLoading} />
                </div>
            </div>

             {/* Project Context */}
            <div>
                 <label htmlFor="gitRepoUrl" className="text-lg font-semibold text-text-primary mb-2">
                    Project Context (Optional)
                </label>
                <div className="flex items-stretch gap-2 mt-2">
                    <input
                        id="gitRepoUrl"
                        type="text"
                        value={gitRepoUrl}
                        onChange={(e) => setGitRepoUrl(e.target.value)}
                        placeholder="Public GitHub URL (e.g., https://github.com/owner/repo)"
                        className="flex-grow w-full p-3 bg-background/50 border-2 border-slate/50 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors placeholder:text-text-secondary"
                        disabled={isLoading || isFetchingCommits}
                    />
                    <button
                        onClick={handleFetchCommits}
                        disabled={isLoading || isFetchingCommits || !gitRepoUrl}
                        className="flex-shrink-0 bg-slate hover:bg-slate/80 disabled:bg-slate/50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-md transition-colors text-sm flex items-center justify-center min-w-[120px]"
                    >
                        {isFetchingCommits ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            'Fetch Commits'
                        )}
                    </button>
                </div>
                {commitError && <p className="text-red-400 mt-2 text-sm">{commitError}</p>}
            </div>
            
            {/* Generate Button */}
            <div className="flex flex-col items-center mt-4">
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !rawTruth || !jobDescription}
                    className="flex items-center justify-center gap-3 bg-primary hover:bg-primary/80 disabled:bg-slate disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-full transition-all duration-300 ease-in-out shadow-lg transform hover:scale-105 w-full"
                >
                    <SparklesIcon />
                    {isLoading ? 'Translating Experience...' : 'Generate Narrative'}
                </button>
                {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
            </div>
        </div>
    );
};
