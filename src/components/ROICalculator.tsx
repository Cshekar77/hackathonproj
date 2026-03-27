import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, TrendingDown, DollarSign, Clock, ArrowRight } from 'lucide-react';

export function ROICalculator() {
  const [hourlyRate, setHourlyRate] = useState(500);
  const [searchesPerMonth, setSearchesPerMonth] = useState(2);
  const [savings, setSavings] = useState({ monthly: 0, annual: 0, manualCost: 0, aiCost: 0 });

  useEffect(() => {
    const manualHours = searchesPerMonth * 5; // 5 hours per search
    const aiHours = (searchesPerMonth * 0.5) / 60; // 0.5 mins per search
    
    const manualCost = manualHours * hourlyRate;
    const aiCost = aiHours * hourlyRate;
    
    const monthlySavings = manualCost - aiCost;
    const annualSavings = monthlySavings * 12;
    
    setSavings({
      monthly: Math.round(monthlySavings),
      annual: Math.round(annualSavings),
      manualCost: Math.round(manualCost),
      aiCost: Math.round(aiCost)
    });
  }, [hourlyRate, searchesPerMonth]);

  return (
    <div className="glass p-8 rounded-[2.5rem] border border-emerald-500/20 shadow-2xl shadow-emerald-500/5">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
          <Calculator size={20} />
        </div>
        <h3 className="text-xl font-bold">ROI Calculator</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <DollarSign size={12} /> Your Hourly Rate (₹)
            </label>
            <input 
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-sm focus:border-emerald-500 outline-none transition-all font-bold"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Clock size={12} /> Searches Per Month
            </label>
            <input 
              type="number"
              value={searchesPerMonth}
              onChange={(e) => setSearchesPerMonth(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-sm focus:border-emerald-500 outline-none transition-all font-bold"
            />
          </div>
        </div>

        <div className="bg-emerald-500/5 rounded-3xl p-6 border border-emerald-500/10 flex flex-col justify-center">
          <div className="text-center space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Monthly Savings</p>
            <motion.p 
              key={savings.monthly}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-4xl font-black text-emerald-600 dark:text-emerald-400"
            >
              ₹{savings.monthly.toLocaleString()}
            </motion.p>
            <p className="text-xs text-slate-500">Annual: ₹{savings.annual.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Manual Cost</p>
          <p className="text-lg font-bold text-red-500">₹{savings.manualCost.toLocaleString()}</p>
          <p className="text-[10px] opacity-50">5 hours per search</p>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">RentalMate Cost</p>
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">₹{savings.aiCost.toLocaleString()}</p>
          <p className="text-[10px] opacity-50">30 seconds per search</p>
        </div>
      </div>
    </div>
  );
}
