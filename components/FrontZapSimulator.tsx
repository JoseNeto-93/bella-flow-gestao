import { useState } from 'react';
import chatApi from '../services/chatApi';

interface Message {
  from: 'client' | 'system';
  text: string;
}

export default function FrontZapSimulator() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  function sendMessage() {
    if (!input.trim()) return;

    const clientMessage: Message = { from: 'client', text: input };
    setMessages(prev => [...prev, clientMessage]);

    // Usa o phone do salão logado ao invés de 'web-client'
    const phone = localStorage.getItem('phone') || 'web-client';
    
    chatApi.sendMessage(phone, input).then((data: any) => {
      setMessages(prev => [
        ...prev,
        { from: 'system', text: data?.reply || 'Erro' }
      ]);
    });

    setInput('');
  }

  return (
    <div className="bg-black text-white p-4 rounded-2xl space-y-3 border border-white/10">
      <h3 className="text-lg font-semibold">Simulador FrontZap</h3>

      <div className="h-64 overflow-y-auto space-y-2 p-2 rounded-xl bg-white/5">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`text-sm p-3 rounded-2xl max-w-[80%]
              ${m.from === 'client'
                ? 'bg-pink-600 ml-auto'
                : 'bg-white/10 mr-auto'}`}
          >
            {m.text}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 bg-white/10 rounded-xl px-3 py-2 text-sm outline-none"
          placeholder="Ex: Quero fazer unha amanhã às 15h"
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button
          onClick={sendMessage}
          className="bg-pink-600 px-4 rounded-xl text-sm font-medium"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
