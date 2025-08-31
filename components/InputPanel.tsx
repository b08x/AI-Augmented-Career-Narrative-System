
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
        <div className="bg-gray-medium/50 rounded-lg p-6 shadow-xl flex flex-col gap-6 h-full">
            {/* Literal Description */}
            <div className="flex flex-col h-full">
                <label htmlFor="rawTruth" className="text-lg font-semibold text-brand-light mb-2">
                    Literal Description
                </label>
                <p className="text-sm text-gray-light mb-4">
                    Explain what you built, why you built it, and the challenges you faced.
                </p>
                <div className="relative flex-grow min-h-[200px]">
                    <textarea
                        id="rawTruth"
                        value={rawTruth}
                        onChange={(e) => setRawTruth(e.target.value)}
                        placeholder="e.g., 'I built a small script to automate my home lighting...'"
                        className="w-full h-full p-4 pr-12 bg-gray-dark/50 border-2 border-brand-dark rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-brand-secondary transition-colors"
                        disabled={isLoading}
                    />
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                        <button onClick={toggleRecording} disabled={isLoading || !recognition} title={isRecording ? "Stop Recording" : "Start Recording"} className={`p-2 rounded-full transition-colors ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-brand-secondary hover:bg-brand-primary text-white'} disabled:bg-gray-500`}>
                            {isRecording ? <StopIcon /> : <MicrophoneIcon />}
                        </button>
                         <label htmlFor="file-upload" className="cursor-pointer p-2 rounded-full bg-brand-secondary hover:bg-brand-primary text-white" title="Upload Code File">
                             <UploadIcon />
                         </label>
                         <input id="file-upload" type="file" className="hidden" onChange={handleContentFileChange} accept=".js,.jsx,.ts,.tsx,.py,.rb,.sh,.md,.txt" disabled={isLoading} />
                    </div>
                </div>
            </div>

            {/* Target Job Description */}
            <div className="flex flex-col h-full">
                <label htmlFor="jobDescription" className="text-lg font-semibold text-brand-light mb-2">
                    Target Job Description
                </label>
                <div className="flex-grow min-h-[200px]">
                    <textarea
                        id="jobDescription"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="e.g., 'Seeking a proactive Junior Developer with experience in Python...'"
                        className="w-full h-full p-4 bg-gray-dark/50 border-2 border-brand-dark rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-brand-secondary transition-colors"
                        disabled={isLoading}
                    />
                </div>
            </div>

            {/* Professional Profile */}
            <div>
                 <label className="text-lg font-semibold text-brand-light mb-2">
                    Professional Profile (Optional)
                </label>
                <div className="mt-2 space-y-4">
                     <label htmlFor="resume-upload" className="w-full text-sm flex items-center justify-center gap-2 bg-gray-dark/50 border-2 border-dashed border-brand-dark rounded-md p-3 text-gray-light hover:border-brand-secondary hover:text-white transition-colors cursor-pointer">
                         <UploadIcon />
                         {resumeFile ? `${resumeFile.name}` : 'Upload Resume'}
                     </label>
                     <input id="resume-upload" type="file" className="hidden" onChange={handleResumeFileChange} accept=".txt,.md,.pdf" disabled={isLoading} />
                </div>
            </div>

             {/* Project Context */}
            <div>
                 <label htmlFor="gitRepoUrl" className="text-lg font-semibold text-brand-light mb-2">
                    Project Context (Optional)
                </label>
                <input
                    id="gitRepoUrl"
                    type="text"
                    value={gitRepoUrl}
                    onChange={(e) => setGitRepoUrl(e.target.value)}
                    placeholder="Public Git Repository URL"
                    className="w-full mt-2 p-3 bg-gray-dark/50 border-2 border-brand-dark rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary transition-colors"
                    disabled={isLoading}
                />
            </div>
            
            {/* Generate Button */}
            <div className="flex flex-col items-center mt-4">
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !rawTruth || !jobDescription}
                    className="flex items-center justify-center gap-3 bg-brand-secondary hover:bg-brand-primary disabled:bg-gray-medium disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-full transition-all duration-300 ease-in-out shadow-lg transform hover:scale-105 w-full"
                >
                    <SparklesIcon />
                    {isLoading ? 'Translating Experience...' : 'Generate Narrative'}
                </button>
                {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
            </div>
        </div>
    );
};
