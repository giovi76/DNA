
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeSequenceAI = async (sequence: string, prompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `You are a bioinformatics expert. Analyzing DNA sequence: ${sequence.substring(0, 1000)}${sequence.length > 1000 ? '...' : ''}. 
      User Question: ${prompt}`,
      config: {
        systemInstruction: "You are a world-class genomicist. Provide accurate, scientific, but accessible explanations of DNA sequences, genes, and potential biological functions. Use Markdown for formatting.",
      }
    });
    return response.text || "No response received from the model.";
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
};

export const getGeneralInsight = async (sequence: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Perform a brief automated bioinformatics screen on this DNA sequence: ${sequence.substring(0, 500)}. Mention if it looks like a known sequence, potential motifs, or interesting GC patterns. Keep it under 150 words.`,
    });
    return response.text;
  } catch (error) {
    return "Could not fetch AI insights at this time.";
  }
};
