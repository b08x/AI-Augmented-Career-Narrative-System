
import React from 'react';
import { InputPanel } from '../components/InputPanel';

interface InputPageProps {
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
    error: string | null;
    handleGenerate: () => void;
}

export const InputPage: React.FC<InputPageProps> = (props) => {
    return (
        <main className="flex-grow max-w-screen-lg mx-auto p-6 w-full flex items-center justify-center">
            <div className="w-full">
                <InputPanel {...props} error={props.error} />
            </div>
        </main>
    );
};
