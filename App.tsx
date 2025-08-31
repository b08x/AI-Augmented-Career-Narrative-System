import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { InputPage } from './pages/InputPage';
import { WorkbenchPage } from './pages/WorkbenchPage';
import { NarrativeProvider, useNarrative } from './contexts/NarrativeContext';
import { ResumeProvider, useResume } from './contexts/ResumeContext';

const AppContent: React.FC = () => {
    // App view state
    const [view, setView] = useState<'input' | 'workbench'>('input');
    
    // Get state and handlers from contexts
    const { handleGenerate: contextHandleGenerate } = useNarrative();
    const { resumeText, resetResumeState } = useResume();

    // This is the primary orchestrator function.
    const handleGenerate = useCallback(async () => {
        // Immediately switch to the workbench view to show the loader.
        setView('workbench');

        // Reset state in the resume context before starting a new generation.
        resetResumeState();
        
        // Call the narrative context's handleGenerate. It will manage its own state.
        await contextHandleGenerate(resumeText);
    }, [contextHandleGenerate, resumeText, resetResumeState, setView]);


    return (
        <div className="min-h-screen bg-background text-text-primary font-sans flex flex-col">
            <Header />
            
            {view === 'input' ? (
                <InputPage handleGenerate={handleGenerate} />
            ) : (
                <WorkbenchPage handleGenerate={handleGenerate} />
            )}

            <footer className="text-center p-4 text-slate text-sm">
                <p>Built with React, Tailwind, and the Gemini API.</p>
            </footer>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <NarrativeProvider>
            <ResumeProvider>
                <AppContent />
            </ResumeProvider>
        </NarrativeProvider>
    );
};

export default App;