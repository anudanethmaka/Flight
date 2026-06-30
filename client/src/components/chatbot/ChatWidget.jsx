import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, X, Send, Plane } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '../../services/api';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

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

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence mode="wait">
        {open ? (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.92 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="w-[350px] max-w-[calc(100vw-3rem)] h-[460px] glass-strong rounded-2xl border border-accent/20 shadow-glow flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-r from-primary/20 to-accent/15">
              <div className="flex items-center gap-2.5">
                <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent shadow-glow-teal">
                  <Sparkles className="w-4.5 h-4.5 text-white" />
                </span>
                <div className="leading-tight">
                  <p className="font-semibold text-sm text-foreground">SkyLink Assistant</p>
                  <p className="text-[11px] text-accent flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Online
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-muted hover:text-foreground transition-colors cursor-pointer"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center text-muted px-4">
                  <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/10 mb-3">
                    <Plane className="w-6 h-6 text-accent" />
                  </span>
                  <p className="text-foreground font-medium">How can I help?</p>
                  <p className="text-xs mt-1">Ask about flights, baggage, or your bookings.</p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                  <span
                    className={`inline-block px-3.5 py-2 rounded-2xl max-w-[85%] ${
                      m.role === 'user'
                        ? 'bg-accent text-surface rounded-br-sm font-medium whitespace-pre-wrap'
                        : 'glass border border-white/10 text-foreground rounded-bl-sm text-sm'
                    }`}
                  >
                    {m.role === 'user' ? (
                      m.text
                    ) : (
                      <ReactMarkdown
                        components={{
                          p: ({node, ...props}) => <p className="mb-1.5 last:mb-0" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-1.5 space-y-0.5" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-1.5 space-y-0.5" {...props} />,
                          li: ({node, ...props}) => <li className="mb-0.5" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-semibold text-accent-foreground" {...props} />,
                          a: ({node, ...props}) => <a className="text-accent underline hover:text-accent-dark transition-colors" {...props} />
                        }}
                      >
                        {m.text}
                      </ReactMarkdown>
                    )}
                  </span>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <span className="glass border border-white/10 rounded-2xl rounded-bl-sm px-3.5 py-2.5 flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" />
                  </span>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/10 flex gap-2">
              <input
                className="flex-1 bg-surface-2/70 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/30 transition-all"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about flights..."
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent text-surface hover:bg-accent-dark transition-colors disabled:opacity-50 cursor-pointer"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="bubble"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            onClick={() => setOpen(true)}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent text-white shadow-glow animate-pulseGlow cursor-pointer"
            aria-label="Open SkyLink Assistant"
          >
            <Sparkles className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
