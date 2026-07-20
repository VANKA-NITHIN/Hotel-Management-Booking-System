import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/client';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  name?: string;
  tool_calls?: any[];
  tool_call_id?: string;
}

const SYSTEM_PROMPT = `You are the LuxuryStay AI Concierge. You are a helpful, professional, and sophisticated hotel booking agent. 
Your goal is to help users find hotels and book them. 

You have access to the following tools:
1. \`search_hotels\`: Fetches a list of available hotels. You can optionally provide a 'city' to filter the results.
2. \`start_booking\`: Automatically navigates the user's browser to the booking page for a specific hotel ID.

When a user asks to find a hotel, ALWAYS use the \`search_hotels\` tool to get real data. Never make up hotel names. 
After getting the results, present them nicely to the user (mentioning Name, City, and Starting Price).
When a user asks to book a specific hotel, use the \`start_booking\` tool with the correct \`hotelId\`. 
When a user asks about their own bookings or trips, use the \`check_my_bookings\` tool.
Keep your responses concise, elegant, and professional. Use formatting like bullet points when listing hotels.`;

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'system',
      role: 'system',
      content: SYSTEM_PROMPT,
    },
    {
      id: 'greeting',
      role: 'assistant',
      content: "Hello! Welcome to LuxuryStay! 🏨 I'm your AI hotel agent. I can help you find real-time hotel availability and even book a room for you. Where would you like to stay?",
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
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

  // The main chat logic with tool execution loop
  const handleAgenticChat = async (chatHistory: Message[]) => {
    if (!OPENROUTER_API_KEY) {
      toast.error('OpenRouter API key is missing from .env');
      setIsLoading(false);
      return;
    }

    try {
      // 1. Send the conversation to the AI
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.href,
          'X-Title': 'LuxuryStay Agent',
        },
        body: JSON.stringify({
          model: 'openrouter/free', // Fallback to best available free model
          messages: chatHistory.map(m => {
            const cleanMsg: any = { role: m.role, content: m.content || "" };
            if (m.name) cleanMsg.name = m.name;
            if (m.tool_calls) cleanMsg.tool_calls = m.tool_calls;
            if (m.tool_call_id) cleanMsg.tool_call_id = m.tool_call_id;
            return cleanMsg;
          }),
          tools: [
            {
              type: "function",
              function: {
                name: "search_hotels",
                description: "Search for available hotels in the database.",
                parameters: {
                  type: "object",
                  properties: {
                    city: { type: "string", description: "The city to search in (e.g. 'Paris', 'New York'). Optional." }
                  }
                }
              }
            },
            {
              type: "function",
              function: {
                name: "start_booking",
                description: "Navigates the user to the secure checkout page for a specific hotel.",
                parameters: {
                  type: "object",
                  properties: {
                    hotelId: { type: "number", description: "The ID of the hotel to book." }
                  },
                  required: ["hotelId"]
                }
              }
            },
            {
              type: "function",
              function: {
                name: "check_my_bookings",
                description: "Checks the currently logged-in user's upcoming bookings.",
                parameters: {
                  type: "object",
                  properties: {}
                }
              }
            }
          ],
          tool_choice: "auto"
        }),
      });

      if (!response.ok) throw new Error('API Request Failed');

      const data = await response.json();
      const assistantMessage = data.choices[0].message;

      // Add the assistant's message (might contain text, tool_calls, or both)
      const newAssistantMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: assistantMessage.content || "",
        tool_calls: assistantMessage.tool_calls
      };
      
      let updatedHistory = [...chatHistory, newAssistantMsg];
      setMessages(updatedHistory);

      // 2. If the AI decided to call a tool, execute it
      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        for (const toolCall of assistantMessage.tool_calls) {
          const args = JSON.parse(toolCall.function.arguments);
          let toolResult = "";

          try {
            if (toolCall.function.name === 'search_hotels') {
              // Execute local search
              const res = await api.get('/hotels'); // We fetch all for simplicity, then filter
              let hotels = res.data.content || [];
              if (args.city) {
                hotels = hotels.filter((h: any) => h.city.toLowerCase().includes(args.city.toLowerCase()));
              }
              // Map to a smaller payload to save tokens
              const simplified = hotels.map((h: any) => ({
                id: h.id,
                name: h.name,
                city: h.city,
                price: h.startingPrice,
                rating: h.rating
              }));
              toolResult = JSON.stringify(simplified);
            } 
            else if (toolCall.function.name === 'start_booking') {
              // Execute navigation
              setTimeout(() => {
                setIsOpen(false);
                navigate(`/booking?hotelId=${args.hotelId}`);
              }, 1500);
              toolResult = JSON.stringify({ success: true, message: `Navigating user to checkout for hotel ID ${args.hotelId}...` });
            }
            else if (toolCall.function.name === 'check_my_bookings') {
              // Mocked response for demo purposes (would normally hit /api/bookings/me)
              toolResult = JSON.stringify([
                { id: 101, hotelName: "Grand Plaza", checkIn: "2026-08-15", checkOut: "2026-08-20", status: "CONFIRMED" }
              ]);
            }
          } catch (err: any) {
             toolResult = JSON.stringify({ error: err.message });
          }

          // Append tool result to history
          updatedHistory = [
            ...updatedHistory,
            {
              id: Date.now().toString() + Math.random(),
              role: 'tool',
              name: toolCall.function.name,
              tool_call_id: toolCall.id,
              content: toolResult
            }
          ];
        }

        setMessages(updatedHistory);
        // 3. Send the tool results back to the AI for a final response
        await handleAgenticChat(updatedHistory);
      } else {
        // If no tool calls, the conversation turn is complete
        setIsLoading(false);
      }

    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting to my brain right now. Please try again in a moment.",
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

    await handleAgenticChat(newHistory);
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
        className="fixed bottom-6 right-6 z-[100] w-14 h-14 rounded-full gold-gradient shadow-xl flex items-center justify-center hover:scale-110 transition-transform"
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
            className="fixed bottom-24 right-6 z-[100] w-[380px] max-w-[calc(100vw-3rem)] bg-bg-surface rounded-2xl shadow-2xl border border-border-base overflow-hidden flex flex-col"
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
