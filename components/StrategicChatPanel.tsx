
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
        <div className="bg-background/50 border border-slate/50 rounded-xl p-4 flex flex-col flex-grow h-1/2">
            <div className="flex items-center gap-3 mb-4">
                <Icon className={`h-8 w-8 ${titleColor}`} />
                <h3 className={`text-xl font-bold ${titleColor}`}>{title}</h3>
            </div>
            <div className="prose prose-invert prose-p:text-text-secondary prose-p:my-2 overflow-y-auto max-h-96 flex-grow pr-2">
                {messages.map((msg, index) => (
                    <div key={index} className="flex gap-3 mb-2">
                        <div className="rounded-lg max-w-full">
                            {renderMessage(msg.text)}
                        </div>
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-slate rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-slate rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-2 h-2 bg-slate rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>
            {/* Input removed for now as chat is reactive */}
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
