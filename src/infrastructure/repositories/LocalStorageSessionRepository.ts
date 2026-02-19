import { Session } from '../../domain/entities/Session';
import { ISessionRepository } from '../../domain/repositories/ISessionRepository';

const STORAGE_KEY = 'ai_sessions';

export class LocalStorageSessionRepository implements ISessionRepository {
  private async getSessions(): Promise<Session[]> {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    try {
      const parsed = JSON.parse(data);
      return parsed.map((s: Record<string, unknown>) => ({
        ...s,
        createdAt: new Date(s.createdAt as string),
        updatedAt: new Date(s.updatedAt as string),
        messages: (s.messages as Record<string, unknown>[]).map((m: Record<string, unknown>) => ({
          ...m,
          timestamp: new Date(m.timestamp as string),
        })),
      })) as Session[];
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
