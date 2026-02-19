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

      // Distinguish between Rate Limit (429) and other errors
      if (errorMessage.includes('429')) {
        return "The AI is currently receiving too many requests. Please wait a moment or check if your API quota has been reached on Google AI Studio.";
      }

      throw new Error(`Gemini Service Error: ${errorMessage}`);
    }
  }
}
