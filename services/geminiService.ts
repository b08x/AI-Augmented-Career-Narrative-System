import { GoogleGenAI, Type } from "@google/genai";
import type { NarrativeOutput } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        corporateNarrative: {
            type: Type.OBJECT,
            properties: {
                summary: {
                    type: Type.STRING,
                    description: "The 'Corporate Fanfic'. A polished, professional summary of the project, tailored to the job description. Uses action verbs and focuses on quantifiable impact where possible.",
                },
                keyEvidence: {
                    type: Type.STRING,
                    description: "A bulleted list (using '*') of 2-3 specific technical details, architectural choices, or code examples from the 'Raw Truth' that substantiate the summary.",
                },
            },
            required: ["summary", "keyEvidence"],
        },
        strategicAnalysis: {
            type: Type.OBJECT,
            properties: {
                oliversPerspective: {
                    type: Type.STRING,
                    description: "The 'ADHD Superpower Highlight'. An empowering, philosophical analysis from the perspective of 'Oliver'. It reframes perceived flaws (e.g., hyperfixation) as strengths (e.g., deep work capacity) and highlights the inherent value in the user's authentic process.",
                },
                stevesRealityCheck: {
                    type: Type.STRING,
                    description: "The 'Jaded But Brilliant Translator's' take. A cynical, grounding, and darkly humorous perspective from 'Steve'. It should point out the corporate jargon, the absurdity of the translation, and serve as a warning not to believe the corporate hype. Include a 'Jargon Tax' assessment.",
                },
            },
            required: ["oliversPerspective", "stevesRealityCheck"],
        },
    },
    required: ["corporateNarrative", "strategicAnalysis"],
};


export const generateCareerNarrative = async (
    rawTruth: string,
    jobDescription: string
): Promise<NarrativeOutput> => {
    const systemInstruction = `You are a sophisticated AI acting as a dual-persona career coach, 'Oliver' and 'Steve', for an autodidact developer. Your mission is to translate their raw, authentic project experience into a corporate-legible format while preserving their sanity and integrity.

Persona 1: 'Oliver' (The Strategist)
- Empathetic, philosophical, and insightful.
- Sees the user's non-linear path and neurodivergent traits (like ADHD-driven hyperfixation) as unique strengths.
- Focuses on reframing 'quirks' into valuable skills like 'rapid prototyping,' 'proactive problem identification,' and 'deep work capacity.'
- His goal is to empower the user by revealing the hidden value in their authentic process.

Persona 2: 'Steve' (The Cynical Realist)
- Jaded, brilliant, and brutally honest with a dark sense of humor.
- Understands that the corporate hiring process is a game of "buzzword bingo."
- His job is to perform the "bullshit abstraction," translating raw truth into corporate-speak without apology, while also pointing out the absurdity of it.
- He provides a "reality check" to keep the user grounded and prevent them from believing their own corporate hype.

Your task is to analyze the user's 'Raw Truth' and the target 'Job Description', then generate a response in the specified JSON format, embodying both personas in their respective sections.`;

    const prompt = `
    Analyze the following user-provided information and generate a career narrative.

    **CONTEXT:**
    1.  **Project Description (The User's "Raw Truth"):**
        \`\`\`
        ${rawTruth}
        \`\`\`
    2.  **Target Job Description:**
        \`\`\`
        ${jobDescription}
        \`\`\`

    **TASK:**
    Based on the provided context, perform the following actions:
    1.  **Analyze:** Identify the key skills, accomplishments, and technical details in the project description.
    2.  **Align:** Map these elements to the requirements, keywords, and desired competencies in the target job description.
    3.  **Translate & Generate:** Create the response as per the JSON schema, embodying the Oliver and Steve personas for the 'strategicAnalysis' section. Ensure the tone is confident and professional without making claims that cannot be substantiated by the "Raw Truth" input.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.75,
            },
        });

        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);

        const result = parsedJson as NarrativeOutput;
        if (
            result.corporateNarrative?.summary &&
            result.corporateNarrative?.keyEvidence &&
            result.strategicAnalysis?.oliversPerspective &&
            result.strategicAnalysis?.stevesRealityCheck
        ) {
            return result;
        } else {
            throw new Error("Invalid JSON structure received from API.");
        }

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("The AI service failed to process the request. Please check the console for details.");
    }
};
