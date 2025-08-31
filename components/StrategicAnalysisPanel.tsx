import React from 'react';
import type { StrategicAnalysis } from '../types';
import { BrainIcon } from './icons/BrainIcon';
import { FireIcon } from './icons/FireIcon';

interface StrategicAnalysisPanelProps {
    analysis: StrategicAnalysis;
}

export const StrategicAnalysisPanel: React.FC<StrategicAnalysisPanelProps> = ({ analysis }) => {
    return (
        <div className="bg-gray-medium/20 rounded-lg p-6 mt-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-center text-brand-light mb-6">Strategic Analysis (For Your Sanity)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Oliver's Perspective */}
                <div className="bg-gray-medium/50 border border-brand-dark/50 rounded-xl p-6 flex flex-col">
                     <div className="flex items-center gap-3 mb-4">
                        <BrainIcon className="h-8 w-8 text-brand-secondary" />
                        <h3 className="text-xl font-bold text-brand-secondary">Oliver's Perspective</h3>
                    </div>
                    <div className="prose prose-invert prose-p:text-brand-light/90 prose-p:my-2 overflow-y-auto max-h-96 flex-grow">
                        {analysis.oliversPerspective.split('\n').map((p, i) => <p key={i}>{p || '\u00A0'}</p>)}
                    </div>
                </div>

                {/* Steve's Perspective */}
                <div className="bg-gray-medium/50 border border-brand-dark/50 rounded-xl p-6 flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                        <FireIcon className="h-8 w-8 text-red-400" />
                        <h3 className="text-xl font-bold text-red-400">Steve's Perspective</h3>
                    </div>
                    <div className="prose prose-invert prose-p:text-brand-light/90 prose-p:my-2 overflow-y-auto max-h-96 flex-grow">
                        {analysis.stevesPerspective.split('\n').map((p, i) => <p key={i}>{p || '\u00A0'}</p>)}
                    </div>
                </div>
            </div>
        </div>
    );
};