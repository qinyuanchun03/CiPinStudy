import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts';
import { BasicData } from '../types';
import { FileText, Clock, BarChart3 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface StatsSectionProps {
  data: BasicData;
}

export const StatsSection: React.FC<StatsSectionProps> = ({ data }) => {
  const { t } = useLanguage();
  // Sort data just in case, take top 10 for chart
  const chartData = [...data.top_keywords].sort((a, b) => b.count - a.count).slice(0, 15);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">{t('stats_articles')}</p>
            <h3 className="text-2xl font-bold text-slate-800">{data.total_articles}</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">{t('stats_updated')}</p>
            <h3 className="text-2xl font-bold text-slate-800">{data.last_updated}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <BarChart3 size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">{t('stats_keyword')}</p>
            <h3 className="text-2xl font-bold text-slate-800">
              {data.top_keywords[0]?.word || "N/A"}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-800">{t('chart_title')}</h2>
          <p className="text-slate-500 text-sm">{t('chart_subtitle')}</p>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="word" 
                tick={{ fill: '#64748b', fontSize: 12 }} 
                axisLine={false} 
                tickLine={false}
              />
              <YAxis 
                tick={{ fill: '#64748b', fontSize: 12 }} 
                axisLine={false} 
                tickLine={false}
              />
              <Tooltip 
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index < 3 ? '#4f46e5' : '#818cf8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};