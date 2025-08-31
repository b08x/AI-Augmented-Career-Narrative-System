
import React from 'react';

export const Loader: React.FC = () => {
    const messages = [
        "Analyzing non-linear learning paths...",
        "Deconstructing corporate jargon...",
        "Finding the signal in the noise...",
        "Grounding claims in technical evidence...",
        "Bridging authenticity and legibility...",
        "Generating compelling narrative...",
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
        <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center bg-gray-medium/20 rounded-lg">
            <div className="w-16 h-16 border-4 border-brand-secondary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-lg font-semibold text-brand-light transition-opacity duration-500">{message}</p>
        </div>
    );
};
