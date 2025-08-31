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

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h2 className="text-3xl font-bold text-center text-brand-light">Translation Output</h2>
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <NarrativeCard title="Raw Truth (Your Input)" content={rawTruth} />
                    <NarrativeCard 
                        title="Corporate Narrative (For Recruiter)" 
                        content={`${narrativeOutput.corporateNarrative.summary}\n\n**Key Evidence:**\n${narrativeOutput.corporateNarrative.keyEvidence}`}
                        isPrimary 
                    />
                </div>
            </div>
            
            <StrategicAnalysisPanel analysis={narrativeOutput.strategicAnalysis} />
        </div>
    );
};
