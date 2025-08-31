import React, { useState, useEffect, useCallback } from 'react';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { StopIcon } from './icons/StopIcon';
import { UploadIcon } from './icons/UploadIcon';

// Fix for line 16: Add SpeechRecognition types to Window object to resolve "Property does not exist" errors.
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

interface InputPanelProps {
    rawTruth: string;
    // Fix for lines 39 and 81: Use correct type for useState setter to allow functional updates.
    setRawTruth: React.Dispatch<React.SetStateAction<string>>;
    jobDescription: string;
    setJobDescription: React.Dispatch<React.SetStateAction<string>>;
    isDisabled: boolean;
}

// Check for SpeechRecognition API
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
    isDisabled,
}) => {
    const [isRecording, setIsRecording] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

        recognition.onstart = () => {
            setIsRecording(true);
        };
        recognition.onend = () => {
            setIsRecording(false);
        };
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
            recognition.stop();
        };
    }, [setRawTruth]);

    return (
        <>
            <div className="bg-gray-medium/50 rounded-lg p-6 shadow-xl flex flex-col h-full">
                <label htmlFor="rawTruth" className="text-lg font-semibold text-brand-light mb-2">
                    1. Describe Your Project or "Raw Truth"
                </label>
                <p className="text-sm text-gray-light mb-4">
                    Explain what you built, why you built it, and the challenges you faced. Be authentic.
                </p>
                <div className="relative flex-grow">
                    <textarea
                        id="rawTruth"
                        value={rawTruth}
                        onChange={(e) => setRawTruth(e.target.value)}
                        placeholder="e.g., 'I built a small script to automate my home lighting because I was tired of flipping switches... It was written in Python and used a cheap Raspberry Pi...'"
                        className="w-full h-full p-4 pr-12 bg-gray-dark/50 border-2 border-brand-dark rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-brand-secondary transition-colors"
                        rows={10}
                        disabled={isDisabled}
                    />
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                        <button
                            onClick={toggleRecording}
                            disabled={isDisabled || !recognition}
                            title={isRecording ? "Stop Recording" : "Start Recording"}
                            className={`p-2 rounded-full transition-colors ${
                                isRecording
                                    ? 'bg-red-500 text-white animate-pulse'
                                    : 'bg-brand-secondary hover:bg-brand-primary text-white'
                            } disabled:bg-gray-500`}
                        >
                            {isRecording ? <StopIcon /> : <MicrophoneIcon />}
                        </button>
                         <label htmlFor="file-upload" className="cursor-pointer p-2 rounded-full bg-brand-secondary hover:bg-brand-primary text-white disabled:bg-gray-500" title="Upload Code File">
                             <UploadIcon />
                         </label>
                         <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".js,.jsx,.ts,.tsx,.py,.rb,.sh,.md,.txt" disabled={isDisabled} />
                    </div>
                </div>
            </div>
            <div className="bg-gray-medium/50 rounded-lg p-6 shadow-xl flex flex-col h-full">
                <label htmlFor="jobDescription" className="text-lg font-semibold text-brand-light mb-2">
                    2. Paste a Target Job Description
                </label>
                <p className="text-sm text-gray-light mb-4">
                    The AI will use this to tailor the narrative and highlight relevant skills.
                </p>
                <div className="flex-grow">
                    <textarea
                        id="jobDescription"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="e.g., 'Seeking a proactive Junior Developer with experience in Python and automation...'"
                        className="w-full h-full p-4 bg-gray-dark/50 border-2 border-brand-dark rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-brand-secondary transition-colors"
                        rows={10}
                        disabled={isDisabled}
                    />
                </div>
            </div>
        </>
    );
};