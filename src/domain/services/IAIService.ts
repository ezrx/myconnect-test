import { Message } from '../entities/Session';

export interface IAIService {
  generateResponse(messages: Message[]): Promise<string>;
}
