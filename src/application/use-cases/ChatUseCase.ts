import { Session, Message } from '../../domain/entities/Session';
import { ISessionRepository } from '../../domain/repositories/ISessionRepository';
import { IAIService } from '../../domain/services/IAIService';

export class ChatUseCase {
  constructor(
    private sessionRepository: ISessionRepository,
    private aiService: IAIService
  ) {}

  async createSession(title: string): Promise<Session> {
    const session: Session = {
      id: crypto.randomUUID(),
      title,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await this.sessionRepository.save(session);
    return session;
  }

  async getSessions(): Promise<Session[]> {
    return this.sessionRepository.getAll();
  }

  async getSession(id: string): Promise<Session | null> {
    return this.sessionRepository.getById(id);
  }

  async sendMessage(sessionId: string, content: string, model?: string): Promise<Message> {
    const session = await this.sessionRepository.getById(sessionId);
    if (!session) throw new Error('Session not found');

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    session.messages.push(userMessage);
    session.updatedAt = new Date();
    await this.sessionRepository.save(session);

    try {
      const aiResponseContent = await this.aiService.generateResponse(session.messages, model);
      
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        role: 'model',
        content: aiResponseContent,
        timestamp: new Date(),
      };

      session.messages.push(aiMessage);
      session.updatedAt = new Date();
      await this.sessionRepository.save(session);

      return aiMessage;
    } catch (error) {
      throw error;
    }
  }

  async deleteSession(id: string): Promise<void> {
    await this.sessionRepository.delete(id);
  }
}
