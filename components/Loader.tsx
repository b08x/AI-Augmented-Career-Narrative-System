import React from 'react';

export const Loader: React.FC = () => {
    const messages = [
        "Analyzing non-linear learning paths...",
        "Deconstructing corporate jargon...",
        "Translating raw truth into corporate reality...",
        "Calculating jargon tax...",
        "Highlighting neurodivergent superpowers...",
        "Engaging cynical realist co-pilot...",
        "Consulting strategic philosopher...",
        "Grounding claims in technical evidence...",
    ];

    const [message, setMessage] = React.useState(messages[0]);

    React.useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            index = (index + 1) % messages.length;
            setMessage(messages[index]);
        }, 2500);
        return () => clearInterval(interval);
    }, []);


    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center bg-charcoal rounded-lg h-full">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-lg font-semibold text-text-primary transition-opacity duration-500">{message}</p>
        </div>
    );
};
