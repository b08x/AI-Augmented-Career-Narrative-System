
import React, { useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { BotIcon } from './icons/BotIcon';

interface ResumeFeedbackPanelProps {
    resumeText: string;
    feedback: ChatMessage[];
    isLoading: boolean;
    onInitialAnalysis: () => void;
    onSendMessage: (message: string) => void; // Kept for future "add more feedback" functionality
    selectedFeedbackIds: Set<string>;
    onToggleFeedbackSelection: (id: string) => void;
    feedbackContext: Record<string, string>;
    onFeedbackContextChange: (id: string, context: string) => void;
    isDrafting: boolean;
    onUpdateDraft: () => void;
}

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


export const ResumeFeedbackPanel: React.FC<ResumeFeedbackPanelProps> = ({
    resumeText,
    feedback,
    isLoading,
    onInitialAnalysis,
    selectedFeedbackIds,
    onToggleFeedbackSelection,
    feedbackContext,
    onFeedbackContextChange,
    isDrafting,
    onUpdateDraft
}) => {
    const panelEndRef = useRef<HTMLDivElement>(null);

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
                {feedback.filter(msg => msg.role === 'model').map((msg) => (
                    <div key={msg.id} className={`p-4 rounded-xl transition-all duration-300 ${selectedFeedbackIds.has(msg.id) ? 'bg-primary/20 border-primary' : 'bg-background/50 border-slate/50'} border`}>
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
                                        <textarea
                                            value={feedbackContext[msg.id] || ''}
                                            onChange={(e) => onFeedbackContextChange(msg.id, e.target.value)}
                                            placeholder="Add context for the AI (optional)..."
                                            className="w-full text-sm p-2 bg-background/50 border border-slate/50 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors placeholder:text-text-secondary"
                                            rows={2}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
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
