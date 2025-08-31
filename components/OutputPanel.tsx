import React from 'react';
import type { NarrativeOutput } from '../types';
import { Loader } from './Loader';
import { NarrativeCard } from './NarrativeCard';
import { StrategicAnalysisPanel } from './StrategicAnalysisPanel';

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
          <div className="text-center p-8 bg-gray-medium/20 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-light">Your translated narrative will appear here.</h2>
            <p className="text-gray-light/80 mt-2">Fill in your experience and a job description, then click "Generate Narrative" to begin.</p>
          </div>
        );
    }

    const corporateNarrativeText = `${narrativeOutput.corporateNarrative.summary}\n\nRecruiter Bingo Points:\n` +
        narrativeOutput.corporateNarrative.bingoPoints.map(p =>
            `Raw Truth: ${p.rawTruth}. Corporate Lie: ${p.corporateLie}. Meta-Commentary: ${p.metaCommentary}.`
        ).join('\n');

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h2 className="text-3xl font-bold text-center text-brand-light">Translation Output</h2>
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <NarrativeCard title="Raw Truth (Your Input)" speakableText={rawTruth}>
                         {rawTruth.split('\n').map((paragraph, index) => (
                            <p key={index}>{paragraph ? renderWithBold(paragraph) : '\u00A0'}</p> 
                        ))}
                    </NarrativeCard>
                    <NarrativeCard 
                        title="Corporate Narrative (For Recruiter)" 
                        isPrimary 
                        speakableText={corporateNarrativeText}
                    >
                        <p>{renderWithBold(narrativeOutput.corporateNarrative.summary)}</p>
                        
                        <h4 className="text-lg font-semibold mt-6 mb-4 text-brand-light/90">Recruiter Bingo Points:</h4>
                        <div className="space-y-4">
                            {narrativeOutput.corporateNarrative.bingoPoints.map((point, index) => (
                                <div key={index} className="border-l-4 border-brand-secondary/50 pl-4 py-2 bg-gray-dark/40 rounded-r-lg text-sm">
                                    <p><strong className="text-gray-light font-medium">Raw Truth:</strong> {point.rawTruth}</p>
                                    <p className="mt-1"><strong className="text-brand-light font-medium">Corporate Lie:</strong> <span className="text-brand-light/90">{point.corporateLie}</span></p>
                                    <p className="mt-1"><strong className="text-red-400 font-medium">Meta-Commentary:</strong> <em className="text-red-400/90">{point.metaCommentary}</em></p>
                                </div>
                            ))}
                        </div>
                    </NarrativeCard>
                </div>
            </div>
            
            <StrategicAnalysisPanel analysis={narrativeOutput.strategicAnalysis} />
        </div>
    );
};