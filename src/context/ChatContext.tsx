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
  createSession: (title: string) => Promise<Session | undefined>;
  selectSession: (id: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  sendMessageToId: (sessionId: string, content: string) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  renameSession: (id: string, title: string) => Promise<void>;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.0-flash');
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      return session;
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
    await sendMessageToId(currentSession.id, content);
  };

  const sendMessageToId = async (sessionId: string, content: string) => {
    setLoading(true);
    setError(null);
    try {
      await chatUseCase.sendMessage(sessionId, content, selectedModel);
      const updatedSession = await chatUseCase.getSession(sessionId);
      if (currentSession?.id === sessionId || !currentSession) {
        setCurrentSession(updatedSession);
      }
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

  const renameSession = async (id: string, title: string) => {
    try {
      await chatUseCase.renameSession(id, title);
      await refreshSessions();
      if (currentSession?.id === id) {
        const updated = await chatUseCase.getSession(id);
        setCurrentSession(updated);
      }
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
        sendMessageToId,
        deleteSession,
        renameSession,
        selectedModel,
        setSelectedModel,
        isSidebarOpen,
        setSidebarOpen,
        toggleSidebar: () => setSidebarOpen(prev => !prev),
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
