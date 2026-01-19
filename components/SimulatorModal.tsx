import { useState } from 'react';
import { X } from 'lucide-react';

interface Message {
  from: 'client' | 'system';
  text: string;
}

interface BotResponse {
  mensagem: string;
}

interface SimulatorModalProps {
  onClose: () => void;
  onSendMessage: (
    message: string
  ) => Promise<string | BotResponse>;
}

export default function SimulatorModal({
  onClose,
  onSendMessage,
}: SimulatorModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      from: 'client',
      text: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await onSendMessage(input);

      // 🛡️ Normalização segura da resposta
      const text =
        typeof response === 'string'
          ? response
          : response?.mensagem || 'Não consegui entender 😕';

      const systemMessage: Message = {
        from: 'system',
        text,
      };

      setMessages(prev => [...prev, systemMessage]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [
        ...prev,
        {
          from: 'system',
          text: '❌ Erro ao processar mensagem.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center">
      <div className="w-full max-w-md bg-neutral-900 rounded-t-3xl p-5 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-white font-bold text-lg">
            Simulador FrontZap
          </h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white"
          >
            <X size={22} />
          </button>
        </div>

        {/* Messages */}
        <div className="h-72 overflow-y-auto space-y-3 px-1">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`max-w-[80%] text-sm px-4 py-2 rounded-2xl whitespace-pre-line ${
                msg.from === 'client'
                  ? 'bg-pink-600 text-white ml-auto'
                  : 'bg-white/10 text-white mr-auto'
              }`}
            >
              {msg.text}
            </div>
          ))}

          {loading && (
            <div className="bg-white/10 text-white text-sm px-4 py-2 rounded-2xl w-fit">
              🤖 Digitando...
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-white/10 text-white rounded-xl px-4 py-2 outline-none"
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            className="bg-pink-600 px-4 rounded-xl text-white font-medium"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
