import React from 'react';
import { Article } from '../types';
import { ExternalLink, ScrollText } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ArticleListProps {
  articles: Article[];
}

export const ArticleList: React.FC<ArticleListProps> = ({ articles }) => {
  const { t } = useLanguage();

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full flex flex-col animate-fade-in-up">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <ScrollText size={20} className="text-indigo-600" />
          {t('article_list_title')}
        </h2>
        <p className="text-slate-500 text-sm">{t('article_list_subtitle')}</p>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-[300px] lg:max-h-[360px]">
        {articles.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 py-8">
            <p className="text-sm italic text-center">{t('no_data')}</p>
          </div>
        ) : (
          articles.map((article, idx) => (
            <a 
              key={idx} 
              href={article.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group block p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all"
            >
              <h4 className="font-medium text-slate-800 text-sm group-hover:text-indigo-600 group-hover:underline decoration-indigo-300 underline-offset-2 line-clamp-2">
                {article.title}
              </h4>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-slate-400 font-mono">{article.date}</span>
                <span className="text-xs text-indigo-400 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                  {t('read_source')} <ExternalLink size={10} />
                </span>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
};