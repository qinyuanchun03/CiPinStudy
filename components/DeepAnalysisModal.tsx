
import React, { useState } from 'react';
import { X, FileSearch, Quote, Scale, Lightbulb, Siren, Archive, Check, UserCircle2 } from 'lucide-react';
import { DeepReport, Article, PersonaId } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';

interface DeepAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  data: DeepReport | null;
  article?: Article;
  currentPersona?: PersonaId;
}

export const DeepAnalysisModal: React.FC<DeepAnalysisModalProps> = ({ 
    isOpen, 
    onClose, 
    loading, 
    data, 
    article,
    currentPersona 
}) => {
  const { t } = useLanguage();
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    if (data && article && currentPersona) {
        api.saveToDossier({
            id: crypto.randomUUID(),
            article: article,
            report: data,
            timestamp: Date.now(),
            persona: currentPersona
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-1.5 bg-indigo-600 text-white rounded shrink-0">
                <FileSearch size={18} />
            </div>
            <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t('deep_report_title')}</h2>
                  {currentPersona && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full border border-indigo-200 shrink-0">
                      <UserCircle2 size={10} />
                      {t(`persona_${currentPersona}`)}
                    </span>
                  )}
                </div>
                {article && <p className="text-xs text-slate-500 truncate font-medium">{article.title}</p>}
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors shrink-0 ml-2">
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-4">
               <div className="relative">
                 <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <FileSearch size={16} className="text-indigo-600" />
                 </div>
               </div>
               <p className="text-slate-500 text-sm animate-pulse">{t('analyzing_content')}</p>
            </div>
          ) : data ? (
            <div className="space-y-6 animate-fade-in-up">
                
                {/* 1. Surface vs Deep */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col">
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
                            <Quote size={12} /> {t('surface_meaning')}
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed flex-1">{data.surface_meaning}</p>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 shadow-sm flex flex-col">
                        <h3 className="text-xs font-bold text-indigo-500 uppercase mb-2 flex items-center gap-1">
                            <Lightbulb size={12} /> {t('deep_logic')}
                        </h3>
                        <p className="text-sm text-indigo-900 leading-relaxed font-semibold flex-1 italic">
                          {data.deep_logic}
                        </p>
                    </div>
                </div>

                {/* 2. Impact */}
                <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 mb-2">{t('impact_assessment')}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{data.impact_assessment}</p>
                </div>

                {/* 3. Tone Check */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-start gap-3">
                    <Scale className="text-slate-400 shrink-0 mt-0.5" size={18} />
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 mb-1">{t('bias_check')}</h3>
                        <p className="text-xs text-slate-500">{data.bias_check}</p>
                    </div>
                </div>

                {/* 4. Key Segments */}
                {data.key_segments && data.key_segments.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="text-xs font-bold text-slate-400 uppercase">{t('key_quotes')}</h3>
                        {data.key_segments.map((quote, idx) => (
                            <div key={idx} className="flex gap-2 text-xs text-slate-600 italic bg-white p-2 rounded border border-slate-100">
                                <Siren size={14} className="text-rose-400 shrink-0" />
                                <span>"{quote}"</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <p className="text-sm italic">Failed to generate report. Please try another persona or check configuration.</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white flex justify-between items-center">
             
             {/* Save Button */}
             {data && (
                 <button
                   onClick={handleSave}
                   disabled={saved}
                   className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${saved ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                 >
                    {saved ? <Check size={16} /> : <Archive size={16} />}
                    {saved ? t('saved') : t('save_to_dossier')}
                 </button>
             )}

             <button 
               onClick={onClose}
               className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-sm font-medium transition-colors"
             >
               {t('close')}
             </button>
        </div>
      </div>
    </div>
  );
};
