import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Sparkles, Paperclip, Mic, User, Clock } from 'lucide-react';
import { PageHeader, PageContainer } from '@/components/PageHeader';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { getChatHistory, sendMentorMessage } from '@/services/resourceService';
import { useAuth } from '@/context/AuthContext';
import { mentorPrompts } from '@/data/pageData';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  time: string;
}

export default function MentorPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getChatHistory()
      .then((res) => {
        if (res && res.messages) {
          const formatted = res.messages.map((m: any, idx: number) => ({
            id: m.id || `${idx}-${m.role}`,
            role: m.role,
            text: m.text,
            time: m.time || 'Now',
          }));
          setMessages(formatted);
        }
      })
      .catch((err) => {
        console.error('Failed to load chat history:', err);
      });
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Math.random().toString(36).slice(2), role: 'user', text, time: 'Now' };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setTyping(true);
    try {
      const res = await sendMentorMessage(text);
      if (res && res.history && res.history.messages) {
        const formatted = res.history.messages.map((m: any, idx: number) => ({
          id: m.id || `${idx}-${m.role}`,
          role: m.role,
          text: m.text,
          time: m.time || 'Now',
        }));
        setMessages(formatted);
      }
    } catch (err) {
      console.error('Failed to send mentor message:', err);
    } finally {
      setTyping(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader title="AI Mentor" subtitle="Your personal AI career coach — ask anything about skills, careers, or prep.">
        <Badge color="primary"><Sparkles size={13} /> Powered by ML</Badge>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Chat */}
        <Card className="lg:col-span-3 flex flex-col" delay={0.05}>
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-slate-800">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center"><Bot size={20} /></div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full ring-2 ring-white dark:ring-slate-900" />
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900 dark:text-slate-100">CareerCompass AI</p>
              <p className="text-xs text-success">Online · responds instantly</p>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto py-4 space-y-4 min-h-[400px] max-h-[480px]">
            {messages.map((m) => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-primary text-white' : 'bg-gradient-to-br from-primary to-secondary text-white'}`}>
                  {m.role === 'user' ? <User size={15} /> : <Bot size={15} />}
                </div>
                <div className={`max-w-[75%] ${m.role === 'user' ? 'items-end' : ''}`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm ${m.role === 'user' ? 'bg-primary text-white rounded-tr-sm' : 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-slate-100 rounded-tl-sm'}`}>
                    {m.text}
                  </div>
                  <p className={`text-[10px] text-gray-400 mt-1 ${m.role === 'user' ? 'text-right' : ''}`}>{m.time}</p>
                </div>
              </motion.div>
            ))}
            <AnimatePresence>
              {typing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center shrink-0"><Bot size={15} /></div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-gray-100 dark:bg-slate-800 flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span key={i} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input */}
          <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800/50 rounded-xl p-1.5">
              <button className="w-9 h-9 rounded-lg text-gray-400 hover:text-primary flex items-center justify-center transition"><Paperclip size={18} /></button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send(input)}
                placeholder="Ask your AI mentor anything..."
                className="flex-1 bg-transparent text-sm focus:outline-none px-1"
              />
              <button className="w-9 h-9 rounded-lg text-gray-400 hover:text-primary flex items-center justify-center transition"><Mic size={18} /></button>
              <button onClick={() => send(input)} className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary-600 transition active:scale-95">
                <Send size={16} />
              </button>
            </div>
          </div>
        </Card>

        {/* Sidebar: prompts + history */}
        <div className="space-y-4">
          <Card delay={0.1}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-primary" />
              <h3 className="font-semibold text-sm">Suggested Prompts</h3>
            </div>
            <div className="space-y-2">
              {mentorPrompts.map((p) => (
                <button key={p} onClick={() => send(p)} className="w-full text-left text-xs text-gray-600 dark:text-slate-300 p-2.5 rounded-xl border border-gray-100 dark:border-slate-800 hover:border-primary/30 hover:bg-primary/5 transition">
                  {p}
                </button>
              ))}
            </div>
          </Card>

          <Card delay={0.15}>
            <div className="flex items-center gap-2 mb-3">
              <Clock size={16} className="text-secondary" />
              <h3 className="font-semibold text-sm">Chat History</h3>
            </div>
            <div className="space-y-1">
              {['ML Engineer roadmap', 'MLOps skill gap', 'Interview prep plan', 'Certification advice'].map((h, i) => (
                <button key={h} className={`w-full text-left text-xs p-2.5 rounded-lg transition ${i === 0 ? 'bg-primary/10 text-primary font-medium' : 'text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/50'}`}>
                  {h}
                </button>
              ))}
            </div>
          </Card>

          <Card delay={0.2} className="bg-gradient-to-br from-secondary/10 to-primary/5 border-secondary/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                {(user?.full_name || 'S')[0]}
              </div>
              <div>
                <p className="text-xs font-medium text-gray-900 dark:text-slate-100">{user?.full_name || 'Student'}</p>
                <p className="text-[10px] text-gray-500">1-day mentorship streak</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
