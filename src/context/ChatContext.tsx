'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ChatUseCase } from '../application/use-cases/ChatUseCase';
import { LocalStorageSessionRepository } from '../infrastructure/repositories/LocalStorageSessionRepository';
import { GeminiService } from '../infrastructure/services/GeminiService';
import { Session } from '../domain/entities/Session';

interface ChatContextType {
  sessions: Session[];
  currentSession: Session | null;
  loading: boolean;
  error: string | null;
  createSession: (title: string) => Promise<void>;
  selectSession: (id: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.0-flash');

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createSession = async (title: string) => {
    setLoading(true);
    try {
      const session = await chatUseCase.createSession(title);
      await refreshSessions();
      setCurrentSession(session);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const selectSession = async (id: string) => {
    setLoading(true);
    try {
      const session = await chatUseCase.getSession(id);
      setCurrentSession(session);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!currentSession) return;
    setLoading(true);
    setError(null);
    try {
      await chatUseCase.sendMessage(currentSession.id, content, selectedModel);
      const updatedSession = await chatUseCase.getSession(currentSession.id);
      setCurrentSession(updatedSession);
      await refreshSessions();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (id: string) => {
    try {
      await chatUseCase.deleteSession(id);
      if (currentSession?.id === id) setCurrentSession(null);
      await refreshSessions();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred');
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
        selectedModel,
        setSelectedModel,
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
