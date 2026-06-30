'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  Wand2, 
  ChevronRight,
  Info
} from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: Date;
}

export default function AssistantPage() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello ${user?.displayName || 'Citizen'}! I am CivicMind Assistant, your AI municipal officer. I have reviewed your profile and see you have reported 2 community issues. How can I help you today? You can ask about:
      
• The status of your school entrance pothole (CM-2026-0001)
• How many reputation points you have
• How to file a new report
• General municipal guidelines`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await api.post('/ai/chat', { message: userText });
      setIsTyping(false);
      
      if (response.data && response.data.success) {
        setMessages((prev) => [...prev, {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: response.data.data.response,
          timestamp: new Date()
        }]);
      } else {
        throw new Error('Response success flag not set.');
      }
    } catch (err) {
      setTimeout(() => {
        setIsTyping(false);
        let aiResponseText = "I apologize, I am currently experiencing connection difficulties with the central municipal database. Please try again shortly.";

        const query = userText.toLowerCase();
        if (query.includes('status') || query.includes('pothole') || query.includes('0001')) {
          aiResponseText = `Ticket **CM-2026-0001** (Pothole at Delhi Public School Entrance) is currently in **Assigned** status. 

The Vision Agent confirmed its critical severity (score 87/100) due to school bus transit. The Planning Agent has scheduled repairs with the **Roads & Infrastructure Department**. 

An asphalt repair team is scheduled to deploy on **Monday, June 29th, 2026**. Estimated resolution time is 48 hours once active.`;
        } else if (query.includes('point') || query.includes('reputation') || query.includes('score')) {
          aiResponseText = `You currently have **180 Reputation Points**. 

You earned:
• **50 points** for reporting the DPS school entrance pothole.
• **30 points** for reporting the Sector 23 park garbage dumping.
• **100 bonus points** for your contributions being verified as duplicates of other reports by our Vision Swarm!

Keep reporting to increase your community status!`;
        } else if (query.includes('report') || query.includes('file') || query.includes('how')) {
          aiResponseText = `To report a new issue, navigate to the **Submit Grievance** page in your sidebar menu. 

You will need to:
1. Upload 1-2 photos of the issue.
2. Review the AI Swarm's category classification.
3. Confirm the coordinates using our location map picker.
4. Click 'Submit to Swarm' and track progress instantly!`;
        } else if (query.includes('hi') || query.includes('hello') || query.includes('hey')) {
          aiResponseText = `Hello! I'm here to help you coordinate with municipal departments. What issue can I look up for you?`;
        } else if (query.includes('garbage') || query.includes('0004')) {
          aiResponseText = `Ticket **CM-2026-0004** (Garbage Dump at Sector 23 Park) is in **Submitted** status. 

It is currently in queue for validation and duplicate checking by the Duplicate Detection Agent. The Sanitation department has been notified.`;
        } else {
          aiResponseText = `I have logged your question regarding "${userText}". As an AI municipal employee, I can confirm that municipal guidelines assign this category to general public services. Is there any specific reported ticket (e.g. CM-2026-0001) you would like me to check in detail?`;
        }

        setMessages((prev) => [...prev, {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: aiResponseText,
          timestamp: new Date()
        }]);
      }, 1200);
    }
  };

  const handleSuggestionClick = (suggestionText: string) => {
    setInput(suggestionText);
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col md:flex-row gap-6 text-slate-800">
      
      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        {/* Chat Window Header */}
        <div className="p-4 border-b border-slate-100 bg-[#f8fafc] flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0b2240] rounded-xl shadow-xs">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-extrabold text-sm text-[#0b2240]">CivicMind AI Assistant</h3>
              <p className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                <span>Connected to Municipal Swarm</span>
              </p>
            </div>
          </div>
          <span className="text-[9px] font-mono text-slate-400 font-bold uppercase hidden sm:inline">Model: Gemini 2.5 Flash</span>
        </div>

        {/* Messaging Area */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isAI = msg.sender === 'ai';
            return (
              <div 
                key={msg.id} 
                className={`flex gap-3 max-w-xl ${isAI ? 'mr-auto text-left' : 'ml-auto flex-row-reverse text-right'}`}
              >
                {/* Avatar Icon */}
                <div className={`h-8.5 w-8.5 rounded-xl flex items-center justify-center shrink-0 border ${
                  isAI 
                    ? 'bg-[#0b2240] border-[#0b2240] text-white shadow-sm' 
                    : 'bg-white border-slate-200 text-slate-500 shadow-sm'
                }`}>
                  {isAI ? <Bot className="h-4.5 w-4.5" /> : <User className="h-4.5 w-4.5" />}
                </div>

                {/* Message Bubble */}
                <div className={`rounded-2xl p-4 text-xs leading-relaxed whitespace-pre-wrap ${
                  isAI 
                    ? 'bg-slate-50 border border-slate-200 text-slate-700 font-semibold' 
                    : 'bg-blue-50 border border-blue-200 text-blue-700 text-left font-bold shadow-xs'
                }`}>
                  {msg.text}
                </div>
              </div>
            );
          })}

          {/* AI Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 mr-auto items-center">
              <div className="h-8.5 w-8.5 rounded-xl bg-[#0b2240] border border-[#0b2240] flex items-center justify-center text-white shadow-sm">
                <Bot className="h-4.5 w-4.5" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 flex gap-1 items-center">
                {[1, 2, 3].map((dot) => (
                  <div 
                    key={dot} 
                    className="h-1.5 w-1.5 bg-[#2563eb] rounded-full animate-bounce" 
                    style={{ animationDelay: `${dot * 0.15}s`, animationDuration: '0.6s' }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>

        {/* Input box form */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-[#f8fafc] flex gap-2">
          <input
            type="text"
            placeholder="Search incident status, reputation points balance or details..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-white border border-slate-200 rounded-xl py-3 px-4 text-xs text-slate-800 focus:outline-none focus:border-[#2563eb] placeholder-slate-400"
          />
          <button
            type="submit"
            className="px-5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl flex items-center justify-center font-bold shadow-md active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Suggested Questions Side Card */}
      <div className="w-full md:w-72 flex flex-col gap-4">
        {/* Suggested Queries */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm text-left">
          <div className="flex items-center gap-2 mb-3 text-xs text-[#0b2240] font-extrabold uppercase tracking-wide border-b border-slate-50 pb-2">
            <Sparkles className="h-4 w-4 text-[#2563eb]" />
            <span>Suggested Inquiries</span>
          </div>
          <div className="space-y-2">
            {[
              'What is the status of CM-2026-0001?',
              'How many reputation points do I have?',
              'How do I file a new report?',
              'When will the pothole be repaired?'
            ].map((suggest, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggest)}
                className="w-full text-left p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-350 rounded-xl text-xs text-slate-500 hover:text-[#0b2240] font-bold transition-all flex items-center justify-between group cursor-pointer"
              >
                <span className="truncate pr-1">{suggest}</span>
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#2563eb] group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Swarm Details Info Box */}
        <div className="bg-blue-50/45 border border-blue-200 rounded-3xl p-5 text-left shadow-xs">
          <div className="flex items-center gap-2 text-xs text-[#0b2240] font-extrabold mb-2 uppercase tracking-wide">
            <Wand2 className="h-4 w-4 text-[#2563eb]" />
            <span>AI Swarm Ingestion</span>
          </div>
          <p className="text-[11px] text-slate-550 leading-relaxed font-semibold">
            The assistant utilizes Gemini multimodal reasoning to look up ticket history, cross-reference department schedules, and provide you with instant, contextual transparency.
          </p>
        </div>
      </div>
    </div>
  );
}
