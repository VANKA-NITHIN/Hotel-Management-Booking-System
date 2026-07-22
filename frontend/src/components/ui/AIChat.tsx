import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import api from '../../api/client';


interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  name?: string;
  tool_calls?: any[];
  tool_call_id?: string;
}

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'greeting',
      role: 'assistant',
      content: "Hello! Welcome to LuxuryStay! 🏨 I'm your secure AI hotel agent. How can I assist you with your travels today?",
    },
  ]);
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Secure backend AI call
  const handleAgenticChat = async (userMessageContent: string) => {
    try {
      // Send only the user message if the backend tracks memory, or send history.
      // We will send the latest user message and the session ID.
      const response = await api.post('/v1/ai/chat', {
        sessionId: sessionId,
        userMessage: userMessageContent
      });

      const data = response.data;
      
      const newAssistantMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.content || "I'm sorry, I couldn't formulate a response.",
      };
      
      setMessages((prev) => [...prev, newAssistantMsg]);
      setIsLoading(false);

    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting to my secure brain right now. Please try again in a moment.",
      }]);
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    let contextualContent = inputValue.trim();
    if (messages.length === 2) {
        contextualContent = `[System Note: User is currently on page path: ${location.pathname}] ${inputValue.trim()}`;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: contextualContent,
      role: 'user',
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputValue('');
    setIsLoading(true);

    await handleAgenticChat(contextualContent);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    'Book a hotel in Dubai',
    'What rooms are available in Paris?',
    'Find a cheap hotel',
  ];

  const visibleMessages = messages.filter(m => m.role !== 'system' && m.role !== 'tool' && !(m.role === 'assistant' && !m.content));

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 lg:bottom-6 right-6 z-100 w-14 h-14 rounded-full gold-gradient shadow-xl flex items-center justify-center hover:scale-110 transition-transform"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-100 w-[380px] max-w-[calc(100vw-3rem)] bg-bg-surface rounded-2xl shadow-2xl border border-border-base overflow-hidden flex flex-col"
            style={{ height: '500px', maxHeight: 'calc(100vh - 8rem)' }}
          >
            <div className="gradient-bg p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold">LuxuryStay Agent</h3>
                  <p className="text-xs text-white/70">AI capable of booking your stay</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {visibleMessages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    message.role === 'assistant' ? 'bg-secondary/20' : 'bg-primary/20'
                  }`}>
                    {message.role === 'assistant' ? (
                      <Bot className="w-4 h-4 text-secondary" />
                    ) : (
                      <User className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                    message.role === 'user'
                      ? 'bg-primary text-white rounded-tr-sm'
                      : 'bg-bg-surface-hover text-text-base rounded-tl-sm'
                  }`}>
                    {message.content}
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-secondary" />
                  </div>
                  <div className="bg-bg-surface-hover rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {visibleMessages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {quickQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setInputValue(q);
                      setTimeout(() => {
                        const event = new Event('submit', { bubbles: true });
                        document.querySelector('#ai-chat-form')?.dispatchEvent(event);
                      }, 100);
                    }}
                    className="text-xs px-3 py-1.5 bg-secondary/10 text-secondary rounded-full hover:bg-secondary/20 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div className="p-3 border-t border-border-base">
              <form
                id="ai-chat-form"
                onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me to book a hotel..."
                  className="flex-1 px-4 py-2.5 bg-bg-surface-hover rounded-xl text-sm text-text-base placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-secondary/30 border border-border-base"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="w-10 h-10 rounded-xl bg-secondary text-primary flex items-center justify-center hover:bg-secondary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
