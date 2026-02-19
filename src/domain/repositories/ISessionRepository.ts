import { Session } from '../entities/Session';

export interface ISessionRepository {
  getAll(): Promise<Session[]>;
  getById(id: string): Promise<Session | null>;
  save(session: Session): Promise<void>;
  delete(id: string): Promise<void>;
}
