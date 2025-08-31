import React from 'react';

export const Header: React.FC = () => {
    return (
        <header className="bg-background shadow-md p-4 sticky top-0 z-10 border-b border-charcoal">
            <div className="container mx-auto text-center">
                <h1 className="text-2xl md:text-3xl font-bold text-primary">
                    AI-Augmented Career Narrative System
                </h1>
                <p className="text-slate mt-1">
                    Translate raw truth into corporate reality—without losing the plot.
                </p>
            </div>
        </header>
    );
};
