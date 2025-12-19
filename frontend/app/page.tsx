'use client';

import { useState, useRef, useEffect } from 'react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am the Berkshire Hathaway Analyst. Ask me anything about Warren Buffett\'s investment philosophy.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Use the internal Route Handler
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: userMessage }] })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Handle streaming response if we implement streaming
      // For now, assuming basic text response from our route wrapper
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let text = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          text += chunk;
          // Update UI in real-time
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMsg = newMessages[newMessages.length - 1];
            if (lastMsg.role === 'assistant') {
              newMessages[newMessages.length - 1] = { ...lastMsg, content: text };
              return newMessages;
            } else {
              return [...newMessages, { role: 'assistant', content: text }];
            }
          });
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please ensure the agent server is running.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 bg-gray-900 text-gray-100 font-sans">
      <div className="z-10 max-w-5xl w-full items-center justify-between text-sm lg:flex mb-8">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-700 bg-gray-800/80 backdrop-blur-md pb-6 pt-8 lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-800/50 lg:p-4 text-xl font-bold text-emerald-400">
          Berkshire Hathaway RAG
        </p>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 w-full max-w-3xl overflow-y-auto mb-8 space-y-4 pr-2 scrollbar-thin scrollbar-thumb-gray-600"
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${m.role === 'user'
              ? 'bg-emerald-600 text-white rounded-br-none shadow-emerald-900/20 shadow-lg'
              : 'bg-gray-800 text-gray-100 rounded-bl-none border border-gray-700 shadow-lg'
              }`}>
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex w-full justify-start">
            <div className="bg-gray-800 text-gray-400 rounded-2xl rounded-bl-none px-5 py-3 border border-gray-700 animate-pulse">
              Thinking...
            </div>
          </div>
        )}
      </div>

      <div className="w-full max-w-3xl">
        <form onSubmit={sendMessage} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Warren Buffett..."
            className="w-full rounded-full border-gray-700 bg-gray-800/80 backdrop-blur text-white px-6 py-4 pr-16 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all shadow-xl"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute right-2 p-2 bg-emerald-500 hover:bg-emerald-400 rounded-full text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </form>
      </div>
    </main>
  );
}
