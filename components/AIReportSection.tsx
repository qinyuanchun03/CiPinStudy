import React from 'react';
import { AIReport, PersonaId } from '../types';
import { Brain, TrendingUp, MessageSquare, Target, Lightbulb, ShieldAlert, LineChart, BookOpen, MessageCircle, GraduationCap } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface AIReportSectionProps {
  report: AIReport;
  persona: PersonaId;
}

export const AIReportSection: React.FC<AIReportSectionProps> = ({ report, persona }) => {
  const { t } = useLanguage();

  // Determine styles based on persona
  const getAdviceStyle = () => {
    switch (persona) {
      case 'plain_spoken':
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          iconColor: 'text-emerald-600',
          textColor: 'text-emerald-900',
          icon: <MessageCircle size={24} />,
          badge: 'bg-emerald-100 text-emerald-700'
        };
      case 'youtuber':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          iconColor: 'text-orange-600',
          textColor: 'text-orange-900',
          icon: <ShieldAlert size={24} />,
          badge: 'bg-orange-100 text-orange-700'
        };
      case 'economist':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          iconColor: 'text-blue-600',
          textColor: 'text-blue-900',
          icon: <LineChart size={24} />,
          badge: 'bg-blue-100 text-blue-700'
        };
      case 'observer':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          iconColor: 'text-purple-600',
          textColor: 'text-purple-900',
          icon: <BookOpen size={24} />,
          badge: 'bg-purple-100 text-purple-700'
        };
      case 'exam_prep':
        return {
          bg: 'bg-teal-50',
          border: 'border-teal-200',
          iconColor: 'text-teal-600',
          textColor: 'text-teal-900',
          icon: <GraduationCap size={24} />,
          badge: 'bg-teal-100 text-teal-700'
        };
      default:
        return {
            bg: 'bg-slate-50',
            border: 'border-slate-200',
            iconColor: 'text-slate-600',
            textColor: 'text-slate-900',
            icon: <Lightbulb size={24} />,
            badge: 'bg-slate-200 text-slate-700'
        };
    }
  };

  const style = getAdviceStyle();

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
          <Brain size={24} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">{t('ai_title')}</h2>
      </div>

      {/* Strategic Advice (New Feature) */}
      <div className={`p-6 rounded-xl border shadow-sm relative overflow-hidden ${style.bg} ${style.border}`}>
        <div className="flex items-start gap-4 z-10 relative">
          <div className={`p-3 rounded-lg bg-white/60 shadow-sm ${style.iconColor}`}>
            {style.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
               <h3 className={`text-sm font-bold uppercase tracking-wider ${style.iconColor}`}>{t('ai_advice')}</h3>
               <span className={`px-3 py-1 rounded-full text-xs font-bold ${style.badge}`}>
                 {t('ai_risk_level')}: {report.strategic_advice.risk_level}
               </span>
            </div>
            <h4 className={`text-xl font-bold mb-3 ${style.textColor}`}>{report.strategic_advice.title}</h4>
            <p className={`${style.textColor} opacity-90 leading-relaxed`}>{report.strategic_advice.content}</p>
          </div>
        </div>
      </div>

      {/* Period Summary */}
      <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-xl border border-indigo-100 shadow-sm">
        <h3 className="text-sm font-semibold text-indigo-900 uppercase tracking-wider mb-2">{t('ai_summary')}</h3>
        <p className="text-slate-700 text-lg leading-relaxed font-serif">{report.period_summary}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Policy Signal */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
           <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-blue-500" size={20} />
            <h3 className="font-bold text-slate-800">{t('ai_policy')}</h3>
           </div>
           <p className="text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100">
             {report.policy_signal}
           </p>
        </div>

        {/* Core Topics */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
           <div className="flex items-center gap-2 mb-4">
            <Target className="text-rose-500" size={20} />
            <h3 className="font-bold text-slate-800">{t('ai_topics')}</h3>
           </div>
           <div className="space-y-3">
             {report.core_topics.map((topic, idx) => (
               <div key={idx} className="pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                 <h4 className="font-semibold text-slate-800 text-sm">{topic.topic_name}</h4>
                 <p className="text-xs text-slate-500 mt-1">{topic.summary}</p>
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Keyword Sentiment Bubbles */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="text-indigo-500" size={20} />
          <h3 className="font-bold text-slate-800">{t('ai_keywords')}</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          {report.top_keywords.map((kw, idx) => {
            let colorClass = "bg-slate-100 text-slate-700 border-slate-200";
            if (kw.sentiment === 'positive') colorClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
            if (kw.sentiment === 'negative') colorClass = "bg-rose-50 text-rose-700 border-rose-200";
            
            // Size based on weight (normalized roughly)
            const fontSize = Math.max(0.8, Math.min(1.2, kw.weight / 60)) + 'rem';
            
            return (
              <div 
                key={idx}
                className={`px-4 py-2 rounded-full border ${colorClass} flex items-center gap-2 transition-transform hover:scale-105 cursor-default`}
                style={{ fontSize }}
              >
                <span className="font-medium">{kw.word}</span>
                <span className="opacity-60 text-xs font-mono">{kw.weight}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};