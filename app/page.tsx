"use client";

import { useState, useRef, useEffect } from 'react';

type ChatMessage = {
  id: number;
  text?: string;
  file?: {
    url: string;
    type: 'image' | 'video';
  };
  sender: 'me' | 'other';
};

export default function Page() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const sendMessage = () => {
    if (!input && !file) return;
    const msg: ChatMessage = {
      id: Date.now(),
      sender: 'me',
    };
    if (input) msg.text = input;
    if (file) {
      const url = URL.createObjectURL(file);
      const type = file.type.startsWith('image')
        ? 'image'
        : file.type.startsWith('video')
        ? 'video'
        : null;
      if (type) msg.file = { url, type };
    }
    setMessages(prev => [...prev, msg]);
    setInput('');
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <header className="bg-blue-600 text-white p-4 text-center font-semibold">
        💬 Public Chat
      </header>
      <main className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs sm:max-w-md p-3 rounded-lg space-y-2 ${
                m.sender === 'me'
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-gray-300 text-gray-900 rounded-bl-none'
              }`}
            >
              {m.text && <p className="whitespace-pre-wrap">{m.text}</p>}
              {m.file?.type === 'image' && (
                <img src={m.file.url} alt="uploaded" className="rounded" />
              )}
              {m.file?.type === 'video' && (
                <video src={m.file.url} controls className="rounded max-h-60" />
              )}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </main>
      <div className="p-4 bg-white flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-full hover:bg-gray-200"
        >
          📎
        </button>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message"
          className="flex-1 rounded-full border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={sendMessage}
          className="p-2 text-blue-600 hover:text-blue-800"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
