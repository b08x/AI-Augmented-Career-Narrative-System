
import React from 'react';

export const Header: React.FC = () => {
    return (
        <header className="bg-gray-dark shadow-md p-4 sticky top-0 z-10 border-b border-gray-medium">
            <div className="container mx-auto text-center">
                <h1 className="text-2xl md:text-3xl font-bold text-brand-secondary">
                    AI-Augmented Career Narrative System
                </h1>
                <p className="text-gray-light mt-1">
                    Translate your authentic experience into a compelling professional story.
                </p>
            </div>
        </header>
    );
};
