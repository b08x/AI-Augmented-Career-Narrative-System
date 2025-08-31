import { GoogleGenAI } from "@google/genai";

// This file is a serverless function (e.g., for Vercel or Netlify).
// It acts as a Backend-for-Frontend (BFF) to securely handle API requests to Gemini.

// Initialize the Google GenAI client with the API key from server-side environment variables.
// This environment variable is provided by the AI Studio platform.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Handles incoming POST requests to the /api/generate endpoint.
 * @param req The incoming request object.
 * @returns A response object.
 */
export default async function handler(req: Request): Promise<Response> {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json', 'Allow': 'POST' },
        });
    }

    try {
        // Parse the request body to get the parameters for the Gemini API call.
        const { model, contents, config } = await req.json();
        
        // Validate that essential parameters are present.
        if (!model || !contents) {
            return new Response(JSON.stringify({ error: 'Missing required parameters: model and contents' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Forward the request to the Gemini API.
        const result = await ai.models.generateContent({
            model,
            contents,
            config,
        });

        // The Gemini API response object has a `text` property which contains the string response.
        // We wrap this in a JSON object to send back to the client.
        return new Response(JSON.stringify({ text: result.text }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("Error in BFF while processing Gemini request:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown server error occurred.";
        // Return a generic error message to the client for security.
        return new Response(JSON.stringify({ error: `Server error: ${errorMessage}` }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}