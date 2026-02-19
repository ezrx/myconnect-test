export type Role = "user" | "model" | "system";

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
}

export interface Session {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export type CreateSessionDTO = Omit<
  Session,
  "id" | "createdAt" | "updatedAt" | "messages"
>;
export type CreateMessageDTO = Omit<Message, "id" | "timestamp">;
