
import React, { useCallback, useState } from 'react';
import { VolumeUpIcon } from './icons/VolumeUpIcon';

interface NarrativeCardProps {
    title: string;
    content: string;
    isPrimary?: boolean;
}

export const NarrativeCard: React.FC<NarrativeCardProps> = ({ title, content, isPrimary = false }) => {
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

        const utterance = new SpeechSynthesisUtterance(content);
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
    }, [content, isSpeaking]);

    const cardClasses = isPrimary 
        ? "bg-brand-dark/50 border-2 border-brand-secondary shadow-2xl transform scale-105" 
        : "bg-gray-medium/50 border border-brand-dark/50";

    return (
        <div className={`rounded-xl p-6 flex flex-col transition-all duration-300 ${cardClasses}`}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-brand-secondary">{title}</h3>
                <button 
                    onClick={handleSpeak} 
                    title={isSpeaking ? "Stop Speaking" : "Read Aloud"}
                    className={`p-2 rounded-full transition-colors ${isSpeaking ? 'bg-red-500' : 'bg-brand-secondary hover:bg-brand-primary'}`}
                >
                    <VolumeUpIcon />
                </button>
            </div>
            <div className="prose prose-invert prose-p:text-brand-light/90 prose-p:my-2 overflow-y-auto max-h-96 flex-grow">
                {content.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph || '\u00A0'}</p> 
                ))}
            </div>
        </div>
    );
};
