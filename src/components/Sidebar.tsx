'use client';

import { useChat } from '../context/ChatContext';
import { Plus, MessageSquare, Search, X, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Sidebar() {
  const { sessions, currentSession, selectSession, createSession, deleteSession, loading } = useChat();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSessions = sessions.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className="w-[260px] bg-[var(--sidebar)] flex flex-col border-r border-[var(--border)] flex-shrink-0 relative h-screen">
      {/* Sidebar Header: New Chat */}
      <div className="pt-4 pb-2 px-4">
        <button 
          onClick={() => createSession(`Session ${sessions.length + 1}`)}
          disabled={loading}
          className="flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors gap-2 ml-2 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Sidebar Search */}
      <div className="px-4 py-2">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 opacity-50 text-slate-400" />
          </div>
          <input 
            type="text"
            placeholder="Search sessions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 bg-transparent border-none text-sm placeholder-slate-400 focus:ring-0 focus:outline-none text-[var(--foreground)]"
          />
        </div>
      </div>

      {/* Sidebar List */}
      <nav className="flex-1 overflow-y-auto mt-2 px-2 space-y-1">
        {filteredSessions.map((session) => (
          <div
            key={session.id}
            onClick={() => selectSession(session.id)}
            className={cn(
              "group flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all",
              currentSession?.id === session.id 
                ? "bg-[var(--active-chat)]" 
                : "hover:bg-black/5 dark:hover:bg-white/5"
            )}
          >
            <div className="mt-1 flex-shrink-0 text-slate-500">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--foreground)] truncate">{session.title}</p>
              <p className="truncate mt-0.5 text-[10px] text-[var(--muted-foreground)]">
                {session.updatedAt.toLocaleDateString()}
              </p>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this session?')) {
                  deleteSession(session.id);
                }
              }}
              className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-md transition-all text-slate-400"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </nav>

      {/* Sidebar Footer: Issue Button */}
      <div className="p-4 mt-auto">
        <button className="bg-[var(--issue-red)] text-white rounded-full pl-1 pr-3 py-1 flex items-center gap-2 shadow-lg hover:opacity-90 transition-all">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">N</div>
          <span className="text-xs font-medium">1 Issue</span>
          <span className="text-xs font-bold ml-1 opacity-70">
            <X className="w-3 h-3" />
          </span>
        </button>
      </div>
    </aside>
  );
}
