import React, { useState } from 'react';
import { InputPanel } from '../components/InputPanel';
import { OutputPanel } from '../components/OutputPanel';
import { ResumeFeedbackPanel } from '../components/ResumeFeedbackPanel';
import { StrategicChatPanel } from '../components/StrategicChatPanel';
import { ResumeEditorPanel } from '../components/ResumeEditorPanel';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../components/icons/ChevronRightIcon';
import { useNarrative } from '../contexts/NarrativeContext';

interface WorkbenchPageProps {
    handleGenerate: () => void;
}

export const WorkbenchPage: React.FC<WorkbenchPageProps> = (props) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { narrativeOutput, isLoading } = useNarrative();

    return (
        <main className="flex-grow max-w-full mx-auto grid grid-cols-12 gap-6 p-6 w-full">
            {/* Left Collapsible Sidebar */}
            <div className={`relative transition-all duration-300 ${isSidebarOpen ? 'col-span-3' : 'col-span-0'}`}>
                <div className={`${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                     <InputPanel
                        handleGenerate={props.handleGenerate}
                        isGenerated={true}
                    />
                </div>
                 <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                    className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-slate hover:bg-primary text-white p-2 rounded-full shadow-lg z-20"
                    aria-label={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
                >
                    {isSidebarOpen ? <ChevronLeftIcon className="h-5 w-5"/> : <ChevronRightIcon className="h-5 w-5"/>}
                </button>
            </div>
            
            {/* Center Workbench */}
            <div className={`transition-all duration-300 ${isSidebarOpen ? 'col-span-12 lg:col-span-5' : 'col-span-12 lg:col-span-7'}`}>
                 <div className="flex flex-col gap-6 h-full">
                    <OutputPanel />
                     {narrativeOutput && !isLoading && (
                        <>
                            <ResumeEditorPanel />
                            <ResumeFeedbackPanel />
                        </>
                     )}
                </div>
            </div>

            {/* Right Strategic Chat Panel */}
            <div className={`transition-all duration-300 ${isSidebarOpen ? 'col-span-12 lg:col-span-4' : 'col-span-12 lg:col-span-5'}`}>
                 {narrativeOutput && !isLoading && (
                    <StrategicChatPanel />
                 )}
            </div>
        </main>
    );
}
