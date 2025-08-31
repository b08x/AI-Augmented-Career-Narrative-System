import React from 'react';
import { InputPanel } from '../components/InputPanel';

interface InputPageProps {
    handleGenerate: () => void;
}

export const InputPage: React.FC<InputPageProps> = (props) => {
    return (
        <main className="flex-grow max-w-screen-lg mx-auto p-6 w-full flex items-center justify-center">
            <div className="w-full">
                <InputPanel {...props} />
            </div>
        </main>
    );
};
