
import React from 'react';
import type { NarrativeOutput } from '../types';
import { Loader } from './Loader';
import { NarrativeCard } from './NarrativeCard';

interface OutputPanelProps {
    isLoading: boolean;
    narrativeOutput: NarrativeOutput | null;
    rawTruth: string;
}

// Simple markdown parser for bold text
const renderWithBold = (text: string) => {
    return text.split(/(\*\*.*?\*\*)/g).map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        return part;
    });
};


export const OutputPanel: React.FC<OutputPanelProps> = ({ isLoading, narrativeOutput, rawTruth }) => {
    if (isLoading) {
        return <Loader />;
    }

    if (!narrativeOutput) {
        return (
          <div className="text-center p-8 bg-gray-medium/20 rounded-lg h-full flex flex-col justify-center">
            <h2 className="text-xl font-semibold text-gray-light">Your translated narrative will appear here.</h2>
            <p className="text-gray-light/80 mt-2">Fill in your details, then click "Generate Narrative" to begin.</p>
          </div>
        );
    }

    const corporateNarrativeText = `${narrativeOutput.corporateNarrative.summary}\n\nKey Experience Breakdown:\n` +
        narrativeOutput.corporateNarrative.keyExperienceBreakdown.map(p =>
            `Literal Description: ${p.rawTruth}. Corporate Framing: ${p.corporateFraming}. Meta-Commentary: ${p.metaCommentary}.`
        ).join('\n');

    return (
        <div className="space-y-6 animate-fade-in h-full">
            <NarrativeCard title="Literal Description (Your Input)" speakableText={rawTruth}>
                 {rawTruth.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph ? renderWithBold(paragraph) : '\u00A0'}</p> 
                ))}
            </NarrativeCard>
            <NarrativeCard 
                title="Generated Corporate Narrative" 
                isPrimary 
                speakableText={corporateNarrativeText}
            >
                <p>{renderWithBold(narrativeOutput.corporateNarrative.summary)}</p>
                
                <h4 className="text-lg font-semibold mt-6 mb-4 text-brand-light/90">Key Experience Breakdown:</h4>
                <div className="space-y-4">
                    {narrativeOutput.corporateNarrative.keyExperienceBreakdown.map((point, index) => (
                        <div key={index} className="border-l-4 border-brand-secondary/50 pl-4 py-2 bg-gray-dark/40 rounded-r-lg text-sm">
                            <p><strong className="text-gray-light font-medium">Literal Description:</strong> {point.rawTruth}</p>
                            <p className="mt-1"><strong className="text-brand-light font-medium">Corporate Framing:</strong> <span className="text-brand-light/90">{point.corporateFraming}</span></p>
                            <p className="mt-1"><strong className="text-red-400 font-medium">Meta-Commentary:</strong> <em className="text-red-400/90">{point.metaCommentary}</em></p>
                        </div>
                    ))}
                </div>
            </NarrativeCard>
        </div>
    );
};
