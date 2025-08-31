
import React, { useState } from 'react';
import { InputPanel } from '../components/InputPanel';
import { OutputPanel } from '../components/OutputPanel';
import { ResumeFeedbackPanel } from '../components/ResumeFeedbackPanel';
import { StrategicChatPanel } from '../components/StrategicChatPanel';
import { ResumeEditorPanel } from '../components/ResumeEditorPanel';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../components/icons/ChevronRightIcon';
import type { NarrativeOutput, KeyExperience, ChatMessage } from '../types';

// Defining props for WorkbenchPage
interface WorkbenchPageProps {
    // Input Panel Props
    rawTruth: string;
    setRawTruth: React.Dispatch<React.SetStateAction<string>>;
    jobDescription: string;
    setJobDescription: React.Dispatch<React.SetStateAction<string>>;
    gitRepoUrl: string;
    setGitRepoUrl: React.Dispatch<React.SetStateAction<string>>;
    resumeFile: File | null;
    setResumeFile: React.Dispatch<React.SetStateAction<File | null>>;
    setResumeText: React.Dispatch<React.SetStateAction<string>>;
    isLoading: boolean;
    handleGenerate: () => void;
    // Output Panel Props
    narrativeOutput: NarrativeOutput | null;
    onKeyExperienceReorder: (reorderedBreakdown: KeyExperience[]) => void;
    // Resume Feedback Props
    resumeText: string;
    feedback: ChatMessage[];
    isFeedbackLoading: boolean;
    onInitialAnalysis: () => void;
    onSendMessage: (message: string) => void;
    // Resume Editor Props
    editedResume: string;
    onResumeEdit: (newText: string) => void;
    onUndo: () => void;
    canUndo: boolean;
    // Persona Chat Props
    oliverChat: ChatMessage[];
    steveChat: ChatMessage[];
    setOliverChat: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
    setSteveChat: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
    isPersonaLoading: boolean;
    automatedAnalysis: boolean;
    setAutomatedAnalysis: React.Dispatch<React.SetStateAction<boolean>>;
}

export const WorkbenchPage: React.FC<WorkbenchPageProps> = (props) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <main className="flex-grow max-w-full mx-auto grid grid-cols-12 gap-6 p-6 w-full">
            {/* Left Collapsible Sidebar */}
            <div className={`relative transition-all duration-300 ${isSidebarOpen ? 'col-span-3' : 'col-span-0'}`}>
                <div className={`${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                     <InputPanel
                        rawTruth={props.rawTruth}
                        setRawTruth={props.setRawTruth}
                        jobDescription={props.jobDescription}
                        setJobDescription={props.setJobDescription}
                        gitRepoUrl={props.gitRepoUrl}
                        setGitRepoUrl={props.setGitRepoUrl}
                        resumeFile={props.resumeFile}
                        setResumeFile={props.setResumeFile}
                        setResumeText={props.setResumeText}
                        isLoading={props.isLoading}
                        error={null} // Don't show generate error here
                        handleGenerate={props.handleGenerate}
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
                    <OutputPanel 
                        isLoading={props.isLoading} 
                        narrativeOutput={props.narrativeOutput} 
                        rawTruth={props.rawTruth}
                        onKeyExperienceReorder={props.onKeyExperienceReorder}
                    />
                     {props.narrativeOutput && !props.isLoading && (
                        <>
                            <ResumeEditorPanel
                                editedResume={props.editedResume}
                                onResumeEdit={props.onResumeEdit}
                                onUndo={props.onUndo}
                                canUndo={props.canUndo}
                            />
                            <ResumeFeedbackPanel 
                                narrativeOutput={props.narrativeOutput}
                                resumeText={props.resumeText}
                                feedback={props.feedback}
                                isLoading={props.isFeedbackLoading}
                                onInitialAnalysis={props.onInitialAnalysis}
                                onSendMessage={props.onSendMessage}
                            />
                        </>
                     )}
                </div>
            </div>

            {/* Right Strategic Chat Panel */}
            <div className={`transition-all duration-300 ${isSidebarOpen ? 'col-span-12 lg:col-span-4' : 'col-span-12 lg:col-span-5'}`}>
                 {props.narrativeOutput && !props.isLoading && (
                    <StrategicChatPanel
                        oliverChat={props.oliverChat}
                        steveChat={props.steveChat}
                        onSendOliver={() => {}} // Implement direct chat later if needed
                        onSendSteve={() => {}} // Implement direct chat later if needed
                        isLoading={props.isFeedbackLoading}
                        automatedAnalysis={props.automatedAnalysis}
                        onToggleAutomatedAnalysis={() => props.setAutomatedAnalysis(!props.automatedAnalysis)}
                    />
                 )}
            </div>
        </main>
    );
}
