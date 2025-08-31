import React, { useCallback, useState } from 'react';
import { VolumeUpIcon } from './icons/VolumeUpIcon';

interface NarrativeCardProps {
    title: string;
    children: React.ReactNode;
    speakableText: string;
    isPrimary?: boolean;
}

export const NarrativeCard: React.FC<NarrativeCardProps> = ({ title, children, speakableText, isPrimary = false }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);

    const handleSpeak = useCallback(() => {
        if (typeof window === 'undefined' || !window.speechSynthesis) {
            alert('Text-to-speech is not supported in your browser.');
            return;
        }

        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }
        
        const utterance = new SpeechSynthesisUtterance(speakableText);
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
    }, [speakableText, isSpeaking]);

    const cardClasses = isPrimary 
        ? "bg-charcoal border-2 border-primary shadow-2xl transform lg:scale-105" 
        : "bg-charcoal border border-slate/50";

    return (
        <div className={`rounded-xl p-6 flex flex-col transition-all duration-300 ${cardClasses}`}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-primary">{title}</h3>
                <button 
                    onClick={handleSpeak} 
                    title={isSpeaking ? "Stop Speaking" : "Read Aloud"}
                    className={`p-2 rounded-full transition-colors ${isSpeaking ? 'bg-primary' : 'bg-slate hover:bg-slate/80'}`}
                >
                    <VolumeUpIcon />
                </button>
            </div>
            <div className="prose prose-invert prose-p:text-text-secondary prose-p:my-2 overflow-y-auto max-h-[400px] flex-grow">
                {children}
            </div>
        </div>
    );
};
