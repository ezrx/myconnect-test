'use client';

import { Sidebar } from "../src/components/Sidebar";
import { ChatInterface } from "../src/components/ChatInterface";
import { ErrorBoundary } from "../src/components/ErrorBoundary";

export default function Home() {
  return (
    <ErrorBoundary>
      <main className="flex h-screen overflow-hidden">
        <Sidebar />
        <ChatInterface />
      </main>
    </ErrorBoundary>
  );
}
