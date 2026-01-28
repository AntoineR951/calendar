import { GoogleGenAI, Type } from "@google/genai";
import { CalendarEvent } from '../types';
import { formatDateISO } from './dateUtils';

// Helper to get formatted today's date for context
const getTodayContext = () => {
  const today = new Date();
  return formatDateISO(today);
};

export const parseNaturalLanguageToEvents = async (prompt: string): Promise<CalendarEvent[]> => {
  if (!process.env.API_KEY) {
    console.error("API_KEY is missing");
    return [];
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const today = getTodayContext();
    const systemInstruction = `
      You are a smart calendar assistant. 
      Today is ${today}.
      Analyze the user's request and extract date ranges to block/reserve.
      Return an array of objects with 'start' (YYYY-MM-DD), 'end' (YYYY-MM-DD), and 'summary'.
      If the user says "single day" or implies one day, start and end should be the same.
      If the user implies a range (e.g. "next week"), calculate the specific dates based on today's date (${today}).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              start: { type: Type.STRING, description: "Start date YYYY-MM-DD" },
              end: { type: Type.STRING, description: "End date YYYY-MM-DD (inclusive)" },
              summary: { type: Type.STRING, description: "Reason for reservation" }
            },
            required: ["start", "end", "summary"]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];

    const parsed = JSON.parse(jsonText);
    
    return parsed.map((item: any) => ({
      id: crypto.randomUUID(),
      start: item.start,
      end: item.end,
      summary: item.summary
    }));

  } catch (error) {
    console.error("Gemini API Error:", error);
    return [];
  }
};
