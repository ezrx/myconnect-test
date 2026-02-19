'use client';

import { useChat } from '../context/ChatContext';
import { Plus, MessageSquare, Trash2, Search } from 'lucide-react';
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
    <aside className="w-80 h-screen flex flex-col border-r bg-card text-card-foreground transition-all duration-300">
      <div className="p-4 flex flex-col gap-4">
        <button
          onClick={() => createSession(`Session ${sessions.length + 1}`)}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-secondary rounded-md border-none focus:ring-1 focus:ring-ring outline-none text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredSessions.map((session) => (
          <div
            key={session.id}
            className={cn(
              "group relative flex items-center p-3 rounded-lg cursor-pointer transition-all hover:bg-secondary/50",
              currentSession?.id === session.id && "bg-secondary"
            )}
            onClick={() => selectSession(session.id)}
          >
            <MessageSquare className="w-4 h-4 mr-3 text-muted-foreground" />
            <div className="flex-1 truncate">
              <p className="text-sm font-medium truncate">{session.title}</p>
              <p className="text-xs text-muted-foreground">
                {session.updatedAt.toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteSession(session.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </aside>
  );
}
