import { GoogleGenAI } from '@google/genai';
import { Message } from '../../domain/entities/Session';
import { IAIService } from '../../domain/services/IAIService';

export class GeminiService implements IAIService {
  private client: GoogleGenAI | null = null;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private getClient(): GoogleGenAI {
    if (!this.client) {
      if (!this.apiKey) {
        throw new Error('API key must be set when using the Gemini API. Please check your .env.local or Vercel Environment Variables.');
      }
      this.client = new GoogleGenAI({
        apiKey: this.apiKey,
      });
    }
    return this.client;
  }

  async generateResponse(messages: Message[]): Promise<string> {
    const client = this.getClient();

    // Mock API delay
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Simulated failure (5% chance)
    if (Math.random() < 0.05) {
      throw new Error('Simulated Gemini API failure');
    }

    try {
      const response = await client.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: messages.map((m) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }],
        })),
      });

      if (!response.text) throw new Error('No response from AI');
      return response.text;
    } catch (error: unknown) {
      console.error('Gemini API Error:', error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Handle quota exceeded errors (usually 429)
      if (errorMessage.includes('429')) {
        return "You exceeded your current quota, please check your plan and billing details.";
      }

      throw new Error(`Gemini Service Error: ${errorMessage}`);
    }
  }
}
