import React from 'react';

export const Loader: React.FC = () => {
    // A mix of serious, empowering, and snarky messages
    const initialMessages = React.useMemo(() => [
        "Analyzing non-linear learning paths...",
        "Deconstructing corporate jargon...",
        "Distilling your soul into three bullet points...",
        "Translating raw truth into corporate reality...",
        "Aligning paradigms... whatever that means.",
        "Calculating jargon tax...",
        "Making it sound like you planned it all from the start.",
        "Highlighting neurodivergent superpowers...",
        "Inflating impact metrics by at least 200%.",
        "Engaging cynical realist co-pilot...",
        "Ensuring keywords will appease the algorithm.",
        "Consulting strategic philosopher...",
        "Running bullshit-to-English translation matrix.",
        "Grounding claims in technical evidence...",
        "Excavating for 'key deliverables'...",
        "Polishing the narrative until it's unrecognizable.",
        "Finding the signal in the noise...",
        "Buffering cynicism...",
        "Synthesizing a plausible career trajectory...",
        "Converting 'I winged it' into 'agile methodology'...",
        "Adding 'synergy' just for the hell of it.",
        "Re-contextualizing hyperfixation as 'deep focus'...",
        "Locating the 'why' you conveniently forgot.",
        "Performing linguistic alchemy...",
        "Reticulating splines... and resumes.",
        "Abstracting away the existential dread...",
        "Warning: Narrative may be more competent than you are.",
        "Calibrating imposter syndrome levels...",
    ], []);

    const [message, setMessage] = React.useState(initialMessages[0]);

    React.useEffect(() => {
        // Shuffle the array for a random order each time
        const shuffledMessages = [...initialMessages].sort(() => Math.random() - 0.5);
        let index = 0;
        setMessage(shuffledMessages[index]);

        const interval = setInterval(() => {
            index = (index + 1) % shuffledMessages.length;
            setMessage(shuffledMessages[index]);
        }, 2500);

        return () => clearInterval(interval);
    }, [initialMessages]);


    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center bg-charcoal rounded-lg h-full">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-lg font-semibold text-text-primary transition-opacity duration-500">{message}</p>
        </div>
    );
};