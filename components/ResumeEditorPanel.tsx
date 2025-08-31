
import React from 'react';
import { UndoIcon } from './icons/UndoIcon';

interface ResumeEditorPanelProps {
    editedResume: string;
    onResumeEdit: (newText: string) => void;
    onUndo: () => void;
    canUndo: boolean;
}

export const ResumeEditorPanel: React.FC<ResumeEditorPanelProps> = ({ editedResume, onResumeEdit, onUndo, canUndo }) => {
    
    const handleFinalize = () => {
        // In a real app, this might save or download the file.
        alert("Resume draft finalized! (In a real app, this would save/download)");
        console.log("Final Resume Content:\n", editedResume);
    };

    return (
        <div className="bg-charcoal rounded-lg p-6 border border-slate/50 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate">Resume Editor</h3>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={onUndo} 
                        disabled={!canUndo} 
                        className="p-2 rounded-full bg-slate hover:bg-slate/80 disabled:bg-slate/50 disabled:cursor-not-allowed"
                        title="Undo"
                    >
                        <UndoIcon className="h-5 w-5 text-white" />
                    </button>
                     <button
                        onClick={handleFinalize}
                        className="bg-primary hover:bg-primary/80 text-white font-semibold py-2 px-4 rounded-md transition-colors text-sm"
                    >
                        Finalize Draft
                    </button>
                </div>
            </div>
            <textarea
                value={editedResume}
                onChange={(e) => onResumeEdit(e.target.value)}
                placeholder="Your resume text will appear here for editing..."
                className="w-full h-full min-h-[300px] p-4 bg-background/50 border-2 border-slate/50 rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-primary transition-colors placeholder:text-text-secondary font-mono text-sm"
            />
        </div>
    );
};
