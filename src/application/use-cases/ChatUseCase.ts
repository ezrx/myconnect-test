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

      // Auto-summary logic: If this is the first AI response, generate a summary
      if (session.messages.length === 2 && (session.title.toLowerCase().includes('session') || session.title.toLowerCase().includes('new chat'))) {
        try {
          const summary = await this.aiService.generateResponse([
            ...session.messages,
            { id: 'summary-prompt', role: 'user', content: 'Summarize our conversation above in 3-5 words for a chat title. Return ONLY the summary text, no quotes or punctuation.', timestamp: new Date() }
          ], model);
          if (summary && summary.length < 50) {
            session.title = summary.trim();
          }
        } catch (summaryError) {
          console.error('Failed to generate auto-summary:', summaryError);
        }
      }

      await this.sessionRepository.save(session);

      return aiMessage;
    } catch (error) {
      throw error;
    }
  }

  async deleteSession(id: string): Promise<void> {
    await this.sessionRepository.delete(id);
  }

  async renameSession(id: string, title: string): Promise<void> {
    const session = await this.sessionRepository.getById(id);
    if (!session) throw new Error('Session not found');
    session.title = title;
    session.updatedAt = new Date();
    await this.sessionRepository.save(session);
  }
}
