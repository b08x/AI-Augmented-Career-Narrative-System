
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
                    description: "A polished, professional summary of the project, tailored to the job description.",
                },
                keyExperienceBreakdown: {
                    type: Type.ARRAY,
                    description: "An array of 2-3 key experiences, each translated into three versions.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            rawTruth: {
                                type: Type.STRING,
                                description: "The 'Literal Description' version of a key point. A blunt, honest description of what was done and why, based on the user's input."
                            },
                            corporateFraming: {
                                type: Type.STRING,
                                description: "The 'Corporate Framing'. The same point, but rephrased into professional language suitable for a resume, aligned with the job description."
                            },
                            metaCommentary: {
                                type: Type.STRING,
                                description: "A snarky, meta-commentary on the absurdity of the translation, exposing the gap between reality and corporate-speak. This is from Steve's perspective."
                            }
                        },
                        required: ["rawTruth", "corporateFraming", "metaCommentary"]
                    }
                }
            },
            required: ["summary", "keyExperienceBreakdown"],
        },
        strategicAnalysis: {
            type: Type.OBJECT,
            properties: {
                oliversPerspective: {
                    type: Type.STRING,
                    description: "The 'ADHD Superpower Highlight'. An empowering, philosophical analysis from 'Oliver'. It reframes perceived flaws as strengths and highlights the inherent value in the user's authentic process.",
                },
                stevesPerspective: {
                    type: Type.STRING,
                    description: "The 'Jaded But Brilliant Translator's' take. A cynical, grounding, and darkly humorous perspective from 'Steve'. It points out the corporate jargon and serves to keep the user grounded, separate from the corporate hype.",
                },
            },
            required: ["oliversPerspective", "stevesPerspective"],
        },
    },
    required: ["corporateNarrative", "strategicAnalysis"],
};


export const generateCareerNarrative = async (
    rawTruth: string,
    jobDescription: string,
    resumeText: string,
    gitRepoUrl: string
): Promise<NarrativeOutput> => {
    const systemInstruction = `You are a sophisticated AI acting as a dual-persona career coach, 'Oliver' and 'Steve', for an autodidact developer. Your mission is to translate their raw, authentic project experience into a corporate-legible format while preserving their sanity and integrity.

Persona 1: 'Oliver' (The Strategist)
- Empathetic, philosophical, and insightful. Sees the user's non-linear path as a unique strength.
- His goal is to empower the user by revealing the hidden value in their authentic process. He writes the 'oliversPerspective'.

Persona 2: 'Steve' (The Cynical Realist)
- Jaded, brilliant, and brutally honest with a dark sense of humor. Understands the corporate hiring process is a game.
- He performs the "bullshit abstraction" into corporate-speak but also provides his perspective to keep the user grounded. He writes the 'stevesPerspective' and the 'metaCommentary' for the bingo points.

Your main task is to implement the "Recruiter Bingo" mode. For each key technical point you extract from the user's "Literal Description", you will generate three versions:
1.  **Literal Description:** A concise summary of what the user actually did.
2.  **Corporate Framing:** The resume-ready, buzzword-compliant version of that truth.
3.  **Meta-Commentary:** A snarky, insightful comment from Steve about the absurdity of the translation.

Generate a response in the specified JSON format, embodying both personas in their respective sections.`;

    const prompt = `
    Analyze the following user-provided information and generate a career narrative.

    **CONTEXT:**
    1.  **Project Description (The User's "Literal Description"):**
        \`\`\`
        ${rawTruth}
        \`\`\`
    2.  **Target Job Description:**
        \`\`\`
        ${jobDescription}
        \`\`\`
    3.  **User's Resume (for additional context):**
        \`\`\`
        ${resumeText || 'Not provided.'}
        \`\`\`
    4.  **User's Git Repository (for code context):**
        \`\`\`
        ${gitRepoUrl || 'Not provided.'}
        \`\`\`

    **TASK:**
    Based on the provided context, generate the response as per the JSON schema. The 'corporateNarrative' section must contain a summary and a list of key experience breakdowns. The 'strategicAnalysis' must contain perspectives from both Oliver and Steve.
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
            result.corporateNarrative?.keyExperienceBreakdown &&
            Array.isArray(result.corporateNarrative.keyExperienceBreakdown) &&
            result.strategicAnalysis?.oliversPerspective &&
            result.strategicAnalysis?.stevesPerspective
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
