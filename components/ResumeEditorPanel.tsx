import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UndoIcon } from './icons/UndoIcon';

interface ResumeEditorPanelProps {
    editedResume: string;
    previousResume: string;
    onResumeEdit: (newText: string) => void;
    onUndo: () => void;
    canUndo: boolean;
}

const DiffView: React.FC<{ oldText: string; newText: string }> = ({ oldText, newText }) => {
    const diff = useMemo(() => {
        const oldLines = oldText.split('\n');
        const newLines = newText.split('\n');
        const diffResult = [];
        const matrix = Array(oldLines.length + 1).fill(null).map(() => Array(newLines.length + 1).fill(0));

        for (let i = 1; i <= oldLines.length; i++) {
            for (let j = 1; j <= newLines.length; j++) {
                if (oldLines[i - 1] === newLines[j - 1]) {
                    matrix[i][j] = matrix[i - 1][j - 1] + 1;
                } else {
                    matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
                }
            }
        }

        let i = oldLines.length;
        let j = newLines.length;

        while (i > 0 || j > 0) {
            if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
                diffResult.unshift({ type: 'common', line: oldLines[i - 1] });
                i--;
                j--;
            } else if (j > 0 && (i === 0 || matrix[i][j - 1] >= matrix[i - 1][j])) {
                diffResult.unshift({ type: 'added', line: newLines[j - 1] });
                j--;
            } else if (i > 0 && (j === 0 || matrix[i][j - 1] < matrix[i - 1][j])) {
                diffResult.unshift({ type: 'removed', line: oldLines[i - 1] });
                i--;
            } else {
                break;
            }
        }
        return diffResult;
    }, [oldText, newText]);

    return (
        <pre className="w-full h-full min-h-[300px] p-4 bg-background/50 border-2 border-slate/50 rounded-md whitespace-pre-wrap font-mono text-sm overflow-y-auto">
            {diff.map((item, index) => {
                const style = {
                    'added': 'bg-mint/20 text-text-primary',
                    'removed': 'bg-primary/20 text-text-secondary line-through',
                    'common': 'bg-transparent text-text-secondary'
                }[item.type];
                const prefix = {
                    'added': '+ ',
                    'removed': '- ',
                    'common': '  '
                }[item.type];
                return (
                    <div key={index} className={`${style} transition-colors`}>
                        <span className="select-none mr-2">{prefix}</span>
                        <span>{item.line || '\u00A0'}</span>
                    </div>
                );
            })}
        </pre>
    );
};

const useAutosizeTextArea = (
  textAreaRef: HTMLTextAreaElement | null,
  value: string
) => {
  useEffect(() => {
    if (textAreaRef) {
      textAreaRef.style.height = 'auto';
      textAreaRef.style.height = `${textAreaRef.scrollHeight}px`;
    }
  }, [textAreaRef, value]);
};


export const ResumeEditorPanel: React.FC<ResumeEditorPanelProps> = ({ editedResume, previousResume, onResumeEdit, onUndo, canUndo }) => {
    const [viewMode, setViewMode] = useState<'edit' | 'diff'>('edit');
    const editorRef = useRef<HTMLTextAreaElement>(null);
    
    useAutosizeTextArea(editorRef.current, editedResume);

    useEffect(() => {
        // When a new draft is generated, switch to diff view to show changes
        if (previousResume !== editedResume) {
            setViewMode('diff');
        }
    }, [editedResume, previousResume]);

    const handleFinalize = () => {
        const blob = new Blob([editedResume], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = "resume_draft.txt";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="bg-charcoal rounded-lg p-6 border border-slate/50 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate">Resume Editor</h3>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setViewMode(viewMode === 'edit' ? 'diff' : 'edit')}
                        disabled={previousResume === editedResume}
                        className="bg-slate hover:bg-slate/80 text-white font-semibold py-2 px-4 rounded-md transition-colors text-sm disabled:bg-slate/50 disabled:cursor-not-allowed"
                        title={viewMode === 'edit' ? 'View Changes' : 'Edit Resume'}
                    >
                        {viewMode === 'edit' ? 'View Changes' : 'Edit Resume'}
                    </button>
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
                        Download Draft
                    </button>
                </div>
            </div>
            {viewMode === 'edit' ? (
                <textarea
                    ref={editorRef}
                    rows={1}
                    value={editedResume}
                    onChange={(e) => onResumeEdit(e.target.value)}
                    placeholder="Your resume text will appear here for editing..."
                    className="w-full min-h-[300px] p-4 bg-background/50 border-2 border-slate/50 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary transition-colors placeholder:text-text-secondary font-mono text-sm overflow-y-hidden"
                />
            ) : (
                <DiffView oldText={previousResume} newText={editedResume} />
            )}
        </div>
    );
};