import React from 'react';
import { Mic, BarChart4, Search, MessageCircle, GraduationCap } from 'lucide-react';
import { PersonaId } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface PersonaSelectorProps {
  selected: PersonaId;
  onSelect: (id: PersonaId) => void;
  disabled?: boolean;
}

export const PersonaSelector: React.FC<PersonaSelectorProps> = ({ selected, onSelect, disabled }) => {
  const { t } = useLanguage();

  const personas: { id: PersonaId; icon: React.ReactNode; labelKey: string; descKey: string; color: string }[] = [
    { 
      id: 'plain_spoken', 
      icon: <MessageCircle size={24} />, 
      labelKey: 'persona_plain_spoken', 
      descKey: 'persona_plain_spoken_desc',
      color: 'border-emerald-500 bg-emerald-50 text-emerald-700'
    },
    { 
      id: 'youtuber', 
      icon: <Mic size={24} />, 
      labelKey: 'persona_youtuber', 
      descKey: 'persona_youtuber_desc',
      color: 'border-orange-500 bg-orange-50 text-orange-700'
    },
    { 
      id: 'economist', 
      icon: <BarChart4 size={24} />, 
      labelKey: 'persona_economist', 
      descKey: 'persona_economist_desc',
      color: 'border-blue-500 bg-blue-50 text-blue-700'
    },
    { 
      id: 'observer', 
      icon: <Search size={24} />, 
      labelKey: 'persona_observer', 
      descKey: 'persona_observer_desc',
      color: 'border-purple-500 bg-purple-50 text-purple-700'
    },
    { 
      id: 'exam_prep', 
      icon: <GraduationCap size={24} />, 
      labelKey: 'persona_exam_prep', 
      descKey: 'persona_exam_prep_desc',
      color: 'border-teal-500 bg-teal-50 text-teal-700'
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto mb-8">
      <h3 className="text-center text-slate-500 text-sm font-semibold uppercase tracking-wider mb-4">
        {t('select_perspective')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {personas.map((p) => {
          const isSelected = selected === p.id;
          const isRecommended = p.id === 'plain_spoken';
          return (
            <div key={p.id} className="relative group">
              {isRecommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                   <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm whitespace-nowrap">
                     {t('recommended')}
                   </span>
                </div>
              )}
              <button
                onClick={() => onSelect(p.id)}
                disabled={disabled}
                className={`
                  w-full h-full relative p-4 rounded-xl border-2 text-left transition-all duration-200 flex flex-col
                  ${isSelected ? p.color + ' shadow-md scale-[1.02]' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50'}
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className={`mb-3 ${isSelected ? 'text-current' : 'text-slate-400'}`}>
                  {p.icon}
                </div>
                <div className="font-bold text-lg mb-1 leading-tight">{t(p.labelKey)}</div>
                <p className={`text-xs leading-relaxed ${isSelected ? 'text-current opacity-80' : 'text-slate-400'}`}>
                  {t(p.descKey)}
                </p>
                
                {isSelected && (
                  <div className="absolute top-3 right-3 h-3 w-3 rounded-full bg-current shadow-sm animate-pulse" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};