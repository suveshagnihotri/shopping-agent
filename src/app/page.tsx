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
    <main className="flex h-screen w-full flex-col bg-[#0B0B0B]">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-white/5 bg-[#0B0B0B]/50 px-6 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-base font-bold tracking-tight text-gray-100">
              Peeq Agent
            </h1>
            <span className="text-[10px] font-medium uppercase tracking-widest text-violet-400">
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
                <div className="absolute -inset-4 rounded-full bg-violet-900/10 blur-2xl" />
                <div className="relative rounded-3xl bg-[#141414] p-6 shadow-2xl shadow-violet-500/10">
                  <ShoppingBag className="h-14 w-14 text-violet-400" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-extrabold tracking-tight text-gray-100">
                  Welcome to Peeq
                </h2>
                <p className="max-w-sm text-base text-gray-400">
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
                    className="rounded-xl border border-white/5 bg-[#141414] px-4 py-3 text-sm font-medium text-gray-400 transition-all hover:border-violet-900/50 hover:bg-violet-900/10 hover:text-violet-400"
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
      <div className="border-t border-white/5 bg-[#0B0B0B]/80 p-6 backdrop-blur-lg">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-3xl items-center gap-3 rounded-2xl border border-white/5 bg-[#141414] p-2 shadow-xl shadow-gray-200/20 transition-all focus-within:border-violet-500/50 focus-within:ring-4 focus-within:ring-violet-500/10"
        >
          <input
            className="flex-1 bg-transparent px-4 py-3 text-sm font-medium outline-none placeholder:text-gray-400 text-gray-100"
            placeholder="What are you looking for today?"
            value={input}
            onChange={handleInputChange}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-500/30 transition-all hover:bg-violet-700 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:shadow-none disabled:hover:scale-100"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
        <p className="mt-3 text-center text-[10px] font-medium uppercase tracking-widest text-gray-600">
          Powered by Peeq AI
        </p>
      </div>
    </main>
  );
}
