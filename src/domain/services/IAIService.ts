import { Message } from '../entities/Session';

export interface IAIService {
  generateResponse(messages: Message[], model?: string): Promise<string>;
}
