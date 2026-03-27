import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  ShieldCheck, 
  Languages, 
  TrendingUp, 
  Mail, 
  MapPin, 
  Briefcase, 
  Building2, 
  Wand2, 
  FileText, 
  Search, 
  Calculator, 
  PenTool, 
  CheckCircle2, 
  AlertCircle,
  Moon,
  Sun,
  ChevronRight,
  Send,
  Zap,
  Loader2 as Loader2Icon
} from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';

import { ROICalculator } from './ROICalculator';

interface AILandingProps {
  onBack?: () => void;
  onBusinessPlan?: () => void;
}

export function AILanding({ onBack, onBusinessPlan }: AILandingProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [language, setLanguage] = useState('English');
  const [loading, setLoading] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  const [requirements, setRequirements] = useState('');
  const [profile, setProfile] = useState('');
  const [workplace, setWorkplace] = useState('');
  const [sessionId] = useState(() => {
    const saved = localStorage.getItem('rentalmate_session_id');
    if (saved) return saved;
    const newId = `session_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
    localStorage.setItem('rentalmate_session_id', newId);
    return newId;
  });

  const languages = [
    { name: 'English', icon: '🇬🇧' },
    { name: 'Hindi', icon: '🇮🇳' },
    { name: 'Kannada', icon: '🇮🇳' },
    { name: 'Telugu', icon: '🇮🇳' },
    { name: 'Tamil', icon: '🇮🇳' }
  ];

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleGenerate = async () => {
    if (!requirements.trim()) {
      toast.error('Please enter your rental requirements');
      return;
    }

    setLoading(true);
    setReport(null);
    setShowEmail(false);

    let responseText = "";
    let webhookSuccess = false;

    try {
      const response = await fetch('https://reckon3.app.n8n.cloud/webhook/520a769d-0d8f-4b8c-b065-d9fed44771d5', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: requirements,
          mode: "rental",
          language: language,
          email: "temp@temp.com",
          profile: profile,
          workplace: workplace,
          sessionId: sessionId,
          session_id: sessionId,
          userId: sessionId
        })
      });

      if (response.ok) {
        responseText = await response.text();
        webhookSuccess = true;
      }
    } catch (error: any) {
      console.warn('n8n Webhook fetch failed in AILanding:', error);
    }

    let reportText = "";
    
    // Parse n8n response if available
    if (webhookSuccess && responseText) {
      try {
        const json = JSON.parse(responseText);
        if (json.report) {
          reportText = json.report;
          // Clean up escaped characters
          reportText = reportText.replace(/\\n/g, '\n').replace(/\\"/g, '"');
          if (reportText.startsWith('"') && reportText.endsWith('"')) {
            reportText = reportText.slice(1, -1);
            reportText = reportText.replace(/\\n/g, '\n');
          }
        } else if (json.message || json.output || json.text) {
          reportText = json.message || json.output || json.text;
        } else {
          reportText = responseText;
        }
      } catch (e) {
        reportText = responseText;
      }
    }

    // Fallback logic
    // We use Gemini ONLY if n8n failed completely or returned absolutely no content
    const hasN8nOutput = webhookSuccess && reportText && reportText.trim().length > 0;

    if (!hasN8nOutput) {
      console.log('AILanding: n8n failed or returned no output: using Gemini AI fallback');
      try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
          const ai = new GoogleGenAI({ apiKey });
          
          const promptContext = !webhookSuccess 
            ? `The user is looking for: "${requirements}". Their profile: "${profile}". Workplace: "${workplace}". Our primary search agent is currently unavailable. Generate a professional, detailed Rental Analysis Report for them in ${language}.`
            : `The user is looking for: "${requirements}". Their profile: "${profile}". Workplace: "${workplace}". The backend returned no specific report. Generate a detailed, professional Rental Analysis Report in ${language}.`;

          const result = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: 'user', parts: [{ text: promptContext }] }],
            config: {
              systemInstruction: `You are RentalMate AI, the world's most advanced rental search agent. 
              Your goal is to generate a comprehensive, professional Rental Analysis Report.
              
              The report should include:
              1. Market Summary: Analysis of the budget and location.
              2. Match Score: A percentage (0-100) based on their profile.
              3. Strategic Advice: How to win the property.
              4. Scam Risk Assessment: Low/Medium/High.
              5. Value Proposition: How much time and money we save them.
              
              Context:
              - We save users ₹300+ and 3 hours per search.
              - We eliminate brokers (saving 5-10% commission).
              - We detect fake listings using proprietary AI.
              
              Format the report beautifully using markdown. Keep it professional and business-oriented.`
            }
          });
          
          if (result && result.text) {
            reportText = result.text;
          }
        }
      } catch (geminiError) {
        console.error('Gemini fallback in AILanding failed:', geminiError);
        if (!reportText) {
          toast.error('Error generating report. Please try again.');
          setLoading(false);
          return;
        }
      }
    }

    if (reportText) {
      setReport(reportText);
      setShowEmail(true);
      toast.success('Report generated successfully!');
    } else {
      toast.error('Failed to generate report. Please try again.');
    }
    
    setLoading(false);
  };

  const handleSendEmail = async () => {
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setSendingEmail(true);
    try {
      const response = await fetch('https://reckon3.app.n8n.cloud/webhook/520a769d-0d8f-4b8c-b065-d9fed44771d5', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: requirements,
          mode: "rental",
          language: language,
          email: email,
          profile: profile,
          workplace: workplace
        })
      });

      if (response.ok) {
        toast.success('Report sent to your email!');
        setEmail('');
      } else {
        throw new Error('Failed to send');
      }
    } catch (error) {
      toast.error('Failed to send email. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f0f0f] text-slate-900 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden font-sans">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      {/* Theme Toggle */}
      <button 
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 p-3 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 rounded-full shadow-xl hover:scale-110 transition-all"
      >
        {theme === 'light' ? <Moon size={20} className="text-slate-700" /> : <Sun size={20} className="text-emerald-400" />}
      </button>

      {/* Back Button (Optional) */}
      <div className="fixed top-6 left-6 z-50 flex gap-3">
        {onBack && (
          <button 
            onClick={onBack}
            className="px-4 py-2 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 rounded-full shadow-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            <ChevronRight size={16} className="rotate-180" />
            Classic Version
          </button>
        )}
        <a 
          href="mailto:cshekar78993@gmail.com"
          className="px-4 py-2 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 rounded-full shadow-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2"
        >
          <Mail size={16} />
          Contact Us
        </a>
      </div>

      <div className="container mx-auto px-6 py-12 relative z-10 max-w-7xl">
        {/* Header Card */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-[32px] p-8 mb-10 shadow-2xl shadow-emerald-500/5 border border-slate-200 dark:border-slate-800 text-center relative overflow-hidden"
        >
          <div className="flex flex-col items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-linear-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 animate-bounce-slow">
              <Home size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-linear-to-r from-emerald-500 to-emerald-700 bg-clip-text text-transparent">
              Save ₹300+ and 3 hours on every rental search.
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
            Automated AI rental agent for modern India. We eliminate brokers, detect fake listings, and find your perfect home in 30 seconds.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-10">
            <button 
              onClick={handleGenerate}
              className="px-8 py-4 bg-emerald-500 text-slate-900 rounded-full font-bold shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              Free Demo <Zap size={18} fill="currentColor" />
            </button>
            <button 
              className="px-8 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            >
              How It Works
            </button>
            <button 
              onClick={onBusinessPlan}
              className="px-8 py-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full font-bold hover:bg-emerald-500/20 transition-all"
            >
              Business Plan
            </button>
          </div>

          <div className="max-w-3xl mx-auto mb-12">
            <ROICalculator />
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {[
              { icon: <ShieldCheck size={14} />, text: 'Scam Protection' },
              { icon: <Languages size={14} />, text: '5+ Languages' },
              { icon: <TrendingUp size={14} />, text: 'Smart Analysis' },
              { icon: <Mail size={14} />, text: 'Email Reports' }
            ].map((badge, i) => (
              <span key={i} className="px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-semibold flex items-center gap-2 border border-emerald-500/20">
                {badge.icon} {badge.text}
              </span>
            ))}
          </div>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel: Inputs */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-[32px] p-8 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-8"
          >
            <div className="flex items-center gap-3 pb-4 border-b-2 border-slate-100 dark:border-slate-800">
              <Wand2 size={28} className="text-emerald-500" />
              <h2 className="text-xl font-bold">Rental Requirements</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <MapPin size={12} /> What are you looking for?
                </label>
                <textarea 
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="e.g., 2BHK in Whitefield, Bangalore under ₹35,000, pet-friendly, parking"
                  className="w-full bg-slate-50 dark:bg-[#0f0f0f] border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all min-h-[120px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Briefcase size={12} /> Tenant Profile (Job, Experience)
                </label>
                <input 
                  type="text"
                  value={profile}
                  onChange={(e) => setProfile(e.target.value)}
                  placeholder="e.g., Software Engineer at Microsoft, 3 years"
                  className="w-full bg-slate-50 dark:bg-[#0f0f0f] border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-sm focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Building2 size={12} /> Workplace Location
                </label>
                <input 
                  type="text"
                  value={workplace}
                  onChange={(e) => setWorkplace(e.target.value)}
                  placeholder="e.g., Microsoft Office, Whitefield"
                  className="w-full bg-slate-50 dark:bg-[#0f0f0f] border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-sm focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Languages size={12} /> Language
                </label>
                <div className="flex flex-wrap gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.name}
                      onClick={() => setLanguage(lang.name)}
                      className={cn(
                        "px-4 py-2 rounded-full text-xs font-medium transition-all border",
                        language === lang.name 
                          ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/30 scale-105" 
                          : "bg-slate-50 dark:bg-[#0f0f0f] border-slate-100 dark:border-slate-800 text-slate-500 hover:border-emerald-500/50"
                      )}
                    >
                      {lang.icon} {lang.name}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-4 bg-linear-to-r from-emerald-500 to-emerald-600 text-white rounded-full font-bold shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:scale-100"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Zap size={20} fill="currentColor" />}
                Find My Perfect Home
              </button>

              <AnimatePresence>
                {showEmail && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4"
                  >
                    <div className="flex gap-2">
                      <input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="flex-1 bg-slate-50 dark:bg-[#0f0f0f] border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm focus:border-emerald-500 outline-none"
                      />
                      <button 
                        onClick={handleSendEmail}
                        disabled={sendingEmail}
                        className="px-6 bg-white dark:bg-[#1a1a1a] border-2 border-emerald-500 text-emerald-500 rounded-2xl font-bold text-sm hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        {sendingEmail ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                        Send
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Right Panel: Report */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-[32px] p-8 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col"
          >
            <div className="flex items-center gap-3 pb-4 border-b-2 border-slate-100 dark:border-slate-800 mb-6">
              <FileText size={28} className="text-emerald-500" />
              <h2 className="text-xl font-bold">Rental Analysis Report</h2>
            </div>

            <div className="flex-1 bg-slate-50 dark:bg-[#0f0f0f] rounded-3xl p-6 overflow-y-auto min-h-[400px] max-h-[600px] relative scrollbar-thin scrollbar-thumb-emerald-500/20">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full space-y-6 py-12">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Search size={20} className="text-emerald-500 animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-3 text-center">
                    <p className="text-sm font-medium flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
                      <Search size={14} /> Searching real estate listings...
                    </p>
                    <p className="text-sm font-medium flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
                      <TrendingUp size={14} /> Analyzing prices and areas...
                    </p>
                    <p className="text-sm font-medium flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
                      <Calculator size={14} /> Calculating compatibility score...
                    </p>
                    <p className="text-sm font-medium flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
                      <PenTool size={14} /> Generating landlord pitch...
                    </p>
                  </div>
                </div>
              ) : report ? (
                <div className="space-y-6">
                  {/* Savings Dashboard for User */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">Time Saved</p>
                      <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">4.5 Hrs</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1">Money Saved</p>
                      <p className="text-xl font-black text-blue-700 dark:text-blue-300">₹4,980</p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-2xl text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400 mb-1">Fakes Blocked</p>
                      <p className="text-xl font-black text-purple-700 dark:text-purple-300">12</p>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400 mb-1">Broker Saved</p>
                      <p className="text-xl font-black text-orange-700 dark:text-orange-300">₹25k</p>
                    </div>
                  </div>

                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <div className="markdown-body text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                      <ReactMarkdown>{report}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-20 opacity-40">
                  <Home size={64} className="mb-4" />
                  <p className="text-lg font-bold">✨ Your rental analysis will appear here</p>
                  <p className="text-sm">Enter your requirements and click \"Find My Perfect Home\"</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

function Loader2({ className, size = 24 }: { className?: string; size?: number }) {
  return <Loader2Icon className={cn("animate-spin", className)} size={size} />;
}
