import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { BotIcon } from './icons/BotIcon';
import { UserIcon } from './icons/UserIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { StopIcon } from './icons/StopIcon';
import { UploadIcon } from './icons/UploadIcon';
import { SendIcon } from './icons/SendIcon';
import { useResume } from '../contexts/ResumeContext';

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const renderMessageContent = (text: string) => {
    return text.split('\n').map((line, index) => {
        if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
            return <li key={index} className="ml-4 list-disc">{line.substring(2)}</li>;
        }
        if (line.trim().startsWith('1.') || line.trim().startsWith('2.') || line.trim().startsWith('3.')) {
            return <li key={index} className="ml-4 list-decimal">{line.substring(line.indexOf(' '))}</li>
        }
        return <p key={index} className="my-1">{line || '\u00A0'}</p>;
    });
};

const AutosizeTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => {
    const ref = useRef<HTMLTextAreaElement>(null);
    const { value } = props;

    useEffect(() => {
        const textarea = ref.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [value]);

    return <textarea ref={ref} {...props} />;
};


export const ResumeFeedbackPanel: React.FC = () => {
    const {
        resumeText,
        resumeFeedback: feedback,
        isFeedbackLoading: isLoading,
        handleInitialResumeAnalysis: onInitialAnalysis,
        handleSendFeedbackMessage: onSendMessage,
        selectedFeedbackIds,
        handleToggleFeedbackSelection: onToggleFeedbackSelection,
        feedbackContext,
        handleFeedbackContextChange: onFeedbackContextChange,
        isDrafting,
        handleUpdateResumeDraft: onUpdateDraft
    } = useResume();

    const panelEndRef = useRef<HTMLDivElement>(null);
    const [chatInput, setChatInput] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            const recognition = recognitionRef.current;
            recognition.continuous = true;
            recognition.interimResults = true;

            recognition.onstart = () => setIsRecording(true);
            recognition.onend = () => setIsRecording(false);
            recognition.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                setIsRecording(false);
            };
            recognition.onresult = (event: any) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    setChatInput(prev => (prev ? prev + ' ' : '') + finalTranscript);
                }
            };
        }
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const toggleRecording = useCallback(() => {
        const recognition = recognitionRef.current;
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

    const handleContentFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                setChatInput(prev => prev ? `${prev}\n\n--- FILE: ${file.name} ---\n${text}` : text);
            };
            reader.readAsText(file);
        }
        event.target.value = '';
    };

    const handleSend = () => {
        if (chatInput.trim()) {
            onSendMessage(chatInput);
            setChatInput('');
        }
    };

    useEffect(() => {
        panelEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [feedback, isLoading]);


    if (!resumeText) {
        return (
            <div className="bg-charcoal rounded-lg p-6 border border-slate/50 flex flex-col items-center justify-center text-center">
                <h3 className="text-lg font-semibold text-slate">Resume Feedback</h3>
                <p className="text-text-secondary mt-2">Upload your resume to enable AI-powered feedback and analysis.</p>
            </div>
        );
    }

    if (feedback.length === 0) {
        return (
            <div className="bg-charcoal rounded-lg p-6 border border-slate/50 flex flex-col items-center justify-center text-center">
                <h3 className="text-lg font-semibold text-slate">Ready for Feedback?</h3>
                <p className="text-text-secondary mt-2 mb-4">Analyze your resume against the generated narrative to find gaps and opportunities.</p>
                <button
                    onClick={onInitialAnalysis}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 bg-slate hover:bg-slate/80 disabled:bg-slate/50 text-white font-bold py-2 px-4 rounded-full transition-colors"
                >
                    <SparklesIcon className="h-5 w-5" />
                    {isLoading ? 'Analyzing...' : 'Analyze Resume'}
                </button>
            </div>
        );
    }

    return (
        <div className="bg-charcoal rounded-lg p-6 border border-slate/50 flex flex-col h-full max-h-[800px]">
            <h3 className="text-lg font-semibold text-slate mb-4 text-center">Interactive Resume Feedback</h3>
            <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                 {feedback.map((msg) => (
                    <div key={msg.id} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                         {msg.role === 'model' && (
                            <div className={`p-4 rounded-xl transition-all duration-300 w-full ${selectedFeedbackIds.has(msg.id) ? 'bg-primary/20 border-primary' : 'bg-background/50 border-slate/50'} border`}>
                                <div className="flex items-start gap-4">
                                    <input
                                        type="checkbox"
                                        id={`feedback-${msg.id}`}
                                        checked={selectedFeedbackIds.has(msg.id)}
                                        onChange={() => onToggleFeedbackSelection(msg.id)}
                                        className="mt-1 h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer flex-shrink-0"
                                    />
                                    <div className="flex-grow">
                                        <label htmlFor={`feedback-${msg.id}`} className="cursor-pointer">
                                            <div className="flex items-start gap-2">
                                                <BotIcon className="h-6 w-6 text-mint flex-shrink-0" />
                                                <div className="text-text-secondary text-sm prose prose-invert max-w-none prose-p:my-0 prose-li:my-0">
                                                    {renderMessageContent(msg.text)}
                                                </div>
                                            </div>
                                        </label>
                                        {selectedFeedbackIds.has(msg.id) && (
                                            <div className="mt-3 animate-fade-in">
                                                <AutosizeTextarea
                                                    value={feedbackContext[msg.id] || ''}
                                                    onChange={(e) => onFeedbackContextChange(msg.id, e.target.value)}
                                                    placeholder="Add context for the AI (optional)..."
                                                    className="w-full text-sm p-2 bg-background/50 border border-slate/50 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors placeholder:text-text-secondary resize-none overflow-y-hidden"
                                                    rows={2}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        {msg.role === 'user' && (
                           <div className="flex items-start gap-2 max-w-[80%]">
                                <div className="bg-primary/80 rounded-lg p-3 text-sm text-white prose prose-invert max-w-none prose-p:my-0">
                                    {renderMessageContent(msg.text)}
                                </div>
                                <UserIcon className="h-6 w-6 text-slate flex-shrink-0"/>
                           </div>
                        )}
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex justify-center items-center p-4">
                       <div className="flex items-center gap-2 text-mint">
                           <span className="w-2 h-2 bg-mint rounded-full animate-bounce"></span>
                           <span className="w-2 h-2 bg-mint rounded-full animate-bounce [animation-delay:0.2s]"></span>
                           <span className="w-2 h-2 bg-mint rounded-full animate-bounce [animation-delay:0.4s]"></span>
                           <p>Getting more feedback...</p>
                       </div>
                   </div>
                )}
                <div ref={panelEndRef} />
            </div>
             <div className="mt-4 border-t border-slate/50 pt-4 flex flex-col gap-2">
                 <div className="relative">
                     <AutosizeTextarea
                         value={chatInput}
                         onChange={(e) => setChatInput(e.target.value)}
                         onKeyDown={(e) => {
                             if (e.key === 'Enter' && !e.shiftKey) {
                                 e.preventDefault();
                                 handleSend();
                             }
                         }}
                         placeholder="Ask for more feedback or provide context..."
                         className="w-full text-sm p-3 pr-24 bg-background/50 border border-slate/50 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors placeholder:text-text-secondary resize-none overflow-y-hidden"
                         rows={2}
                     />
                     <div className="absolute top-1/2 -translate-y-1/2 right-3 flex items-center gap-1">
                         <button onClick={toggleRecording} disabled={!recognitionRef.current} title={isRecording ? "Stop" : "Record"} className={`p-2 rounded-full transition-colors ${isRecording ? 'bg-primary text-white animate-pulse' : 'bg-slate/50 hover:bg-slate/70 text-text-primary'}`}>
                             {isRecording ? <StopIcon /> : <MicrophoneIcon />}
                         </button>
                         <label htmlFor="feedback-file-upload" className="cursor-pointer p-2 rounded-full bg-slate/50 hover:bg-slate/70 text-text-primary" title="Upload File">
                             <UploadIcon />
                         </label>
                         <input id="feedback-file-upload" type="file" className="hidden" onChange={handleContentFileChange} accept=".js,.jsx,.ts,.tsx,.py,.rb,.sh,.md,.txt" />
                     </div>
                 </div>
                 <button
                    onClick={handleSend}
                    disabled={isLoading || !chatInput.trim()}
                    className="w-full flex items-center justify-center gap-2 bg-slate hover:bg-slate/80 disabled:bg-slate/50 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                 >
                     <SendIcon className="h-5 w-5"/> Send
                 </button>
            </div>
            <div className="mt-4 border-t border-slate/50 pt-4">
                <button
                    onClick={onUpdateDraft}
                    disabled={isDrafting || selectedFeedbackIds.size === 0}
                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/80 disabled:bg-slate disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-full transition-colors"
                >
                    {isDrafting ? (
                        <>
                           <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                           <span>Generating New Draft...</span>
                        </>
                    ) : (
                        <>
                            <SparklesIcon className="h-5 w-5" />
                            Update Resume Draft ({selectedFeedbackIds.size} selected)
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
