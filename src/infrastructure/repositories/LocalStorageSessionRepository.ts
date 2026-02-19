import { Session, Message, Role } from '../../domain/entities/Session';
import { ISessionRepository } from '../../domain/repositories/ISessionRepository';

const STORAGE_KEY = 'ai_sessions';

export class LocalStorageSessionRepository implements ISessionRepository {
  private async getSessions(): Promise<Session[]> {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    try {
      const parsed = JSON.parse(data);
      return parsed.map((s: any) => ({
        ...s,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt),
        messages: s.messages.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        })),
      }));
    } catch {
      return [];
    }
  }

  private async saveSessions(sessions: Session[]): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }

  async getAll(): Promise<Session[]> {
    return this.getSessions();
  }

  async getById(id: string): Promise<Session | null> {
    const sessions = await this.getSessions();
    return sessions.find((s) => s.id === id) || null;
  }

  async save(session: Session): Promise<void> {
    const sessions = await this.getSessions();
    const index = sessions.findIndex((s) => s.id === session.id);
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.push(session);
    }
    await this.saveSessions(sessions);
  }

  async delete(id: string): Promise<void> {
    const sessions = await this.getSessions();
    const filtered = sessions.filter((s) => s.id !== id);
    await this.saveSessions(filtered);
  }
}
