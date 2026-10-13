import React, { useEffect, useState, useRef } from 'react';
import {
  Bot,
  Send,
  User,
  Sparkles,
  HelpCircle,
  Plus,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const Advisor: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const defaultPrompts = [
    'What career suits me best?',
    'What skills should I learn next?',
    'How can I become a data analyst?',
    'Help me prepare for an interview.',
    'Which skills am I missing?',
  ];

  const fetchSessions = async () => {
    try {
      const res = await api.get<{ sessions: any[] }>('/student/chat/sessions');
      if (res?.sessions?.length > 0) {
        setSessions(res.sessions);
        setCurrentSessionId(res.sessions[0].id);
        fetchMessages(res.sessions[0].id);
      } else {
        // Initial mock greeting if brand new session
        setMessages([
          {
            id: 1,
            sender: 'assistant',
            message: `Hello ${user?.fullName?.split(' ')[0] || 'Student'}! 👋 I am your AI Career Advisor. I have evaluated your profile and verified skills.\n\nHow can I help accelerate your career today? Ask me about career choices, specific skill gaps, interview tactics, or campus placement drives!`,
            suggestedPrompts: defaultPrompts,
            provider: 'rule-engine',
          },
        ]);
        setLoading(false);
      }
    } catch (err) {
      console.error('Failed to load chat sessions:', err);
      setLoading(false);
    }
  };

  const fetchMessages = async (sessionId: number) => {
    try {
      const res = await api.get<{ session: any; messages: any[] }>(`/student/chat/messages/${sessionId}`);
      if (res) {
        setMessages(res.messages || []);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleSendMessage = async (textToSend?: string) => {
    const message = textToSend || inputText;
    if (!message || !message.trim() || sending) return;

    const optimisticUserMsg = {
      id: Date.now(),
      sender: 'user',
      message: message.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticUserMsg]);
    setInputText('');
    setSending(true);

    try {
      const res = await api.post<{ sessionId: number; message: any }>('/student/chat/message', {
        sessionId: currentSessionId,
        message: message.trim(),
      });

      if (res) {
        setCurrentSessionId(res.sessionId);
        setMessages((prev) => [...prev, res.message]);

        // If newly created session, refresh session list
        if (!currentSessionId) {
          fetchSessions();
        }
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'assistant',
          message: 'Sorry, I encountered an issue analyzing that request. Please try asking again.',
          suggestedPrompts: defaultPrompts,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setMessages([
      {
        id: Date.now(),
        sender: 'assistant',
        message: `New advising session started! What area of your career roadmap would you like to explore?`,
        suggestedPrompts: defaultPrompts,
        provider: 'rule-engine',
      },
    ]);
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col md:flex-row rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      {/* Left Column: Sessions Sidebar */}
      <div className="hidden md:flex flex-col w-64 border-r border-slate-100 bg-slate-50/50 p-4 shrink-0">
        <button
          onClick={handleNewChat}
          className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition mb-4"
        >
          <Plus className="w-4 h-4" /> New Career Session
        </button>

        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
          Recent Advising History
        </span>

        <div className="flex-1 overflow-y-auto space-y-1.5">
          {sessions.map((sess) => (
            <button
              key={sess.id}
              onClick={() => {
                setCurrentSessionId(sess.id);
                fetchMessages(sess.id);
              }}
              className={`w-full text-left p-2.5 rounded-xl text-xs font-medium transition truncate ${
                currentSessionId === sess.id
                  ? 'bg-white text-indigo-700 font-bold shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{sess.title}</span>
              </div>
            </button>
          ))}
          {sessions.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-6">No previous sessions.</p>
          )}
        </div>

        {/* AI Status Badge */}
        <div className="pt-3 border-t border-slate-200/60 text-[11px] text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Student Context Embedded</span>
        </div>
      </div>

      {/* Right Column: Chat Window */}
      <div className="flex-1 flex flex-col justify-between h-full bg-white">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">AI Career Advisor</h3>
              <p className="text-[11px] text-slate-400">Context: {user?.degree} • {user?.branch}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
              Active Advisor
            </span>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m, idx) => {
            const isBot = m.sender === 'assistant';
            return (
              <div key={idx} className={`flex gap-3 ${isBot ? 'items-start' : 'justify-end'}`}>
                {isBot && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-xl rounded-2xl p-4 text-xs leading-relaxed ${
                  isBot
                    ? 'bg-slate-50 text-slate-800 border border-slate-100'
                    : 'bg-indigo-600 text-white shadow-xs'
                }`}>
                  <p className="whitespace-pre-line">{m.message}</p>

                  {/* Suggested follow-up prompt chips */}
                  {isBot && m.suggestedPrompts?.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex flex-wrap gap-1.5">
                      {m.suggestedPrompts.map((chip: string, cIdx: number) => (
                        <button
                          key={cIdx}
                          onClick={() => handleSendMessage(chip)}
                          className="text-[10px] font-semibold bg-white text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg hover:bg-indigo-50 transition"
                        >
                          {chip} →
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {!isBot && (
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-1">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
            );
          })}

          {sending && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 text-xs text-slate-400 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse delay-75"></div>
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse delay-150"></div>
                <span>Analyzing your query against student profile...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about careers, interview prep, skill gaps, or roadmaps..."
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white transition disabled:opacity-50 shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
