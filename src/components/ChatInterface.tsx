'use client';

import { useChat } from '../context/ChatContext';
import { Send, Bot, User, Loader2, AlertCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function ChatInterface() {
  const { currentSession, sendMessage, loading, error } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [currentSession?.messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const msg = input;
    setInput('');
    await sendMessage(msg);
  };

  if (!currentSession) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-background">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Bot className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Welcome to AI Chat</h2>
        <p className="text-muted-foreground max-w-md">
          Select a session from the sidebar or create a new one to start conversing with Gemini AI.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen bg-background text-foreground relative">
      <header className="h-16 border-b flex items-center px-6 glass sticky top-0 z-10 justify-between">
        <h2 className="font-semibold truncate">{currentSession.title}</h2>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
        <AnimatePresence>
          {currentSession.messages.map((m) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={m.id}
              className={cn(
                "flex w-full mb-4",
                m.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div className={cn(
                "flex max-w-[80%] gap-3",
                m.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                  m.role === 'user' ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground"
                )}>
                  {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={cn(
                  "p-4 rounded-2xl shadow-sm text-sm leading-relaxed",
                  m.role === 'user' 
                    ? "bg-primary text-primary-foreground rounded-tr-none" 
                    : "bg-card border text-card-foreground rounded-tl-none"
                )}>
                  {m.content}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shadow-sm">
              <Bot className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="bg-secondary p-4 rounded-2xl rounded-tl-none text-sm w-32 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background/90 to-transparent">
        <div className="max-w-3xl mx-auto space-y-2">
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg text-sm"
            >
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
              <button onClick={() => sendMessage(input)} className="ml-auto underline font-medium">Retry</button>
            </motion.div>
          )}

          <form onSubmit={handleSend} className="relative group">
            <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-xl group-focus-within:bg-primary/10 transition-all opacity-0 group-focus-within:opacity-100" />
            <div className="relative flex items-end gap-2 p-2 bg-card border rounded-2xl shadow-lg ring-offset-background transition-all focus-within:ring-2 focus-within:ring-ring">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message Gemini..."
                className="flex-1 max-h-32 min-h-[44px] bg-transparent border-none focus:ring-0 outline-none p-3 text-sm resize-none scrollbar-hide"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:grayscale"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[10px] text-center text-muted-foreground mt-2">
              Gemini can make mistakes. Check important info.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
