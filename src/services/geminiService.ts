import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  timestamp: string;
  source: string;
  url: string;
  category: "DeFi" | "NFT" | "L1/L2" | "Regulation" | "Market";
}

export async function fetchWeb3News(): Promise<NewsItem[]> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `Generate a list of the 5 most recent and important Web3/Crypto news stories from the last hour. 
  Focus on diverse topics like DeFi, NFTs, Layer 1/2 developments, Regulation, and Market trends.
  Return the data in a structured JSON format.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              source: { type: Type.STRING },
              url: { type: Type.STRING },
              category: { 
                type: Type.STRING,
                description: "One of: DeFi, NFT, L1/L2, Regulation, Market"
              }
            },
            required: ["title", "summary", "source", "url", "category"]
          }
        }
      }
    });

    const newsData = JSON.parse(response.text || "[]");
    
    return newsData.map((item: any, index: number) => ({
      ...item,
      id: `news-${Date.now()}-${index}`,
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
}
