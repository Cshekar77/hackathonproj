import React from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  PieChart, 
  ShieldCheck, 
  Globe, 
  Zap, 
  ArrowLeft,
  Target,
  BarChart3,
  Rocket,
  Mail,
  Activity,
  CreditCard,
  Briefcase,
  Layers
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface BusinessMetricsProps {
  onBack: () => void;
}

const revenueData = [
  { month: 'Jan', revenue: 450000, users: 8000 },
  { month: 'Feb', revenue: 520000, users: 12000 },
  { month: 'Mar', revenue: 680000, users: 18000 },
  { month: 'Apr', revenue: 850000, users: 25000 },
  { month: 'May', revenue: 1200000, users: 38000 },
  { month: 'Jun', revenue: 1800000, users: 55000 },
];

export function BusinessMetrics({ onBack }: BusinessMetricsProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Back to App
            </button>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white">
              RENTALMATE <span className="text-emerald-500">INVESTOR HUB</span>
            </h1>
            <p className="text-slate-400 text-lg mt-2 font-medium">Scaling the $15B+ Indian Rental Market with AI</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-end gap-4"
          >
            <div className="bg-emerald-500 text-slate-950 px-8 py-4 rounded-3xl font-black text-2xl shadow-2xl shadow-emerald-500/20 flex items-center gap-3">
              <Rocket size={28} />
              $50M+ OPPORTUNITY
            </div>
            <a 
              href="mailto:cshekar78993@gmail.com"
              className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold transition-all flex items-center gap-2 text-slate-300"
            >
              <Mail size={14} /> Contact Founder
            </a>
          </motion.div>
        </div>

        {/* Live Performance Dashboard Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
              <Activity size={20} />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight">Live Performance Dashboard</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Card */}
            <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold text-white">Revenue Growth (Projected)</h3>
                  <p className="text-xs text-slate-500">Monthly recurring revenue in INR</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-emerald-500">₹1.8M</p>
                  <p className="text-[10px] text-emerald-500/50 font-bold uppercase tracking-widest">+45% MOM</p>
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="month" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                      itemStyle={{ color: '#10b981' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Stats Sidebar */}
            <div className="space-y-6">
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem]">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Active Users</p>
                    <p className="text-2xl font-black text-white">55,000+</p>
                  </div>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full w-[55%]" />
                </div>
                <p className="text-[10px] text-slate-500 mt-2 font-bold">Target: 100k by Year 1</p>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem]">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Conversion Rate</p>
                    <p className="text-2xl font-black text-white">8.4%</p>
                  </div>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full w-[42%]" />
                </div>
                <p className="text-[10px] text-slate-500 mt-2 font-bold">Industry Avg: 2.1%</p>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-[2rem]">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-500">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Profit Margin</p>
                    <p className="text-2xl font-black text-white">68%</p>
                  </div>
                </div>
                <p className="text-xs text-emerald-500/70 font-medium leading-tight">High scalability with low overhead AI infrastructure.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Core Business Slides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Slide 1: The Problem */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] hover:border-red-500/30 transition-all group"
          >
            <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mb-6 group-hover:scale-110 transition-transform">
              <Target size={24} />
            </div>
            <h3 className="text-xl font-bold mb-4 text-white">The Problem</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">├─</span> 50M+ rentals searched yearly in India
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">├─</span> Manual process = 5-10 days wasted
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">├─</span> Fake listings cost $500+ per person
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">├─</span> Brokers charge 5-10% commission
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">└─</span> Market size: $15B+ annually
              </li>
            </ul>
          </motion.div>

          {/* Slide 2: The Solution */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] hover:border-emerald-500/30 transition-all group"
          >
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-bold mb-4 text-white">The Solution</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">├─</span> RentalMate AI Agent
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">├─</span> Automates entire rental search
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">├─</span> Removes fake listings (saves money)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">├─</span> No broker needed (saves 5-10%)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">└─</span> Results in seconds (not days)
              </li>
            </ul>
          </motion.div>

          {/* Slide 3: Revenue Model */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] hover:border-emerald-500/30 transition-all group"
          >
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform">
              <DollarSign size={24} />
            </div>
            <h3 className="text-xl font-bold mb-4 text-white">Revenue Model</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">├─</span> Subscription: $49/month (users)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">├─</span> Commission: 1-2% from landlords
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">├─</span> B2B: Portal operators pay $500+/mo
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">└─</span> Enterprise: Corporate relocation
              </li>
            </ul>
          </motion.div>

          {/* Financial Projections */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] hover:border-emerald-500/30 transition-all group lg:col-span-2"
          >
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform">
              <BarChart3 size={24} />
            </div>
            <h3 className="text-xl font-bold mb-4 text-white">Financial Projections (Target Market)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">├─</span> Year 1: 100K users = $58.8M revenue
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">├─</span> Year 2: 500K users = $294M revenue
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">└─</span> Year 3: 2M users = $1.1B revenue
                </li>
              </ul>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">├─</span> CAC (Acquisition Cost): ₹50
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">├─</span> LTV (Lifetime Value): ₹5000+
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">└─</span> Payback period: 6 months
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Competitive Advantage */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-emerald-500 text-slate-950 p-8 rounded-[2.5rem] shadow-2xl shadow-emerald-500/20"
          >
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-slate-950 mb-6">
              <Layers size={24} />
            </div>
            <h3 className="text-xl font-bold mb-4">Competitive Advantage</h3>
            <ul className="space-y-3 text-sm font-black">
              <li className="flex items-start gap-2">
                <span className="font-bold">✓</span> Only AI agent doing this
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">✓</span> Proprietary fake detection
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">✓</span> Network effect scaling
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">✓</span> Multi-revenue streams
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">✓</span> Scalable to entire Asia
              </li>
            </ul>
          </motion.div>
        </div>

        {/* The Ask */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-500 to-blue-500" />
          <h2 className="text-3xl font-black mb-6 text-white uppercase tracking-tight">The Investment Ask</h2>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <span className="bg-slate-800 border border-slate-700 px-6 py-2 rounded-full text-sm font-bold text-slate-300">₹50L Seed Funding</span>
            <span className="bg-slate-800 border border-slate-700 px-6 py-2 rounded-full text-sm font-bold text-slate-300">Acquire first 10K users</span>
            <span className="bg-slate-800 border border-slate-700 px-6 py-2 rounded-full text-sm font-bold text-slate-300">Build payment infrastructure</span>
            <span className="bg-slate-800 border border-slate-700 px-6 py-2 rounded-full text-sm font-bold text-slate-300">Hire 3-4 Core Engineers</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onBack}
              className="w-full sm:w-auto bg-emerald-500 text-slate-950 px-12 py-4 rounded-full font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/20"
            >
              INVEST IN RENTALMATE
            </button>
            <a 
              href="mailto:cshekar78993@gmail.com"
              className="w-full sm:w-auto bg-slate-800 text-white px-12 py-4 rounded-full font-black text-xl hover:bg-slate-700 transition-all border border-slate-700"
            >
              REQUEST PITCH DECK
            </a>
          </div>
        </motion.div>

        {/* Growth Potential Footer */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8 text-center border-t border-slate-800 pt-12">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">India Market</p>
            <p className="text-xl font-bold text-white">$15B</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">SE Asia Market</p>
            <p className="text-xl font-bold text-white">$30B</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Payback Period</p>
            <p className="text-xl font-bold text-white">6 Months</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Valuation Potential</p>
            <p className="text-xl font-bold text-emerald-500">$1B+ (Unicorn)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
