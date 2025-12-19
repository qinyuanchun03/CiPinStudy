
import React, { useState } from 'react';
import { Article } from '../types';
import { ExternalLink, ScrollText, Microscope, CheckSquare, Square, Layers, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ArticleListProps {
  articles: Article[];
  onAnalyzeDeep?: (article: Article) => void;
  onBatchAnalyze?: (articles: Article[]) => void;
  analyzingUrl?: string | null;
  isBatchAnalyzing?: boolean;
}

export const ArticleList: React.FC<ArticleListProps> = ({ 
  articles, 
  onAnalyzeDeep, 
  onBatchAnalyze, 
  analyzingUrl,
  isBatchAnalyzing 
}) => {
  const { t } = useLanguage();
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());

  const toggleSelection = (url: string) => {
    const newSet = new Set(selectedUrls);
    if (newSet.has(url)) {
      newSet.delete(url);
    } else {
      if (newSet.size >= 5) {
        alert("Batch analysis is limited to 5 articles at a time.");
        return;
      }
      newSet.add(url);
    }
    setSelectedUrls(newSet);
  };

  const handleBatchClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onBatchAnalyze && selectedUrls.size > 0) {
      const selectedArticles = articles.filter(a => selectedUrls.has(a.url));
      onBatchAnalyze(selectedArticles);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full flex flex-col animate-fade-in-up">
      <div className="mb-4 flex items-center justify-between">
        <div>
           <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <ScrollText size={20} className="text-indigo-600" />
            {t('article_list_title')}
          </h2>
          <p className="text-slate-500 text-sm">{t('article_list_subtitle')}</p>
        </div>
        
        {onBatchAnalyze && (
          <button 
             onClick={() => {
               setIsBatchMode(!isBatchMode);
               setSelectedUrls(new Set());
             }}
             className={`p-2 rounded-lg transition-colors ${isBatchMode ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400 hover:text-indigo-600'}`}
             title={t('batch_mode')}
          >
            <Layers size={20} />
          </button>
        )}
      </div>

      {isBatchMode && selectedUrls.size > 0 && (
         <div className="mb-3">
           <button
             onClick={handleBatchClick}
             disabled={isBatchAnalyzing}
             className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
           >
             {isBatchAnalyzing ? (
                <><Loader2 size={16} className="animate-spin" /> Analyzing...</>
             ) : (
                <>
                  <Microscope size={16} />
                  {t('batch_analyze_btn').replace('{count}', selectedUrls.size.toString())}
                </>
             )}
           </button>
         </div>
      )}

      <div className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-[300px] lg:max-h-[360px]">
        {articles.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 py-8">
            <p className="text-sm italic text-center">{t('no_data')}</p>
          </div>
        ) : (
          articles.map((article, idx) => {
            const isAnalyzing = analyzingUrl === article.url;
            const isSelected = selectedUrls.has(article.url);

            return (
            <div 
              key={idx} 
              className={`
                group relative p-3 rounded-lg border transition-all cursor-pointer
                ${isSelected ? 'bg-indigo-50 border-indigo-300' : 'border-slate-100 hover:bg-slate-50 hover:border-slate-200'}
              `}
              onClick={() => {
                if (isBatchMode) toggleSelection(article.url);
              }}
            >
              <div className="flex items-start gap-3">
                {isBatchMode && (
                   <div className={`mt-0.5 shrink-0 ${isSelected ? 'text-indigo-600' : 'text-slate-300'}`}>
                      {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                   </div>
                )}
                
                <div className="flex-1 min-w-0">
                    <a 
                      href={article.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block mb-1"
                      onClick={(e) => {
                        if (isBatchMode) {
                          e.preventDefault();
                          toggleSelection(article.url);
                        }
                      }}
                    >
                      <h4 className={`font-medium text-sm line-clamp-2 transition-colors ${isSelected ? 'text-indigo-900' : 'text-slate-800 group-hover:text-indigo-600'}`}>
                        {article.title}
                      </h4>
                    </a>
                    
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-slate-400 font-mono uppercase tracking-tight">{article.date}</span>
                      
                      {!isBatchMode && (
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {onAnalyzeDeep && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                onAnalyzeDeep(article);
                              }}
                              disabled={!!analyzingUrl}
                              className={`
                                text-[10px] font-bold flex items-center gap-1 px-2 py-1 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors
                                ${isAnalyzing ? 'opacity-100 bg-indigo-100 ring-2 ring-indigo-200' : ''}
                              `}
                            >
                              <Microscope size={10} className={isAnalyzing ? "animate-pulse" : ""} />
                              {isAnalyzing ? "..." : t('deep_analyze')}
                            </button>
                          )}
                          <a 
                            href={article.url}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      )}
                    </div>
                </div>
              </div>
            </div>
            );
          })
        )}
      </div>
    </div>
  );
};
