import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Loader2, Bot, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { ChatMessage } from '../types';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Hi! I'm RentalMate AI. I can help you save ₹300+ and 3 hours on your rental search. How can I help you find a verified home today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => {
    const saved = localStorage.getItem('rentalmate_session_id');
    if (saved) return saved;
    const newId = `session_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
    localStorage.setItem('rentalmate_session_id', newId);
    return newId;
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout

    try {
      // 1. Try the n8n webhook first
      let responseText = "";
      let webhookSuccess = false;
      try {
        const response = await fetch('https://reckon3.app.n8n.cloud/webhook/520a769d-0d8f-4b8c-b065-d9fed44771d5', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: currentInput,
            chatInput: currentInput,
            query: currentInput,
            input: currentInput,
            sessionId: sessionId,
            session_id: sessionId,
            userId: sessionId
          }),
          signal: controller.signal
        });
        
        if (response.ok) {
          responseText = await response.text();
          webhookSuccess = true;
          console.log('n8n Webhook Response:', responseText);
        }
      } catch (webhookError) {
        console.warn('n8n Webhook fetch failed:', webhookError);
      }

      clearTimeout(timeoutId);

      let content = "";

      // 2. Parse n8n response if available
      if (responseText && responseText.trim() !== "") {
        console.log('Processing n8n response:', responseText);
        try {
          // Try to parse as JSON first
          let data;
          try {
            data = JSON.parse(responseText);
          } catch (e) {
            // If not JSON, it's raw text
            data = responseText;
          }
          
          const extractContent = (obj: any): string | null => {
            if (!obj) return null;
            
            // If it's a string
            if (typeof obj === 'string') {
              const trimmed = obj.trim();
              if (trimmed.length > 0) {
                return trimmed;
              }
              return null;
            }

            if (Array.isArray(obj)) {
              // If it's an array, try to find the best content in any of its elements
              for (const item of obj) {
                const result = extractContent(item);
                if (result) return result;
              }
              return null;
            }

            if (typeof obj === 'object') {
              // Priority keys for chat responses (n8n AI Agent often uses 'output' or 'text')
              const priorityKeys = ['output', 'message', 'text', 'response', 'data', 'result', 'answer', 'reply', 'content', 'body', 'chatInput'];
              
              // First pass: check priority keys for content
              for (const key of priorityKeys) {
                if (obj[key]) {
                  const result = extractContent(obj[key]);
                  if (result) return result;
                }
              }

              // Second pass: check all other keys
              let bestCandidate: string | null = null;
              for (const key in obj) {
                if (!priorityKeys.includes(key)) {
                  const result = extractContent(obj[key]);
                  if (result) {
                    if (!bestCandidate || result.length > bestCandidate.length) {
                      bestCandidate = result;
                    }
                  }
                }
              }
              return bestCandidate;
            }
            return null;
          };

          const extracted = extractContent(data);
          
          if (extracted) {
            content = extracted;
            console.log('Extracted meaningful content from n8n:', content);
          } else {
            console.log('n8n response was generic or empty, checking if it should be used anyway');
            // If we only found generic words but the response is long, maybe it's actually content
            if (typeof data === 'string' && data.length > 20) {
              content = data;
            } else if (typeof data === 'object' && JSON.stringify(data).length > 50) {
              // If it's a complex object but we couldn't find a clear message, 
              // it's better to let Gemini handle it or show a summary
              console.log('Complex object from n8n but no clear message found');
            }
          }
        } catch (e) {
          console.error('Error parsing n8n response:', e);
          content = responseText;
        }
      }

      // 3. Fallback logic
      // We use Gemini ONLY if n8n failed completely or returned absolutely no content
      const hasN8nOutput = webhookSuccess && content && content.trim().length > 0;

      if (!hasN8nOutput) {
        console.log('n8n failed or returned no output: using Gemini AI fallback');
        
        try {
          const apiKey = process.env.GEMINI_API_KEY;
          if (apiKey) {
            const ai = new GoogleGenAI({ apiKey });
            
            const promptContext = !webhookSuccess 
              ? `The user said: "${currentInput}". Our primary search agent (n8n) is currently unavailable. Provide a helpful response about RentalMate AI and explain that we are still processing their request.`
              : `The user said: "${currentInput}". The backend returned no specific message. Provide a helpful response about how RentalMate AI can help them find a home.`;

            const result = await ai.models.generateContent({
              model: "gemini-3-flash-preview",
              contents: [{ role: 'user', parts: [{ text: promptContext }] }],
              config: {
                systemInstruction: `You are RentalMate AI, the world's most advanced rental search agent. 
                Your goal is to provide meaningful, professional, and business-oriented responses.
                
                Context:
                - We save users ₹300+ and 3 hours per search.
                - We eliminate brokers (saving 5-10% commission).
                - We detect fake listings using proprietary AI.
                - We are a $50M+ investment opportunity.
                
                Guidelines:
                - If the backend failed, be reassuring and helpful.
                - Always emphasize value and money saved.
                - Keep responses concise but "meaningful".`
              }
            });
            
            if (result && result.text) {
              content = result.text;
            }
          }
        } catch (geminiError) {
          console.error('Gemini fallback failed:', geminiError);
        }
      }

      if (!content || content.trim() === "") {
        content = "I'm here to help! Could you please tell me more about what you're looking for in a rental?";
      }

      const assistantMessage: ChatMessage = { 
        role: 'assistant', 
        content: String(content)
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      let errorMessage = "Sorry, I'm having trouble connecting right now.";
      
      if (error.name === 'AbortError') {
        errorMessage = "The request took too long. Please try again.";
      } else if (error.message) {
        errorMessage = `Connection error: ${error.message}`;
      }
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: errorMessage 
      }]);
    } finally {
      setIsLoading(false);
      clearTimeout(timeoutId);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-[calc(100vw-2rem)] sm:w-[400px] h-[500px] glass rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-white/20 dark:border-slate-800/50"
          >
            {/* Header */}
            <div className="p-4 bg-linear-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">RentalMate AI</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <p className="text-[10px] opacity-80">Always active</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[85%] p-3 rounded-2xl text-sm",
                    msg.role === 'user' 
                      ? "bg-indigo-600 text-white rounded-tr-none" 
                      : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none"
                  )}>
                    <div className="markdown-body">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none flex gap-1">
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                      className="w-1.5 h-1.5 bg-indigo-400 rounded-full"
                    />
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      className="w-1.5 h-1.5 bg-indigo-400 rounded-full"
                    />
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                      className="w-1.5 h-1.5 bg-indigo-400 rounded-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-slate-200 dark:border-slate-800 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                <Send size={20} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>
    </div>
  );
}
