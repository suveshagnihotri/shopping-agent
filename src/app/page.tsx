'use client';

import { ChatBubble } from "@/components/chat-bubble";
import { useChat } from "@ai-sdk/react";
import { Send, ShoppingBag } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [input, setInput] = useState('');
  const { messages, sendMessage, status } = useChat({
    onFinish: (message: any) => {
    },
    onError: (error: any) => {
      console.error('Chat error:', error);
    },
  } as any);

  const isLoading = status === 'submitted' || status === 'streaming';

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    sendMessage({ text: input });
    setInput('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  return (
    <main className="flex h-screen w-full flex-col bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-100 bg-white/50 px-6 backdrop-blur-xl dark:border-gray-800/50 dark:bg-gray-950/50">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-base font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Peeq Agent
            </h1>
            <span className="text-[10px] font-medium uppercase tracking-widest text-blue-600 dark:text-blue-400">
              AI Shopping Assistant
            </span>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto scroll-smooth">
        <div className="mx-auto flex max-w-3xl flex-col py-10 px-4">
          {messages?.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
              <div className="relative">
                <div className="absolute -inset-4 rounded-full bg-blue-100/50 blur-2xl dark:bg-blue-900/10" />
                <div className="relative rounded-3xl bg-white p-6 shadow-2xl shadow-blue-500/10 dark:bg-gray-900">
                  <ShoppingBag className="h-14 w-14 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
                  Welcome to Peeq
                </h2>
                <p className="max-w-sm text-base text-gray-500 dark:text-gray-400">
                  Your personal AI shopping agent. Ask me to find anything from our premium catalog.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {['Show me black t-shirts', 'Find running shoes', 'Latest men fashion', 'Best rated sneakers'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setInput(suggestion);
                    }}
                    className="rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium text-gray-600 transition-all hover:border-blue-200 hover:bg-blue-50/50 hover:text-blue-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-blue-900/50 dark:hover:bg-blue-900/10 dark:hover:text-blue-400"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((message: any) => (
                <ChatBubble key={message.id} message={message} />
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-100 bg-white/80 p-6 backdrop-blur-lg dark:border-gray-800/50 dark:bg-gray-950/80">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-3xl items-center gap-3 rounded-2xl border border-gray-200 bg-white p-2 shadow-xl shadow-gray-200/20 transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none dark:focus-within:border-blue-500/50"
        >
          <input
            className="flex-1 bg-transparent px-4 py-3 text-sm font-medium outline-none placeholder:text-gray-400 dark:text-gray-100"
            placeholder="What are you looking for today?"
            value={input}
            onChange={handleInputChange}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-700 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:shadow-none disabled:hover:scale-100"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
        <p className="mt-3 text-center text-[10px] font-medium uppercase tracking-widest text-gray-400 dark:text-gray-600">
          Powered by Peeq AI
        </p>
      </div>
    </main>
  );
}
