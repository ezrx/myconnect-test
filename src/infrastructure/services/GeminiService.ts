import { GoogleGenAI } from '@google/genai';
import { Message } from '../../domain/entities/Session';
import { IAIService } from '../../domain/services/IAIService';

export class GeminiService implements IAIService {
  private client: GoogleGenAI;

  constructor(apiKey: string) {
    this.client = new GoogleGenAI({
      apiKey: apiKey,
    });
  }

  async generateResponse(messages: Message[]): Promise<string> {
    // Mock API delay
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Simulated failure (5% chance)
    if (Math.random() < 0.05) {
      throw new Error('Simulated Gemini API failure');
    }

    try {
      const response = await this.client.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: messages.map((m) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }],
        })),
      });

      if (!response.text) throw new Error('No response from AI');
      return response.text;
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      
      // Handle quota exceeded errors (usually 429)
      if (error?.message?.includes('429') || error?.status === 429 || error?.code === 429) {
        return "You exceeded your current quota, please check your plan and billing details.";
      }

      throw new Error(`Gemini Service Error: ${error.message}`);
    }
  }
}
