import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Plane, Loader2, MessageSquare } from 'lucide-react';
import { flightApi } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', text: string, flights?: any[] }[]>([
    { role: 'assistant', text: 'Hi there! I am your AI Travel Assistant. Where would you like to fly?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await flightApi.chatWithAssistant(userMessage);
      const data = response.data;
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: data.message, 
        flights: data.flights 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: 'Sorry, I am having trouble connecting to my brain right now! Please try again later.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 bg-airline-600 hover:bg-airline-700 text-white rounded-full shadow-xl transition-all duration-300 transform hover:scale-105 z-50 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <MessageSquare className="h-6 w-6" />
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-6 right-6 w-80 sm:w-96 glass-panel-dark bg-slate-900/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-500 ease-in-out z-50 ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-[120%] opacity-0 pointer-events-none'}`}
        style={{ height: '500px', maxHeight: 'calc(100vh - 48px)' }}
      >
        {/* Header */}
        <div className="bg-airline-600 p-4 flex justify-between items-center shadow-md">
          <div className="flex items-center space-x-2 text-white">
            <div className="bg-white/20 p-2 rounded-full">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">SkyLink Assistant</h3>
              <p className="text-xxs text-airline-100">Powered by AI</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${msg.role === 'user' ? 'bg-airline-600 text-white rounded-br-sm' : 'bg-white text-slate-800 rounded-bl-sm border border-slate-100'}`}>
                <p className="leading-relaxed">{msg.text}</p>
                
                {/* Render flights if any */}
                {msg.flights && msg.flights.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {msg.flights.slice(0, 3).map((flight: any) => (
                      <div 
                        key={flight.id} 
                        onClick={() => {
                          setIsOpen(false);
                          navigate(`/flights?departure=${flight.departureAirport}&arrival=${flight.arrivalAirport}`);
                        }}
                        className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 cursor-pointer hover:bg-airline-50 hover:border-airline-200 transition-colors"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-xs text-slate-800">{flight.flightNumber}</span>
                          <span className="text-airline-600 font-bold text-xs">${flight.price}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xxs text-slate-500 font-medium">
                          <span>{flight.departureAirport}</span>
                          <Plane className="h-3 w-3" />
                          <span>{flight.arrivalAirport}</span>
                        </div>
                        <div className="text-xxs text-slate-400 mt-1">
                          {new Date(flight.departureDate).toLocaleDateString()} at {flight.departureTime}
                        </div>
                      </div>
                    ))}
                    {msg.flights.length > 3 && (
                      <div className="text-center text-xxs text-airline-600 font-bold mt-1 cursor-pointer" onClick={() => {
                        setIsOpen(false);
                        navigate('/flights');
                      }}>
                        + {msg.flights.length - 3} more flights
                      </div>
                    )}
                  </div>
                )}
                {msg.flights && msg.flights.length === 0 && (
                  <div className="mt-2 text-xs italic text-slate-500">
                    No flights found for those dates/routes.
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl rounded-bl-sm p-3 shadow-sm border border-slate-100 flex items-center space-x-2 text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin text-airline-600" />
                <span className="text-xs font-medium">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white/95 border-t border-slate-100">
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask for flights..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-airline-500 transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="p-2.5 bg-airline-600 text-white rounded-full hover:bg-airline-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-md"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AIAssistant;
