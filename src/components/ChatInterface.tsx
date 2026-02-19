'use client';

import { useChat } from '../context/ChatContext';
import { Send, User, Bot, Loader2, AlertCircle, Menu } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Sun, Moon, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function ChatInterface() {
  const { currentSession, sendMessage, loading, error, selectedModel, setSelectedModel, isSidebarOpen, toggleSidebar } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();

  const models = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite-preview-02-05',
    'gemini-2.0-pro-exp-02-05',
    'gemini-2.0-flash-thinking-exp-01-21',
    'gemini-pro-latest',
    'gemini-flash-latest'
  ]; // Filtered for common usage but including requested ones

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
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[var(--background)]">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Bot className="w-8 h-8 text-[var(--foreground)]" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-[var(--foreground)]">Welcome to AI Chat</h2>
        <p className="text-[var(--muted-foreground)] max-w-md">
          Select a session from the sidebar or create a new one to start conversing with Gemini AI.
        </p>
      </div>
    );
  }

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-[var(--background)] relative h-screen overflow-hidden">
      {/* Chat Header */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-[var(--border)] shrink-0 bg-[var(--background)]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-4 min-w-0">
          {!isSidebarOpen && (
            <button 
              onClick={toggleSidebar}
              className="p-2 -ml-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-lg font-medium text-[var(--foreground)] truncate">{currentSession.title}</h1>
          <div className="relative group/model shrink-0 h-8 flex items-center">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="appearance-none bg-[var(--sidebar)] border border-[var(--border)] text-[var(--muted-foreground)] text-xs rounded-full py-1 pl-3 pr-8 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:bg-[var(--active-chat)] transition-colors"
            >
              {models.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <ChevronDown className="w-3 h-3 absolute right-3 pointer-events-none text-[var(--muted-foreground)]" />
          </div>
        </div>
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </header>

      {/* Chat Content Flow */}
      <section className="flex-1 overflow-y-auto px-4 sm:px-10 pb-40 scroll-smooth custom-scrollbar">
        <div className="max-w-4xl mx-auto flex flex-col gap-6 pt-10">
          <AnimatePresence initial={false}>
            {currentSession.messages.map((m) => {
              const isQuotaExceeded = m.content.includes('You exceeded your current quota');
              
              if (isQuotaExceeded) {
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={m.id}
                    className="flex w-full justify-start mt-4"
                  >
                    <div className="flex items-start gap-3 border border-[var(--foreground)] rounded-lg p-4 max-w-2xl bg-[var(--background)]/50">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full border border-slate-400 flex items-center justify-center bg-[var(--background)] text-slate-600">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-sm text-[var(--foreground)] leading-relaxed pt-1">
                        {m.content}
                      </div>
                    </div>
                  </motion.div>
                );
              }

              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={m.id}
                  className={cn(
                    "flex flex-col gap-3",
                    m.role === 'user' ? "items-end" : "items-start"
                  )}
                >
                  <div className={cn(
                    "flex items-start gap-3 w-full",
                    m.role === 'user' ? "justify-end" : "justify-start"
                  )}>
                    {m.role !== 'user' && (
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-500 bg-[var(--background)] shadow-sm">
                          <Bot className="w-4 h-4" />
                        </div>
                      </div>
                    )}
                    <div className={cn(
                      "px-4 py-2.5 rounded-2xl text-sm leading-relaxed max-w-[80%] prose dark:prose-invert prose-sm prose-slate prose-p:my-1 prose-pre:my-2",
                      m.role === 'user' 
                        ? "bg-[var(--user-bubble)] text-[var(--user-bubble-foreground)] rounded-tr-sm" 
                        : "bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] rounded-tl-sm shadow-sm"
                    )}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkBreaks]}
                        components={{
                          code({ inline, className, children, ...props }: React.ComponentPropsWithoutRef<'code'> & { inline?: boolean }) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <SyntaxHighlighter
                                style={vscDarkPlus}
                                language={match[1]}
                                PreTag="div"
                                className="rounded-md my-2"
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                {...(props as any)}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            ) : (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            );
                          }
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    </div>
                    {m.role === 'user' && (
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-500 bg-[var(--background)] shadow-sm">
                          <User className="w-4 h-4" />
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {loading && (
            <div className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-500 bg-[var(--background)] shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[var(--background)] border border-[var(--border)] p-4 rounded-2xl rounded-tl-sm text-sm w-32 flex items-center gap-2 shadow-sm text-[var(--foreground)]">
                <Loader2 className="w-4 h-4 animate-spin text-[var(--muted-foreground)]" />
                <span className="text-[var(--muted-foreground)]">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </section>

      {/* Footer Input Area */}
      <footer className="absolute bottom-0 left-0 right-0 bg-[var(--background)]/90 backdrop-blur-sm pb-6 pt-2 px-4 shrink-0">
        <div className="max-w-3xl mx-auto w-full">
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 p-3 bg-red-500/10 text-red-600 border border-red-500/20 rounded-xl text-sm mb-4"
            >
              <AlertCircle className="w-4 h-4" />
              <span className="truncate">{error}</span>
              <button onClick={() => sendMessage(input)} className="ml-auto underline font-medium shrink-0">Retry</button>
            </motion.div>
          )}

          <form onSubmit={handleSend} className="relative w-full border-2 border-[var(--input)] bg-[var(--background)] shadow-sm transition-all focus-within:shadow-md h-[56px] flex items-center rounded-full group">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="w-full h-full bg-transparent border-none focus:ring-0 px-6 text-base placeholder-slate-500 rounded-full text-[var(--foreground)]"
              placeholder="Message Gemini..."
              type="text"
            />
            <button 
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 p-2 mr-1 text-slate-500 hover:text-[var(--foreground)] transition-colors disabled:opacity-30"
            >
              <Send className="w-6 h-6" />
            </button>
          </form>

          {/* Disclaimer */}
          <div className="text-center mt-2">
            <p className="text-[12px] text-[var(--muted-foreground)]">Gemini can make mistakes. Check important info.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
