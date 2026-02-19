'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ChatUseCase } from '../application/use-cases/ChatUseCase';
import { LocalStorageSessionRepository } from '../infrastructure/repositories/LocalStorageSessionRepository';
import { GeminiService } from '../infrastructure/services/GeminiService';
import { Session, Message } from '../domain/entities/Session';

interface ChatContextType {
  sessions: Session[];
  currentSession: Session | null;
  loading: boolean;
  error: string | null;
  createSession: (title: string) => Promise<void>;
  selectSession: (id: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize dependencies (DI)
  const repo = new LocalStorageSessionRepository();
  const aiService = new GeminiService(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
  const chatUseCase = new ChatUseCase(repo, aiService);

  const refreshSessions = async () => {
    const list = await chatUseCase.getSessions();
    setSessions(list.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()));
  };

  useEffect(() => {
    refreshSessions();
  }, []);

  const createSession = async (title: string) => {
    setLoading(true);
    try {
      const session = await chatUseCase.createSession(title);
      await refreshSessions();
      setCurrentSession(session);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const selectSession = async (id: string) => {
    setLoading(true);
    try {
      const session = await chatUseCase.getSession(id);
      setCurrentSession(session);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!currentSession) return;
    setLoading(true);
    setError(null);
    try {
      // Optimistic update could be added here, but let's keep it simple for now as requested
      await chatUseCase.sendMessage(currentSession.id, content);
      const updatedSession = await chatUseCase.getSession(currentSession.id);
      setCurrentSession(updatedSession);
      await refreshSessions();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (id: string) => {
    try {
      await chatUseCase.deleteSession(id);
      if (currentSession?.id === id) setCurrentSession(null);
      await refreshSessions();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        sessions,
        currentSession,
        loading,
        error,
        createSession,
        selectSession,
        sendMessage,
        deleteSession,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
