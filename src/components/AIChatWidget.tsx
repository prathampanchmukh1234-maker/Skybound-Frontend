
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTravelAssistance } from '../services/gemini';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const AIChatWidget: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Namaste! I'm your SykBound Smart Navigator. Tell me where you want to go, or ask for the 'next flight to Goa' and I'll find the perfect dates for you!" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, isLoading]);

  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('open-sykbound-chat', handleOpenChat);
    return () => window.removeEventListener('open-sykbound-chat', handleOpenChat);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const rawResponse = await getTravelAssistance(userMessage, history);
    let cleanResponse = rawResponse || '';

    const commandRegex = /COMMAND:NAVIGATE\|type=(\w+)\|to=([^|]+)\|date=([\d-]+)/i;
    const match = cleanResponse.match(commandRegex);
    
    // Improved command parsing: also check for simpler formats if the main regex fails
    let cmdType = '';
    let cmdTo = '';
    let cmdDate = '';
    let hasCommand = false;

    if (match) {
      hasCommand = true;
      cmdType = match[1].toLowerCase();
      cmdTo = match[2].trim();
      cmdDate = match[3];
      cleanResponse = cleanResponse.replace(match[0], '').trim();
    } else if (cleanResponse.includes('COMMAND:')) {
      const lines = cleanResponse.split('\n');
      const commandLine = lines.find(l => l.includes('COMMAND:'));
      if (commandLine) {
        const parts = commandLine.split('COMMAND:')[1].split('|');
        parts.forEach(p => {
          if (p.startsWith('type=')) cmdType = p.split('=')[1].toLowerCase();
          if (p.startsWith('to=')) cmdTo = p.split('=')[1];
          if (p.startsWith('date=')) cmdDate = p.split('=')[1];
        });
        if (cmdType) {
          hasCommand = true;
          cleanResponse = cleanResponse.replace(commandLine, '').trim();
        }
      }
    }

    if (hasCommand) {
      setMessages(prev => [...prev, { role: 'model', text: cleanResponse }]);
      setIsRedirecting(true);
      setTimeout(() => {
        if (cmdTo && cmdDate) {
          const queryParams = new URLSearchParams({
            type: cmdType,
            to: cmdTo.trim(),
            departure: cmdDate,
            from: 'Pune'
          }).toString();
          setIsRedirecting(false);
          setIsOpen(false);
          navigate(`/search?${queryParams}`);
        } else {
          const routes: Record<string, string> = {
            flight: '/flights', bus: '/buses', train: '/trains',
            hotel: '/hotels', cab: '/cabs', movie: '/movies',
            concert: '/concerts', activity: '/activities',
            visa: '/visa', insurance: '/insurance'
          };
          setIsRedirecting(false); setIsOpen(false);
          navigate(routes[cmdType] || '/');
        }
      }, 2500);
    } else {
      setMessages(prev => [...prev, { role: 'model', text: cleanResponse }]);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-10 right-10 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 100, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 100 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="bg-white dark:bg-slate-900 w-[380px] sm:w-[480px] h-[600px] max-h-[85vh] rounded-[3rem] shadow-[0_40px_120px_rgba(0,0,0,0.3)] flex flex-col border border-slate-100 dark:border-slate-800 overflow-hidden"
          >
            {/* Header */}
            <div className="gradient-bg p-6 flex justify-between items-center text-white relative">
              <div className="flex items-center space-x-4">
                <motion.div 
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="bg-white/20 w-10 h-10 rounded-[1rem] flex items-center justify-center text-lg backdrop-blur-sm border border-white/20"
                >
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                </motion.div>
                <div>
                  <h3 className="font-black text-lg tracking-tighter">SykBound AI</h3>
                  <div className="flex items-center gap-1.5 opacity-80">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                    <p className="text-[8px] font-black uppercase tracking-[0.2em]">Smart Navigator Active</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 w-8 h-8 rounded-full flex items-center justify-center transition-colors">
                <i className="fa-solid fa-times text-sm"></i>
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#fcfdfe]/50 dark:bg-slate-900/50">
              {messages.map((msg, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-6 rounded-[2rem] text-[15px] leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'gradient-bg text-white rounded-tr-none shadow-blue-200/50' 
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700'
                  }`}>
                    {msg.text.split('\n').map((line, i) => (
                      <p key={i} className={line.trim() ? "mb-2 last:mb-0" : ""}>{line}</p>
                    ))}
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] rounded-tl-none shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce delay-150"></span>
                      <span className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce delay-300"></span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">AI is thinking...</span>
                  </div>
                </motion.div>
              )}

              {isRedirecting && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center p-8 text-center animate-pulse"
                >
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-inner">
                    <i className="fa-solid fa-route animate-spin"></i>
                  </div>
                  <h4 className="font-black text-slate-900 dark:text-white">Calculating Best Routes</h4>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-1">Directing to Travel Details...</p>
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-8 border-t dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="flex space-x-3 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-[1.8rem] border border-slate-100 dark:border-slate-700 transition-all focus-within:ring-4 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/30 focus-within:border-blue-200 dark:focus-within:border-blue-700">
                <input 
                  type="text" 
                  placeholder="Next flight to London..."
                  className="flex-1 bg-transparent border-none px-5 py-3 text-sm font-bold outline-none text-slate-700 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={isLoading || isRedirecting}
                  className="gradient-bg text-white w-14 h-14 rounded-2xl flex items-center justify-center hover:scale-105 disabled:opacity-50 shadow-lg shadow-blue-200/50 transition-all active:scale-95"
                >
                  <i className="fa-solid fa-paper-plane"></i>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <motion.button 
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="gradient-bg text-white w-20 h-20 rounded-[2.2rem] shadow-[0_20px_60px_rgba(37,99,235,0.4)] flex items-center justify-center group relative border-4 border-white dark:border-slate-800"
        >
          <div className="absolute -top-1 -right-1 bg-blue-400 w-5 h-5 rounded-full border-[3px] border-white dark:border-slate-800 animate-pulse"></div>
          <i className="fa-solid fa-robot text-3xl group-hover:rotate-12 transition-transform"></i>
          <span className="absolute -left-36 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none border border-slate-100 dark:border-slate-700 translate-x-4 group-hover:translate-x-0">AI Navigator</span>
        </motion.button>
      )}
    </div>
  );
};

export default AIChatWidget;
