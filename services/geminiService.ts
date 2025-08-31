
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
        professionalNarrative: {
            type: Type.STRING,
            description: "A polished, professional summary of the project, highlighting its value and aligning it with corporate expectations. Use action verbs and focus on impact. Frame it as a solution to a problem.",
        },
        technicalEvidence: {
            type: Type.STRING,
            description: "A summary of 1-3 specific code snippets, architectural decisions, or technical challenges from the project description that directly support the claims in the professional narrative. Explain why this evidence is significant in a professional context.",
        },
    },
    required: ["professionalNarrative", "technicalEvidence"],
};

export const generateCareerNarrative = async (
    rawTruth: string,
    jobDescription: string
): Promise<NarrativeOutput> => {
    const systemInstruction = `You are an expert career coach and technical writer specializing in translating authentic, project-based technical experience into compelling, corporate-legible narratives. Your purpose is to bridge the gap between an autodidact's non-linear learning path and the expectations of corporate hiring systems. You must maintain technical integrity and ground all claims in the evidence provided. You will always respond in the specified JSON format.`;

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
    3.  **Translate & Generate:** Create the professional narrative and technical evidence as per the JSON schema. Ensure the tone is confident, competent, and professional without making claims that cannot be substantiated by the "Raw Truth" input.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.7,
            },
        });

        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);

        if (
            typeof parsedJson.professionalNarrative === 'string' &&
            typeof parsedJson.technicalEvidence === 'string'
        ) {
            return parsedJson as NarrativeOutput;
        } else {
            throw new Error("Invalid JSON structure received from API.");
        }

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("The AI service failed to process the request. Please check the console for details.");
    }
};
