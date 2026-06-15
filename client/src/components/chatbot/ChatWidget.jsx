import { useState } from 'react';
import api from '../../services/api';
import Button from '../ui/Button';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/chatbot/query', { message: userMsg.text });
      setMessages((prev) => [...prev, { role: 'bot', text: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'bot', text: 'Something went wrong.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 bg-primary text-white rounded-full w-14 h-14 shadow-lg text-2xl flex items-center justify-center z-50 hover:bg-primary-light transition-colors"
      >
        💬
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 h-96 bg-white rounded-card shadow-xl flex flex-col z-50 border border-gray-200 overflow-hidden">
      <div className="bg-primary text-white px-4 py-3 flex justify-between items-center">
        <span className="font-semibold">SkyLink Assistant</span>
        <button onClick={() => setOpen(false)} className="text-white hover:text-gray-200 text-lg">
          ✕
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3 text-sm bg-gray-50">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <span
              className={`inline-block px-3 py-2 rounded-lg max-w-[85%] ${
                m.role === 'user'
                  ? 'bg-primary text-white rounded-br-none'
                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm whitespace-pre-wrap'
              }`}
            >
              {m.text}
            </span>
          </div>
        ))}
        {loading && <p className="text-muted text-xs italic ml-2">Assistant is thinking...</p>}
      </div>
      <div className="p-3 bg-white border-t flex gap-2">
        <input
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about flights..."
        />
        <Button onClick={sendMessage} className="px-3 py-2 text-sm">Send</Button>
      </div>
    </div>
  );
}
