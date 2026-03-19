import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const getFitnessResponse = async (message) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest", // ✅ FIXED
    });

    const prompt = `
You are a professional AI Fitness Coach 💪.
Give short, practical, and motivating advice.

User: ${message}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error(error);
    return "Something went wrong!";
  }
};