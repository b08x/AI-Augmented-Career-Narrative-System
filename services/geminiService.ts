
import { GoogleGenAI, Type } from "@google/genai";
import type { NarrativeOutput, ChatMessage, StrategicAnalysis } from '../types';
import { narrativeSystemPrompt } from '../prompts/narrativeSystemPrompt';
import { resumeFeedbackSystemPrompt } from '../prompts/resumeFeedbackSystemPrompt';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const narrativeResponseSchema = {
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

const feedbackResponseSchema = {
    type: Type.OBJECT,
    properties: {
        feedback: {
            type: Type.STRING,
            description: "The AI's response to the user's resume or query, providing feedback and suggestions.",
        },
        strategicAnalysis: {
            type: Type.OBJECT,
            properties: {
                oliversPerspective: {
                    type: Type.STRING,
                    description: "Oliver's empowering, philosophical analysis of the resume feedback itself. How does this feedback help the user grow?",
                },
                stevesPerspective: {
                    type: Type.STRING,
                    description: "Steve's cynical, grounding, and darkly humorous take on the resume feedback. What corporate game is being played with this advice?",
                },
            },
            required: ["oliversPerspective", "stevesPerspective"],
        },
    },
    required: ["feedback", "strategicAnalysis"],
};


export const generateCareerNarrative = async (
    rawTruth: string,
    jobDescription: string,
    resumeText: string,
    gitRepoUrl: string
): Promise<NarrativeOutput> => {
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
                systemInstruction: narrativeSystemPrompt,
                responseMimeType: "application/json",
                responseSchema: narrativeResponseSchema,
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

export const generateResumeFeedback = async (
    narrative: NarrativeOutput,
    resumeText: string,
    chatHistory: ChatMessage[]
): Promise<{ feedback: string; strategicAnalysis: StrategicAnalysis }> => {
    const narrativeContext = `
    **Generated Corporate Narrative for Analysis:**
    - **Summary:** ${narrative.corporateNarrative.summary}
    - **Key Experiences:** ${narrative.corporateNarrative.keyExperienceBreakdown.map(k => `* ${k.corporateFraming}`).join('\n')}
    
    **User's Current Resume:**
    \`\`\`
    ${resumeText}
    \`\`\`
    `;

    const initialPrompt = `Based on the provided Corporate Narrative and the user's resume, perform an initial analysis. What are the most critical gaps? Provide 2-3 specific, actionable suggestions for improvement.`;
    
    const taskPrompt = `
    Now, generate a response in JSON format with two keys: "feedback" and "strategicAnalysis".
    - "feedback": This should contain your direct advice and answer to the user's latest query.
    - "strategicAnalysis": This should contain a new analysis from Oliver and Steve commenting on the feedback you just provided. Oliver's perspective should be empowering, while Steve's should be cynical and pragmatic.
    `;
    
    const contents: any[] = [
        { role: 'user', parts: [{ text: narrativeContext }] },
        { role: 'model', parts: [{ text: "Understood. I have the context. I will provide feedback and a new strategic analysis from Oliver and Steve in the required JSON format." }] },
    ];

    if (chatHistory.length === 0) {
        contents.push({ role: 'user', parts: [{ text: initialPrompt + taskPrompt }] });
    } else {
        const historyForApi = chatHistory.map(message => ({
            role: message.role,
            parts: [{ text: message.text }]
        }));

        const lastMessage = historyForApi[historyForApi.length - 1];
        lastMessage.parts[0].text += '\n\n' + taskPrompt;
        
        contents.push(...historyForApi);
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                systemInstruction: resumeFeedbackSystemPrompt,
                responseMimeType: "application/json",
                responseSchema: feedbackResponseSchema,
                temperature: 0.5,
            },
        });
        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);

        if (
            parsedJson.feedback &&
            parsedJson.strategicAnalysis &&
            parsedJson.strategicAnalysis.oliversPerspective &&
            parsedJson.strategicAnalysis.stevesPerspective
        ) {
            return parsedJson as { feedback: string; strategicAnalysis: StrategicAnalysis };
        } else {
            throw new Error("Invalid JSON structure received for feedback from API.");
        }
    } catch (error) {
        console.error("Error calling Gemini API for feedback:", error);
        throw new Error("The AI service failed to process the feedback request.");
    }
};