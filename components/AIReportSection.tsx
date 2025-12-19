
import React from 'react';
import { AIReport, PersonaId } from '../types';
import { Brain, TrendingUp, Search, TriangleAlert, ShieldAlert, Zap, MessageCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface AIReportSectionProps {
  report: AIReport;
  persona: PersonaId;
}

export const AIReportSection: React.FC<AIReportSectionProps> = ({ report, persona }) => {
  const { t } = useLanguage();

  // Color mappings based on Persona for the "Action" card mainly
  const getActionTheme = () => {
    switch (persona) {
      case 'youtuber': return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-900', icon: 'text-orange-600', badge: 'bg-orange-100 text-orange-800' };
      case 'economist': return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', icon: 'text-blue-600', badge: 'bg-blue-100 text-blue-800' };
      case 'observer': return { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-900', icon: 'text-purple-600', badge: 'bg-purple-100 text-purple-800' };
      case 'exam_prep': return { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-900', icon: 'text-teal-600', badge: 'bg-teal-100 text-teal-800' };
      default: return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-900', icon: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-800' };
    }
  };

  const actionTheme = getActionTheme();

  return (
    <div className="space-y-8 animate-fade-in-up pb-12">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-md">
          <Brain size={24} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">{t('ai_title')}</h2>
      </div>

      <div className="grid grid-cols-1 gap-6">

        {/* 1. General Analysis (总体分析) */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex items-center gap-2">
            <div className="w-2 h-6 bg-indigo-500 rounded-full"></div>
            <h3 className="font-bold text-slate-700">{t('ai_section_general')}</h3>
          </div>
          <div className="p-6">
            <div className="mb-6">
               <p className="text-lg leading-relaxed text-slate-700 font-medium">
                 {report.general_analysis?.summary || report.period_summary /* Fallback for old data */}
               </p>
            </div>
            {/* Keywords Visualization */}
            <div className="flex flex-wrap gap-2">
              {(report.general_analysis?.keywords || report.top_keywords || []).map((kw, idx) => {
                 let colorClass = "bg-slate-100 text-slate-600";
                 if (kw.sentiment === 'positive') colorClass = "bg-emerald-50 text-emerald-700 border border-emerald-100";
                 if (kw.sentiment === 'negative') colorClass = "bg-rose-50 text-rose-700 border border-rose-100";
                 
                 // Dynamic sizing
                 const fontSize = Math.max(0.85, Math.min(1.1, kw.weight / 60)) + 'rem';
                 
                 return (
                   <span key={idx} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${colorClass}`} style={{fontSize}}>
                     {kw.word}
                   </span>
                 )
              })}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 2. Situation Assessment (形势研判) */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex items-center gap-2">
              <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
              <h3 className="font-bold text-slate-700">{t('ai_section_situation')}</h3>
            </div>
            <div className="p-6 flex-1">
              <div className="flex items-start gap-4">
                <TrendingUp className="text-blue-500 shrink-0 mt-1" size={24} />
                <p className="text-slate-600 leading-relaxed">
                  {report.situation_assessment || report.period_summary}
                </p>
              </div>
            </div>
          </section>

          {/* 3. Real Intent (真实意图) */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex items-center gap-2">
              <div className="w-2 h-6 bg-purple-500 rounded-full"></div>
              <h3 className="font-bold text-slate-700">{t('ai_section_intent')}</h3>
            </div>
            <div className="p-6 flex-1">
               <div className="flex items-start gap-4">
                <Search className="text-purple-500 shrink-0 mt-1" size={24} />
                <div className="relative">
                  <span className="absolute -top-2 -left-2 text-4xl text-purple-200 font-serif leading-none">"</span>
                  <p className="text-slate-700 italic font-medium leading-relaxed relative z-10 px-2">
                    {report.real_intent || report.policy_signal}
                  </p>
                  <span className="absolute -bottom-4 right-0 text-4xl text-purple-200 font-serif leading-none">"</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* 4. Avoidance Zone (避雷专区) */}
        <section className="rounded-xl shadow-sm border border-rose-200 bg-rose-50 overflow-hidden">
           <div className="px-6 py-3 border-b border-rose-100 bg-rose-100/50 flex items-center gap-2">
             <TriangleAlert className="text-rose-600" size={20} />
             <h3 className="font-bold text-rose-800">{t('ai_section_avoid')}</h3>
           </div>
           <div className="p-6">
             {report.avoidance_zone ? (
               <div>
                 <h4 className="font-bold text-rose-900 mb-3">{report.avoidance_zone.title}</h4>
                 <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                   {report.avoidance_zone.items.map((item, idx) => (
                     <li key={idx} className="flex items-start gap-2 text-rose-800 bg-white/60 p-3 rounded-lg">
                       <ShieldAlert size={18} className="shrink-0 mt-0.5 text-rose-500" />
                       <span>{item}</span>
                     </li>
                   ))}
                 </ul>
               </div>
             ) : (
                // Fallback for old data structure using Core Topics
                <div className="space-y-2">
                   {report.core_topics?.slice(0, 3).map((topic, i) => (
                     <div key={i} className="flex gap-2 text-rose-800">
                       <ShieldAlert size={18} className="shrink-0 mt-1" />
                       <div>
                         <span className="font-bold mr-2">{topic.topic_name}:</span>
                         <span>{topic.summary}</span>
                       </div>
                     </div>
                   ))}
                </div>
             )}
           </div>
        </section>

        {/* 5. Action Suggestions (行动建议) */}
        <section className={`rounded-xl shadow-md border-2 ${actionTheme.border} ${actionTheme.bg} overflow-hidden relative`}>
           <div className="absolute top-0 right-0 p-4 opacity-10">
             <Zap size={100} />
           </div>
           
           <div className="px-6 py-4 flex items-center justify-between border-b border-black/5 relative z-10">
              <div className="flex items-center gap-2">
                <div className={`p-2 bg-white rounded-lg shadow-sm ${actionTheme.icon}`}>
                  <MessageCircle size={20} />
                </div>
                <h3 className={`font-bold ${actionTheme.text}`}>{t('ai_section_action')}</h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${actionTheme.badge}`}>
                 {t('ai_risk_level')}: {report.action_suggestions?.risk_level || report.strategic_advice?.risk_level}
              </span>
           </div>

           <div className="p-6 relative z-10">
             <h4 className={`text-xl font-bold mb-3 ${actionTheme.text}`}>
               {report.action_suggestions?.title || report.strategic_advice?.title}
             </h4>
             <p className={`${actionTheme.text} text-lg opacity-90 leading-relaxed font-medium`}>
               {report.action_suggestions?.content || report.strategic_advice?.content}
             </p>
           </div>
        </section>

      </div>
    </div>
  );
};
