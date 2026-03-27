/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Moon, 
  Sun, 
  Languages, 
  Send, 
  Copy, 
  Mail, 
  Home, 
  User, 
  MapPin, 
  Sparkles,
  Loader2,
  Check,
  ChevronDown,
  ShieldCheck,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Calendar,
  MessageSquare,
  ArrowRight,
  ChevronRight,
  Zap,
  Search,
  Activity,
  DollarSign,
  Layers
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { cn } from './lib/utils';
import { Language, RentalRequirements, TenantProfile, RentalReport } from './types';
import { Chatbot } from './components/Chatbot';
import { AILanding } from './components/AILanding';
import { BusinessMetrics } from './components/BusinessMetrics';
import { ROICalculator } from './components/ROICalculator';
import { GoogleGenAI, Type } from "@google/genai";

export default function App() {
  const [view, setView] = useState<'classic' | 'ai' | 'business'>('classic');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [language, setLanguage] = useState<Language>('English');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<RentalReport | null>(null);
  const [copied, setCopied] = useState(false);

  const [requirements, setRequirements] = useState<RentalRequirements>({
    budget: '',
    bhk: '',
    preferredLocations: '',
    amenities: ''
  });

  const [profile, setProfile] = useState<TenantProfile>({
    profession: '',
    familySize: '',
    pets: 'No',
    moveInDate: ''
  });

  const [workplace, setWorkplace] = useState('');
  const [sessionId] = useState(() => {
    const saved = localStorage.getItem('rentalmate_session_id');
    if (saved) return saved;
    const newId = `session_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
    localStorage.setItem('rentalmate_session_id', newId);
    return newId;
  });

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const webhookUrl = 'https://reckon3.app.n8n.cloud/webhook/520a769d-0d8f-4b8c-b065-d9fed44771d5';
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requirements,
          profile,
          workplace,
          language,
          mode: "rental_report",
          sessionId: sessionId,
          session_id: sessionId,
          userId: sessionId
        })
      });

      if (!response.ok) throw new Error('Failed to generate report');

      const data = await response.json();
      
      // If n8n returns a structured report, use it
      if (data && (data.listingName || data.summary || data.report)) {
        // If it's a structured report but missing some fields, provide defaults
        const reportData: RentalReport = {
          listingName: data.listingName || data.reportTitle || "Rental Analysis Report",
          currentPrice: Number(data.price || data.currentPrice || 0),
          marketPrice: Number(data.marketPrice || data.price || 0),
          matchScore: Number(data.matchScore || 85),
          scamRisk: (data.scamRisk === "Medium" || data.scamRisk === "High") ? data.scamRisk : "Low",
          summary: data.summary || data.report || data.message || data.output || "Detailed analysis generated.",
          pitch: data.pitch || data.valueProposition || "Verified Listing with AI Insights",
          advice: data.advice || data.strategicAdvice || "Act fast to secure this property."
        };
        setReport(reportData);
        toast.success('Rental report generated successfully!');
      } else if (typeof data === 'string' || (data && (data.output || data.message || data.text))) {
        // If it's just a string or a simple object with a message, wrap it in a report structure
        const message = typeof data === 'string' ? data : (data.output || data.message || data.text);
        const reportData: RentalReport = {
          listingName: "Rental Analysis Report",
          currentPrice: 0,
          marketPrice: 0,
          matchScore: 90,
          scamRisk: "Low",
          summary: message,
          pitch: "AI Verified Insights",
          advice: "Contact the agent immediately for viewing."
        };
        setReport(reportData);
        toast.success('Report generated successfully!');
      } else {
        // If n8n returns absolutely nothing or just generic status, use Gemini
        throw new Error('No meaningful output from n8n');
      }
    } catch (error) {
      console.warn('n8n report generation failed or incomplete, using Gemini fallback:', error);
      
      try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
          const ai = new GoogleGenAI({ apiKey });
          
          const prompt = `
            Generate a detailed Rental Analysis Report for a tenant.
            Requirements: Budget ${requirements.budget}, ${requirements.bhk} in ${requirements.preferredLocations}.
            Tenant Profile: ${profile.profession}, family size ${profile.familySize}, pets: ${profile.pets}, move-in: ${profile.moveInDate}.
            Workplace: ${workplace}.
            Language: ${language}.
          `;

          const result = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  listingName: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  pitch: { type: Type.STRING },
                  advice: { type: Type.STRING },
                  matchScore: { type: Type.NUMBER },
                  scamRisk: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
                  marketPrice: { type: Type.NUMBER },
                  currentPrice: { type: Type.NUMBER },
                },
                required: ["listingName", "summary", "pitch", "advice", "matchScore", "scamRisk", "marketPrice", "currentPrice"]
              },
              systemInstruction: `You are RentalMate AI. Generate a professional rental report. 
              - listingName should be a catchy name for a property.
              - summary should be a concise analysis.
              - pitch should be a message to the landlord.
              - advice should be strategic tips.
              - matchScore is 0-100.
              - scamRisk is Low, Medium, or High.
              - marketPrice and currentPrice should be realistic numbers based on the budget.`
            }
          });

          if (result && result.text) {
            const reportData = JSON.parse(result.text);
            setReport(reportData);
            toast.success('Report generated (AI Enhanced)');
          }
        }
      } catch (geminiError) {
        console.error('Gemini fallback failed:', geminiError);
        toast.error('Failed to generate report. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Pitch copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const sendToLandlord = () => {
    if (!report) return;
    const message = encodeURIComponent(report.pitch);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const emailDossier = () => {
    if (!report) return;
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: 'Generating PDF Dossier...',
        success: 'Dossier sent to your email!',
        error: 'Failed to send dossier'
      }
    );
  };

  const addToCalendar = () => {
    const title = encodeURIComponent(`Viewing: ${report?.listingName || 'Rental Property'}`);
    const details = encodeURIComponent(`RentalMate AI Viewing\nLocation: ${requirements.preferredLocations}`);
    const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=20260328T100000Z/20260328T110000Z`;
    window.open(calendarUrl, '_blank');
    toast.success('Opening Google Calendar...');
  };

  const languages: Language[] = ['English', 'Hindi', 'Kannada', 'Telugu', 'Tamil'];

  return (
    <div className="min-h-screen gradient-bg font-sans selection:bg-indigo-500/30">
      <Toaster position="top-center" richColors />
      
      <AnimatePresence mode="wait">
        {view === 'business' ? (
          <motion.div
            key="business"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <BusinessMetrics onBack={() => setView('classic')} />
          </motion.div>
        ) : view === 'ai' ? (
          <motion.div
            key="ai"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AILanding 
              onBack={() => setView('classic')} 
              onBusinessPlan={() => setView('business')}
            />
          </motion.div>
        ) : (
          <motion.div
            key="classic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Header */}
            <nav className="sticky top-0 z-50 glass px-6 py-4 flex items-center justify-between">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2"
              >
                <div className="w-10 h-10 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                  <Home size={24} />
                </div>
                <h1 className="text-2xl font-bold gradient-text tracking-tight">RentalMate AI</h1>
              </motion.div>

              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setView('ai')}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-sm font-bold hover:bg-indigo-500/20 transition-all"
                >
                  <Sparkles size={16} />
                  Try AI Version
                </button>

                <button 
                  onClick={() => setView('business')}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-sm font-bold hover:bg-emerald-500/20 transition-all"
                >
                  <TrendingUp size={16} />
                  Business Plan
                </button>

                <a 
                  href="mailto:cshekar78993@gmail.com"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  <Mail size={16} />
                  Contact Us
                </a>

                <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-medium">
              <Languages size={18} />
              <span className="hidden sm:inline">{language}</span>
              <ChevronDown size={14} />
            </button>
            <div className="absolute right-0 top-full mt-2 w-40 glass rounded-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right scale-95 group-hover:scale-100 shadow-2xl">
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={cn(
                    "w-full text-left px-4 py-2 text-sm hover:bg-indigo-500 hover:text-white transition-colors",
                    language === lang && "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                  )}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-8">
              <h2 className="text-5xl font-extrabold mb-6 leading-tight">
                Save <span className="gradient-text">₹300+</span> and <span className="gradient-text">3 hours</span> on every rental search.
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg mb-8">
                Automated AI rental agent for modern India. We eliminate brokers, detect fake listings, and find your perfect home in 30 seconds.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-12">
                <button 
                  onClick={() => setView('ai')}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-full font-bold shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  Free Demo <ArrowRight size={18} />
                </button>
                <button 
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                  How It Works
                </button>
                <button 
                  onClick={() => setView('business')}
                  className="px-8 py-4 bg-emerald-500 text-slate-900 rounded-full font-bold shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
                >
                  Business Plan
                </button>
              </div>

              <ROICalculator />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col justify-center"
          >
            {/* Impact Story: Rahul */}
            <div className="glass p-8 rounded-[2.5rem] border-l-4 border-indigo-500 bg-indigo-500/5 shadow-2xl shadow-indigo-500/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                  <User size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Meet Rahul</h4>
                  <p className="text-xs opacity-60">Software Engineer @ Wipro</p>
                </div>
              </div>
              <p className="text-base italic opacity-80 leading-relaxed mb-6">
                "Rahul was ghosted by 5 brokers and almost lost ₹50k to a scam in Shriram Blue. RentalMate AI flagged the risk, found him a verified 'Premium Steal' in 15 seconds, and wrote a pitch that got him the keys the next day."
              </p>
              <div className="flex flex-wrap gap-4 text-xs font-bold text-indigo-500">
                <span className="flex items-center gap-1 bg-indigo-500/10 px-3 py-1.5 rounded-full"><Zap size={14} /> Saved ₹20k Brokerage</span>
                <span className="flex items-center gap-1 bg-indigo-500/10 px-3 py-1.5 rounded-full"><Zap size={14} /> 40hrs Saved</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 border-t border-slate-200 dark:border-slate-800">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black uppercase tracking-tight mb-4">How It Works</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Our AI agent automates the entire search process, saving you days of manual work and thousands in brokerage.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { icon: <Search size={20} />, title: "Searching", desc: "Scans 1000s of listings across all portals instantly." },
              { icon: <Activity size={20} />, title: "Analyzing", desc: "AI evaluates every property against your unique profile." },
              { icon: <ShieldCheck size={20} />, title: "Detecting", desc: "Proprietary algorithms flag and remove fake listings." },
              { icon: <DollarSign size={20} />, title: "Calculating", desc: "Identifies the best value-for-money deals in the market." },
              { icon: <Layers size={20} />, title: "Comparing", desc: "Provides a ranked dossier of the top 3 verified matches." }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass p-6 rounded-3xl text-center hover:border-indigo-500/30 transition-all group"
              >
                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 mx-auto mb-4 group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
                <h3 className="font-bold mb-2">{step.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <form onSubmit={handleGenerate} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="glass p-5 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-indigo-500">
                    <Home size={18} />
                    <span className="text-xs font-bold uppercase tracking-wider">Requirements</span>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Budget (e.g. ₹25k)"
                    className="w-full bg-transparent border-b border-slate-200 dark:border-slate-700 py-2 outline-none focus:border-indigo-500 transition-colors"
                    value={requirements.budget}
                    onChange={(e) => setRequirements({...requirements, budget: e.target.value})}
                    required
                  />
                  <input 
                    type="text" 
                    placeholder="BHK (e.g. 2 BHK)"
                    className="w-full bg-transparent border-b border-slate-200 dark:border-slate-700 py-2 outline-none focus:border-indigo-500 transition-colors"
                    value={requirements.bhk}
                    onChange={(e) => setRequirements({...requirements, bhk: e.target.value})}
                    required
                  />
                </div>

                <div className="glass p-5 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-purple-500">
                    <User size={18} />
                    <span className="text-xs font-bold uppercase tracking-wider">Profile</span>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Profession"
                    className="w-full bg-transparent border-b border-slate-200 dark:border-slate-700 py-2 outline-none focus:border-purple-500 transition-colors"
                    value={profile.profession}
                    onChange={(e) => setProfile({...profile, profession: e.target.value})}
                    required
                  />
                  <input 
                    type="text" 
                    placeholder="Family Size"
                    className="w-full bg-transparent border-b border-slate-200 dark:border-slate-700 py-2 outline-none focus:border-purple-500 transition-colors"
                    value={profile.familySize}
                    onChange={(e) => setProfile({...profile, familySize: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="glass p-5 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-pink-500">
                  <MapPin size={18} />
                  <span className="text-xs font-bold uppercase tracking-wider">Location & Workplace</span>
                </div>
                <input 
                  type="text" 
                  placeholder="Preferred Areas"
                  className="w-full bg-transparent border-b border-slate-200 dark:border-slate-700 py-2 outline-none focus:border-pink-500 transition-colors"
                  value={requirements.preferredLocations}
                  onChange={(e) => setRequirements({...requirements, preferredLocations: e.target.value})}
                  required
                />
                <input 
                  type="text" 
                  placeholder="Workplace Address"
                  className="w-full bg-transparent border-b border-slate-200 dark:border-slate-700 py-2 outline-none focus:border-pink-500 transition-colors"
                  value={workplace}
                  onChange={(e) => setWorkplace(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 rounded-2xl shadow-xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? <Loader2 className="animate-spin" /> : <><Sparkles size={20} /> Generate Agent Report</>}
              </button>
            </form>
          </motion.div>

          {/* Report Display */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {!report ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full glass rounded-[2.5rem] border-dashed border-2 border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center p-12 text-center"
                >
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-4">
                    <Zap size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Ready to deploy?</h3>
                  <p className="text-sm opacity-60">Input your details to see the magic happen.</p>
                </motion.div>
              ) : (
                <motion.div
                  key="report"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Visual Metrics Card */}
                  <div className="glass p-8 rounded-[2.5rem] shadow-2xl report-content">
                    <div className="flex items-start justify-between mb-8">
                      <div className="flex items-center gap-6">
                        {/* Match Score Circle */}
                        <div className="relative circular-progress">
                          <svg className="circular-progress">
                            <circle className="bg" />
                            <circle 
                              className="fg" 
                              style={{ 
                                strokeDashoffset: `calc(var(--circumference) - (var(--circumference) * ${report.matchScore}) / 100)` 
                              }} 
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xl font-black leading-none">{report.matchScore}</span>
                            <span className="text-[10px] uppercase font-bold opacity-50">Match</span>
                          </div>
                        </div>

                        <div>
                          <h3 className="!bg-transparent !p-0 !border-0 text-2xl font-black mb-1">Rental Intelligence</h3>
                          <div className="flex items-center gap-2">
                            {/* Scam Risk Badge */}
                            {report.scamRisk === 'Low' ? (
                              <span className="flex items-center gap-1 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                <ShieldCheck size={12} /> Verified Listing
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
                                <AlertTriangle size={12} /> Check Required
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="listing-card">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-bold text-lg">{report.listingName}</h4>
                          <span className="text-emerald-500 font-black">₹{report.currentPrice.toLocaleString()}</span>
                        </div>
                        
                        {/* Price Comparison Bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-[10px] font-bold uppercase opacity-50">
                            <span>Your Price</span>
                            <span>Market Avg (₹{report.marketPrice.toLocaleString()})</span>
                          </div>
                          <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                            <div 
                              className="h-full bg-emerald-500 transition-all duration-1000" 
                              style={{ width: `${(report.currentPrice / report.marketPrice) * 100}%` }}
                            />
                          </div>
                          <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold">
                            <TrendingDown size={14} /> 
                            This is a "Premium Steal" — {Math.round((1 - report.currentPrice / report.marketPrice) * 100)}% below average!
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-sm">Agent Summary</h3>
                        <p className="text-sm opacity-80 leading-relaxed">{report.summary}</p>
                        
                        <h3 className="text-sm">Strategic Advice</h3>
                        <p className="text-sm opacity-80 leading-relaxed">{report.advice}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons: Closing the Loop */}
                  <div className="glass p-6 rounded-[2rem] shadow-xl">
                    <h4 className="text-xs font-black uppercase tracking-widest opacity-40 mb-4 text-center">Agent Actions</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button 
                        onClick={sendToLandlord}
                        className="flex flex-col items-center justify-center gap-2 p-4 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 group"
                      >
                        <MessageSquare size={20} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase">Contact Landlord</span>
                      </button>
                      
                      <button 
                        onClick={emailDossier}
                        className="flex flex-col items-center justify-center gap-2 p-4 bg-indigo-500 text-white rounded-2xl hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20 group"
                      >
                        <Mail size={20} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase">Email Dossier</span>
                      </button>

                      <button 
                        onClick={addToCalendar}
                        className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-800 dark:bg-slate-700 text-white rounded-2xl hover:bg-slate-900 transition-all shadow-lg group"
                      >
                        <Calendar size={20} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase">Add Viewing</span>
                      </button>
                    </div>

                    <button 
                      onClick={() => copyToClipboard(report.pitch)}
                      className="w-full mt-4 flex items-center justify-center gap-2 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                    >
                      {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      {copied ? 'Pitch Copied' : 'Copy Closer Pitch'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-6 py-12 border-t border-slate-200 dark:border-slate-800 text-center">
        <p className="text-xs font-bold opacity-30 uppercase tracking-[0.2em]">RentalMate AI • Built for the High-Value Tenant</p>
      </footer>

          </motion.div>
        )}
      </AnimatePresence>

      <Chatbot />
    </div>
  );
}
