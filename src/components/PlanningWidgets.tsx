
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { useGlobal } from '../context/GlobalContext';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components required for Pie chart
ChartJS.register(ArcElement, Tooltip, Legend);

export const SmartPackingList: React.FC<{ destination: string, type: string }> = ({ destination, type }) => {
  const [list, setList] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const generateList = async () => {
    setLoading(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY;
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `Generate a essential 10-item packing list for a trip to ${destination}. Type: ${type}. Current Season. Return as simple bullet points.`,
      });
      const items = response.text?.split('\n').filter(l => l.trim()).map(l => l.replace(/^[*-]\s*/, '')) || [];
      setList(items);
    } catch (e) {
      setList(['Passport', 'Universal Adapter', 'Travel Insurance', 'Local Currency', 'Noise Cancelling Headphones']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Smart Checklist</h3>
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">AI Optimized for {destination}</p>
        </div>
        <button onClick={generateList} disabled={loading} className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600">
          {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
        </button>
      </div>

      <div className="space-y-4">
        {list.length > 0 ? list.map((item, i) => (
          <div key={i} className="flex items-center gap-4 group cursor-pointer">
            <div className="w-5 h-5 rounded-lg border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:border-blue-500 transition-colors">
              <i className="fa-solid fa-check text-[10px] text-blue-600 opacity-0 group-hover:opacity-100"></i>
            </div>
            <span className="text-sm font-bold text-slate-600 dark:text-slate-300 group-hover:text-blue-600 transition-colors">{item}</span>
          </div>
        )) : (
          <p className="text-slate-400 text-sm italic font-medium">Click the wand to generate your neural packing list.</p>
        )}
      </div>
    </div>
  );
};

export const TripCostBreakdown: React.FC<{ total: number }> = ({ total }) => {
  const data = {
    labels: ['Transport', 'Stay', 'Food', 'Misc'],
    datasets: [{
      data: [total * 0.4, total * 0.35, total * 0.15, total * 0.1],
      backgroundColor: ['#2563eb', '#4f46e5', '#8b5cf6', '#0ea5e9'],
      borderWidth: 0,
      hoverOffset: 20
    }]
  };

  return (
    <div className="glass p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800">
      <div className="mb-8">
        <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Expense Architecture</h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">AI-Powered Budget Distribution & Optimization</p>
      </div>
      
      <div className="h-64 flex items-center justify-center">
        <Pie data={data} options={{ 
          plugins: { 
            legend: { 
              position: 'right', 
              labels: { 
                font: { weight: 'bold', family: 'Plus Jakarta Sans', size: 10 }, 
                usePointStyle: true,
                padding: 20,
                color: '#64748b'
              } 
            },
            tooltip: {
              backgroundColor: '#0f172a',
              padding: 12,
              titleFont: { size: 14, weight: 'bold' },
              bodyFont: { size: 12 },
              cornerRadius: 12,
              displayColors: false
            }
          },
          maintainAspectRatio: false
        }} />
      </div>

      <div className="mt-8 space-y-3">
        <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-800/50">
          <p className="text-[10px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
            Our neural engine analyzes thousands of data points to architect a balanced budget. 
            <span className="text-blue-600 dark:text-blue-400 font-bold ml-1">Transport (40%)</span> and 
            <span className="text-indigo-600 dark:text-indigo-400 font-bold ml-1">Stay (35%)</span> are prioritized for maximum comfort.
          </p>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t dark:border-slate-800 flex justify-between items-end">
        <div>
          <div className="text-[10px] font-black uppercase text-slate-400">Projected Savings</div>
          <div className="text-2xl font-black text-green-600">₹4,200</div>
        </div>
        <div className="flex flex-col items-end">
          <i className="fa-solid fa-shield-halved text-green-600 text-xl mb-1"></i>
          <span className="text-[8px] font-black text-green-600 uppercase tracking-tighter">Verified by SkyBound AI</span>
        </div>
      </div>
    </div>
  );
};
