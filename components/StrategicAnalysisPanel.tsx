import React from 'react';
import type { StrategicAnalysis } from '../types';
import { BrainIcon } from './icons/BrainIcon';
import { FireIcon } from './icons/FireIcon';

interface StrategicAnalysisPanelProps {
    analysis: StrategicAnalysis;
}

export const StrategicAnalysisPanel: React.FC<StrategicAnalysisPanelProps> = ({ analysis }) => {
    return (
        <div className="bg-charcoal rounded-lg p-6 animate-fade-in h-full flex flex-col border border-slate/50">
            <h2 className="text-2xl font-bold text-center text-text-primary mb-6">Strategic Analysis</h2>
            <div className="flex flex-col gap-6 flex-grow">
                {/* Oliver's Perspective */}
                <div className="bg-background/50 border border-slate/50 rounded-xl p-6 flex flex-col flex-grow">
                     <div className="flex items-center gap-3 mb-4">
                        <BrainIcon className="h-8 w-8 text-mint" />
                        <h3 className="text-xl font-bold text-mint">Strategic Strengths Analysis</h3>
                    </div>
                    <div className="prose prose-invert prose-p:text-text-secondary prose-p:my-2 overflow-y-auto max-h-96 flex-grow">
                        {analysis.oliversPerspective.split('\n').map((p, i) => <p key={i}>{p || '\u00A0'}</p>)}
                    </div>
                </div>

                {/* Steve's Perspective */}
                <div className="bg-background/50 border border-slate/50 rounded-xl p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-3 mb-4">
                        <FireIcon className="h-8 w-8 text-slate" />
                        <h3 className="text-xl font-bold text-slate">Pragmatic Recruitment Viewpoint</h3>
                    </div>
                    <div className="prose prose-invert prose-p:text-text-secondary prose-p:my-2 overflow-y-auto max-h-96 flex-grow">
                        {analysis.stevesPerspective.split('\n').map((p, i) => <p key={i}>{p || '\u00A0'}</p>)}
                    </div>
                </div>
            </div>
        </div>
    );
};
