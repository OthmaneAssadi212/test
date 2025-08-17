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
  const wsRef = useRef<WebSocket | null>(null);
  const clientId = useRef<string>('' + Date.now() + Math.random());

  const sendMessage = () => {
    if (!wsRef.current || (!input && !file)) return;
    const payload: any = {
      id: Date.now(),
      senderId: clientId.current,
    };
    if (input) payload.text = input;
    const finalize = () => {
      wsRef.current?.send(JSON.stringify(payload));
    };
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const type = file.type.startsWith('image')
          ? 'image'
          : file.type.startsWith('video')
          ? 'video'
          : null;
        if (type) payload.file = { url: reader.result as string, type };
        finalize();
      };
      reader.readAsDataURL(file);
    } else {
      finalize();
    }
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

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const socket = new WebSocket(`${protocol}://${window.location.host}/api/socket`);
    wsRef.current = socket;
    socket.onmessage = event => {
      try {
        const data = JSON.parse(event.data);
        const sender = data.senderId === clientId.current ? 'me' : 'other';
        const msg: ChatMessage = {
          id: data.id,
          text: data.text,
          file: data.file,
          sender,
        };
        setMessages(prev => [...prev, msg]);
      } catch {}
    };
    return () => {
      socket.close();
    };
  }, []);

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
