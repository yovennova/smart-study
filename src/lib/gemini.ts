import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenAI({ apiKey });

export const models = {
  flash: "gemini-3-flash-preview",
  pro: "gemini-3.1-pro-preview",
};

export async function getResources(query: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  try {
    const response = await ai.models.generateContent({
      model: models.flash,
      contents: `Find high-quality academic resources, tutorials, and documentation for: ${query}. Focus on websites like YouTube, GitHub, Coursera, and official documentation. Return a list with titles and URLs.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const resources = chunks?.map(chunk => ({
      title: chunk.web?.title || "Resource",
      url: chunk.web?.uri || "#"
    })).filter(r => r.url !== "#") || [];
    
    return { text: response.text, resources };
  } catch (error) {
    console.error("Gemini API Error (getResources):", error);
    throw error;
  }
}

export async function generateQuizFromTopic(topic: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  try {
    const response = await ai.models.generateContent({
      model: models.flash,
      contents: `Generate a comprehensive quiz of 40 questions about the topic: ${topic}. The quiz must include:
    1. 8 True/False questions
    2. 8 Multiple Choice Questions (MCQ)
    3. 8 Matching questions (pairs)
    4. 8 Fill in the blank questions
    5. 8 Short answer questions
    
    Return ONLY a JSON object with these keys: "trueFalse", "mcq", "matching", "fillInBlanks", "shortAnswer".
    Each should be an array of objects with relevant properties (e.g., question, options, answer, pairs).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            trueFalse: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  answer: { type: Type.BOOLEAN }
                },
                required: ["question", "answer"]
              }
            },
            mcq: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  answer: { type: Type.STRING }
                },
                required: ["question", "options", "answer"]
              }
            },
            matching: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  left: { type: Type.STRING },
                  right: { type: Type.STRING }
                },
                required: ["left", "right"]
              }
            },
            fillInBlanks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING, description: "Use ___ for the blank" },
                  answer: { type: Type.STRING }
                },
                required: ["question", "answer"]
              }
            },
            shortAnswer: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  suggestedAnswer: { type: Type.STRING }
                },
                required: ["question", "suggestedAnswer"]
              }
            }
          },
          required: ["trueFalse", "mcq", "matching", "fillInBlanks", "shortAnswer"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini API Error (generateQuizFromTopic):", error);
    throw error;
  }
}

export async function analyzeImage(base64Image: string, prompt: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  try {
    const response = await ai.models.generateContent({
      model: models.flash,
      contents: [
        {
          inlineData: {
            data: base64Image.split(',')[1],
            mimeType: "image/jpeg"
          }
        },
        { text: prompt }
      ]
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error (analyzeImage):", error);
    throw error;
  }
}

export async function generateSummary(text: string, url?: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  try {
    const response = await ai.models.generateContent({
      model: models.flash,
      contents: url 
        ? `You are an expert academic analyst. I am providing a URL: ${url}. 
           If this is a YouTube video, you MUST fetch and analyze the transcript or video content in extreme detail. 
           Provide a comprehensive, multi-paragraph summary that covers:
           1. The core objective or thesis.
           2. A detailed breakdown of all major sections or points.
           3. Key data, evidence, or examples provided.
           4. Final conclusions or takeaways.
           
           Do not be brief. Ensure the summary is thorough and captures the essence of the entire content. Use Markdown.
           Respond in the language of the input or as requested (supports English and Amharic).
           ${text ? `Special focus requested on: ${text}` : ""}`
        : `Summarize the following study material into a structured, easy-to-read format with key concepts, definitions, and a "TL;DR" section. Use Markdown.
           Respond in the language of the input or as requested (supports English and Amharic).

           Material:
           ${text}`,
      config: {
        tools: url ? [{ urlContext: {} }, { googleSearch: {} }] : undefined
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error (generateSummary):", error);
    throw error;
  }
}

export async function analyzeUrl(url: string, question: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  try {
    const response = await ai.models.generateContent({
      model: models.flash,
      contents: `You are a specialized content analyst. Analyze the content at this URL: ${url} to answer the following request in great detail.
                 
                 Request: ${question}
                 
                 Instructions:
                 - If this is a YouTube video, you MUST analyze the transcript or video content thoroughly.
                 - Provide a thorough, well-structured response. 
                 - Reference specific parts of the content. 
                 - Do not give a generic or brief answer. 
                 - Stay strictly focused on the content of the provided URL.
                 - Respond in the language of the request (supports English and Amharic).`,
      config: {
        tools: [{ urlContext: {} }, { googleSearch: {} }]
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error (analyzeUrl):", error);
    throw error;
  }
}

export async function generateComprehensiveQuiz(text: string, url?: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  try {
    const response = await ai.models.generateContent({
      model: models.flash,
      contents: url
        ? `Analyze the content at this URL: ${url}. Generate a comprehensive quiz of 40 questions from it. The quiz must include:
    1. 8 True/False questions
    2. 8 Multiple Choice Questions (MCQ)
    3. 8 Matching questions (pairs)
    4. 8 Fill in the blank questions
    5. 8 Short answer questions
    
    For EVERY question, provide a very brief explanation (max 1 sentence) of the correct answer.
    Return ONLY a JSON object with these keys: "trueFalse", "mcq", "matching", "fillInBlanks", "shortAnswer".
    Each should be an array of objects with relevant properties (e.g., question, options, answer, pairs, explanation). ${text ? `Focus on: ${text}` : ""}`
        : `Generate a comprehensive quiz of 40 questions from the following text. The quiz must include:
    1. 8 True/False questions
    2. 8 Multiple Choice Questions (MCQ)
    3. 8 Matching questions (pairs)
    4. 8 Fill in the blank questions
    5. 8 Short answer questions
    
    For EVERY question, provide a very brief explanation (max 1 sentence) of the correct answer.
    Return ONLY a JSON object with these keys: "trueFalse", "mcq", "matching", "fillInBlanks", "shortAnswer".
    Each should be an array of objects with relevant properties (e.g., question, options, answer, pairs, explanation).
    
    Text:
    ${text}`,
      config: {
        tools: url ? [{ urlContext: {} }] : undefined,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            trueFalse: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  answer: { type: Type.BOOLEAN },
                  explanation: { type: Type.STRING }
                },
                required: ["question", "answer", "explanation"]
              }
            },
            mcq: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  answer: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ["question", "options", "answer", "explanation"]
              }
            },
            matching: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  left: { type: Type.STRING },
                  right: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ["left", "right", "explanation"]
              }
            },
            fillInBlanks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING, description: "Use ___ for the blank" },
                  answer: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ["question", "answer", "explanation"]
              }
            },
            shortAnswer: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  suggestedAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ["question", "suggestedAnswer", "explanation"]
              }
            }
          },
          required: ["trueFalse", "mcq", "matching", "fillInBlanks", "shortAnswer"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini API Error (generateComprehensiveQuiz):", error);
    throw error;
  }
}
