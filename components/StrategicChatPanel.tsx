import React, { useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { BotIcon } from './icons/BotIcon';

interface ChatWindowProps {
    title: string;
    messages: ChatMessage[];
    isLoading: boolean;
    titleColor: string;
    Icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

const renderMessage = (text: string) => {
    return text.split('\n').map((line, index) => <p key={index}>{line || '\u00A0'}</p>);
};

const ChatWindow: React.FC<ChatWindowProps> = ({ title, messages, isLoading, titleColor, Icon }) => {
    const chatEndRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    return (
        <div className="bg-background/50 border border-slate/50 rounded-xl p-4 flex flex-col flex-grow">
            <div className="flex items-center mb-4">
                <h3 className={`text-xl font-bold ${titleColor}`}>{title}</h3>
            </div>
            <div className="overflow-y-auto flex-grow pr-2 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-charcoal flex-shrink-0 flex items-center justify-center mt-1">
                            <Icon className={`h-5 w-5 ${titleColor}`} />
                        </div>
                        <div className="flex flex-col items-start">
                            <div className="bg-charcoal rounded-lg p-3 max-w-full text-sm text-text-secondary prose prose-invert prose-p:my-1">
                                {renderMessage(msg.text)}
                            </div>
                            {msg.timestamp && (
                                <p className="text-xs text-slate/70 mt-1">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-charcoal flex-shrink-0 flex items-center justify-center mt-1">
                            <Icon className={`h-5 w-5 ${titleColor}`} />
                        </div>
                        <div className="bg-charcoal rounded-lg p-3">
                            <div className="flex items-center gap-2 h-5">
                                <span className="w-2 h-2 bg-slate rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-slate rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                <span className="w-2 h-2 bg-slate rounded-full animate-bounce [animation-delay:0.4s]"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>
        </div>
    );
};


interface StrategicChatPanelProps {
    oliverChat: ChatMessage[];
    steveChat: ChatMessage[];
    onSendOliver: (message: string) => void;
    onSendSteve: (message: string) => void;
    isLoading: boolean;
    automatedAnalysis: boolean;
    onToggleAutomatedAnalysis: () => void;
}

export const StrategicChatPanel: React.FC<StrategicChatPanelProps> = ({ oliverChat, steveChat, isLoading, automatedAnalysis, onToggleAutomatedAnalysis }) => {
    return (
        <div className="bg-charcoal rounded-lg p-6 animate-fade-in h-full flex flex-col border border-slate/50">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-center text-text-primary">Strategic Analysis</h2>
                <div className="flex items-center space-x-2">
                    <label htmlFor="automated-analysis" className="text-sm text-slate">Auto-React</label>
                    <button
                        role="switch"
                        aria-checked={automatedAnalysis}
                        id="automated-analysis"
                        onClick={onToggleAutomatedAnalysis}
                        className={`${automatedAnalysis ? 'bg-primary' : 'bg-slate/50'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                    >
                        <span className={`${automatedAnalysis ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}/>
                    </button>
                </div>
            </div>
            <div className="flex flex-col gap-6 flex-grow">
                <ChatWindow
                    title="Strategic Strengths"
                    messages={oliverChat}
                    isLoading={isLoading}
                    titleColor="text-mint"
                    Icon={BotIcon}
                />
                <ChatWindow
                    title="Pragmatic Viewpoint"
                    messages={steveChat}
                    isLoading={isLoading}
                    titleColor="text-slate"
                    Icon={BotIcon}
                />
            </div>
        </div>
    );
};
