
import { GoogleGenAI, Type } from "@google/genai";

// Fix: Direct use of process.env.API_KEY as per Google GenAI SDK guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const summarizeNote = async (content: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Summarize the following note content concisely. Keep it under 3 sentences: \n\n${content}`,
      config: {
        systemInstruction: "You are a helpful assistant that specializes in concise summarization.",
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini summarization failed:", error);
    return "Failed to generate summary.";
  }
};

export const improveWriting = async (content: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Improve the grammar, tone, and clarity of the following note while keeping the same meaning: \n\n${content}`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini writing improvement failed:", error);
    return content;
  }
};

export const transcribeHandwriting = async (base64Image: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/png', data: base64Image.split(',')[1] } },
          { text: "Transcribe any text or drawings found in this image into clear text." }
        ]
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini handwriting transcription failed:", error);
    return "Error transcribing handwriting.";
  }
};

export const suggestTags = async (content: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Based on this note content, suggest 3-5 relevant short tags. Return only as a JSON array of strings: \n\n${content}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    return [];
  }
};
