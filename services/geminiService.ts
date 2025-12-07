import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini Client
// Note: In a real production app, you might want to proxy this request 
// or ensure the key is restricted.
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

/**
 * Generates a list of suggested tasks for a given project name and description.
 */
export const generateSuggestedTasks = async (projectName: string, description: string): Promise<string[]> => {
  if (!apiKey) {
    console.warn("No API Key found for Gemini. Skipping AI generation.");
    return [];
  }

  try {
    const prompt = `Generate a list of 5-8 actionable, concise project tasks for a project named "${projectName}".
    Project Description: "${description}".
    The tasks should be specific steps to complete the project.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING
              },
              description: "A list of actionable task titles."
            }
          },
          required: ["tasks"]
        },
        systemInstruction: "You are an expert project manager. Break down projects into logical, bite-sized tasks.",
        temperature: 0.7,
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];

    const parsed = JSON.parse(jsonText);
    return parsed.tasks || [];

  } catch (error) {
    console.error("Failed to generate tasks with Gemini:", error);
    throw error;
  }
};