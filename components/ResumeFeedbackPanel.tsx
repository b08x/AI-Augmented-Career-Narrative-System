import React, { useState, useEffect, useRef } from 'react';
import type { NarrativeOutput, ChatMessage } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { SendIcon } from './icons/SendIcon';
import { UserIcon } from './icons/UserIcon';
import { BotIcon } from './icons/BotIcon';

interface ResumeFeedbackPanelProps {
    narrativeOutput: NarrativeOutput | null;
    resumeText: string;
    feedback: ChatMessage[];
    isLoading: boolean;
    onInitialAnalysis: () => void;
    onSendMessage: (message: string) => void;
}

// A simple markdown-like renderer for lists
const renderMessage = (text: string) => {
    return text.split('\n').map((line, index) => {
        if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
            return <li key={index} className="ml-4 list-disc">{line.substring(2)}</li>;
        }
        if (line.trim().startsWith('1.') || line.trim().startsWith('2.') || line.trim().startsWith('3.')) {
            return <li key={index} className="ml-4 list-decimal">{line.substring(line.indexOf(' '))}</li>
        }
        return <p key={index}>{line || '\u00A0'}</p>;
    });
};

export const ResumeFeedbackPanel: React.FC<ResumeFeedbackPanelProps> = ({
    narrativeOutput,
    resumeText,
    feedback,
    isLoading,
    onInitialAnalysis,
    onSendMessage
}) => {
    const [userInput, setUserInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [feedback, isLoading]);

    const handleSend = () => {
        if (userInput.trim()) {
            onSendMessage(userInput);
            setUserInput('');
        }
    };

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
        <div className="bg-charcoal rounded-lg p-6 border border-slate/50 flex flex-col h-[600px]">
            <h3 className="text-lg font-semibold text-slate mb-4 text-center">Resume Feedback</h3>
            <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                {feedback.map((msg, index) => (
                    <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'model' && <BotIcon className="h-8 w-8 text-mint flex-shrink-0" />}
                        <div className={`rounded-lg p-3 max-w-sm md:max-w-md lg:max-w-lg ${msg.role === 'user' ? 'bg-slate text-white' : 'bg-background/50 text-text-secondary'}`}>
                            {renderMessage(msg.text)}
                        </div>
                        {msg.role === 'user' && <UserIcon className="h-8 w-8 text-slate flex-shrink-0" />}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex gap-3">
                        <BotIcon className="h-8 w-8 text-mint flex-shrink-0" />
                        <div className="rounded-lg p-3 bg-background/50 text-text-secondary">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-mint rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-mint rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                <span className="w-2 h-2 bg-mint rounded-full animate-bounce [animation-delay:0.4s]"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>
            <div className="mt-4 flex gap-2 items-center border-t border-slate/50 pt-4">
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask a follow-up question..."
                    className="flex-grow w-full p-3 bg-background/50 border-2 border-slate/50 rounded-full focus:outline-none focus:ring-2 focus:ring-primary transition-colors placeholder:text-text-secondary"
                    disabled={isLoading}
                />
                <button
                    onClick={handleSend}
                    disabled={isLoading || !userInput.trim()}
                    className="p-3 rounded-full bg-primary hover:bg-primary/80 disabled:bg-slate text-white transition-colors flex-shrink-0"
                >
                    <SendIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};
