import { Type } from "@google/genai";
import type { NarrativeOutput, ChatMessage, StrategicAnalysis } from '../types';
import { narrativeSystemPrompt } from '../prompts/narrativeSystemPrompt';
import { resumeFeedbackSystemPrompt } from '../prompts/resumeFeedbackSystemPrompt';

// The GoogleGenAI client is no longer initialized on the client-side.
// All API calls are now proxied through a local BFF endpoint (/api/generate)
// to secure the API key.

/**
 * A helper function to call our BFF endpoint.
 * @param payload The data to send to the Gemini API (model, contents, config).
 * @returns The JSON response from the BFF, which should contain a `text` property.
 */
const callBff = async (payload: { model: string, contents: any, config?: any }) => {
    const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error from BFF' }));
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
    }

    return response.json(); // This will resolve to an object like { text: '...' }
};

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
            type: Type.ARRAY,
            description: "An array of specific, actionable feedback points. Each string in the array is a separate piece of advice and will be displayed on its own card.",
            items: { 
                type: Type.STRING 
            }
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
        const payload = {
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: narrativeSystemPrompt,
                responseMimeType: "application/json",
                responseSchema: narrativeResponseSchema,
                temperature: 0.75,
            },
        };
        
        const data = await callBff(payload);
        const jsonText = data.text.trim();
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
        console.error("Error calling Gemini API via BFF:", error);
        throw new Error("The AI service failed to process the request. Please check the console for details.");
    }
};

export const generateResumeFeedback = async (
    narrative: NarrativeOutput,
    resumeText: string,
    chatHistory: ChatMessage[]
): Promise<{ feedback: string[]; strategicAnalysis: StrategicAnalysis }> => {
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
    - "feedback": This should be an array of strings. Each string must be a distinct, actionable piece of advice for the user.
    - "strategicAnalysis": This should contain a new analysis from Oliver and Steve commenting on the feedback you just provided. Oliver's perspective should be empowering, while Steve's should be cynical and pragmatic.
    `;
    
    const contents: any[] = [
        { role: 'user', parts: [{ text: narrativeContext }] },
        { role: 'model', parts: [{ text: "Understood. I have the context. I will provide feedback as an array of strings and a new strategic analysis from Oliver and Steve in the required JSON format." }] },
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
        const payload = {
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                systemInstruction: resumeFeedbackSystemPrompt,
                responseMimeType: "application/json",
                responseSchema: feedbackResponseSchema,
                temperature: 0.5,
            },
        };
        
        const data = await callBff(payload);
        const jsonText = data.text.trim();
        const parsedJson = JSON.parse(jsonText);

        if (
            parsedJson.feedback &&
            Array.isArray(parsedJson.feedback) &&
            parsedJson.strategicAnalysis &&
            parsedJson.strategicAnalysis.oliversPerspective &&
            parsedJson.strategicAnalysis.stevesPerspective
        ) {
            return parsedJson as { feedback: string[]; strategicAnalysis: StrategicAnalysis };
        } else {
            throw new Error("Invalid JSON structure received for feedback from API.");
        }
    } catch (error) {
        console.error("Error calling Gemini API for feedback via BFF:", error);
        throw new Error("The AI service failed to process the feedback request.");
    }
};

export const generateResumeDraft = async (
    currentResume: string,
    selectedFeedback: ChatMessage[],
    context: Record<string, string>
): Promise<string> => {
    const feedbackWithContext = selectedFeedback.map(f => `
    - **Feedback:** ${f.text}
    - **User's Additional Context:** ${context[f.id] || 'None provided.'}
    `).join('');

    const prompt = `
    You are an expert resume writer. Your task is to revise the following resume based on the provided feedback.

    **Current Resume Draft:**
    \`\`\`
    ${currentResume}
    \`\`\`

    **Selected Feedback and User Context to Address:**
    ${feedbackWithContext}

    **Instructions:**
    1.  Carefully consider each piece of feedback and the user's additional context.
    2.  Rewrite the resume to incorporate the suggested changes.
    3.  Maintain a professional tone and format.
    4.  Return ONLY the full, updated resume text. Do not include any other commentary, headings, or explanations.
    `;

    try {
        const payload = {
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.4,
            },
        };

        const data = await callBff(payload);
        return data.text;
    } catch (error) {
        console.error("Error calling Gemini API for draft generation via BFF:", error);
        throw new Error("The AI service failed to generate a new resume draft.");
    }
};