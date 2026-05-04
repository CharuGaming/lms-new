import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import fs from 'fs';
import path from 'path';

const API_KEY = process.env.GEMINI_API_KEY || "";

// Initialize APIs
const genAI = new GoogleGenerativeAI(API_KEY);
const fileManager = new GoogleAIFileManager(API_KEY);

export async function analyzeVideoMetadata(videoPath: string) {
  if (!API_KEY) throw new Error("GEMINI_API_KEY is not configured");

  try {
    // 1. Upload the file to Google AI File Manager
    const uploadResponse = await fileManager.uploadFile(videoPath, {
      mimeType: "video/mp4", // Adjust if needed
      displayName: path.basename(videoPath),
    });

    const file = uploadResponse.file;
    console.log(`Uploaded file ${file.displayName} as: ${file.uri}`);

    // 2. Poll for file to be ready (active)
    let processedFile = await fileManager.getFile(file.name);
    while (processedFile.state === "PROCESSING") {
      process.stdout.write(".");
      await new Promise((resolve) => setTimeout(resolve, 5000));
      processedFile = await fileManager.getFile(file.name);
    }

    if (processedFile.state === "FAILED") {
      throw new Error("Video processing failed in Gemini");
    }

    // 3. Generate content using Gemini 1.5 Flash (faster and cheaper)
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const prompt = `
      You are an expert educational content strategist.
      Watch this video and generate:
      1. A professional, catchy Title (max 60 chars).
      2. A comprehensive, structured Description (max 500 chars) highlighting key topics and learning outcomes.
      
      Return ONLY a JSON object with keys "title" and "description".
    `;

    const result = await model.generateContent([
      {
        fileData: {
          mimeType: file.mimeType,
          fileUri: file.uri,
        },
      },
      { text: prompt },
    ]);

    const responseText = result.response.text();
    
    // Attempt to parse JSON from response
    try {
      // Find JSON block if AI wrapped it in markdown
      const jsonStr = responseText.includes('```json') 
        ? responseText.split('```json')[1].split('```')[0]
        : responseText;
      
      return JSON.parse(jsonStr.trim());
    } catch (e) {
      console.error("Failed to parse AI response:", responseText);
      return { 
        title: "Analysis Succeeded", 
        description: "However, the AI response format was unexpected. Please check the content manually." 
      };
    }
  } catch (error: any) {
    console.error("AI Video Analysis Error:", error);
    throw error;
  }
}
