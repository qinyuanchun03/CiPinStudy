
import React, { useEffect, useState, useCallback } from 'react';
import { RefreshCw, Sparkles, Loader2, Newspaper, Globe, AlertTriangle, Settings, Archive } from 'lucide-react';
import { DashboardData, AIReport, PersonaId, Language, Article, DeepReport } from './types';
import { api } from './services/api';
import { StatsSection } from './components/StatsSection';
import { ArticleList } from './components/ArticleList';
import { AIReportSection } from './components/AIReportSection';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { PersonaSelector } from './components/PersonaSelector';
import { SettingsModal } from './components/SettingsModal';
import { DeepAnalysisModal } from './components/DeepAnalysisModal';
import { DossierModal } from './components/DossierModal';

function AppContent() {
  const { t, language, setLanguage } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [aiData, setAiData] = useState<AIReport | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<PersonaId>('plain_spoken');
  
  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  // Dossier State
  const [dossierOpen, setDossierOpen] = useState(false);

  // Deep Analysis State
  const [deepModalOpen, setDeepModalOpen] = useState(false);
  const [deepLoading, setDeepLoading] = useState(false);
  const [deepReport, setDeepReport] = useState<DeepReport | null>(null);
  const [analyzingArticleUrl, setAnalyzingArticleUrl] = useState<string | null>(null);
  const [deepArticle, setDeepArticle] = useState<Article | undefined>(undefined);

  // Batch Analysis State
  const [batchProgress, setBatchProgress] = useState<{current: number, total: number} | null>(null);

  // Initial Load
  useEffect(() => {
    checkConfig();
    init();
  }, []);

  const checkConfig = async () => {
    const status = await api.getConfigStatus();
    setIsConfigured(status.configured);
  };

  const init = async () => {
    setLoading(true);
    setAiData(null); 
    try {
      let data = await api.getLatestData();
      if (!data || !data.stats) {
        const crawled = await api.crawlNews({ limit_hours: 12 });
        if (crawled) {
          data = await api.getLatestData();
        }
      }
      setDashboardData(data);
    } catch (e) {
      console.error("Initialization error", e);
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    setLoading(true);
    setAiData(null);
    try {
        const success = await api.crawlNews({ limit_hours: 168 });
        if (success) {
            const data = await api.getLatestData();
            setDashboardData(data);
        } else {
            throw new Error("Crawler failed");
        }
    } catch (e) {
        console.error("Refresh failed", e);
        alert(t('crawl_failed'));
    } finally {
        setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!isConfigured) {
      setIsSettingsOpen(true);
      return;
    }

    if (!dashboardData || dashboardData.articles.length === 0) {
        alert("No articles to analyze.");
        return;
    }

    setAnalyzing(true);
    setAiData(null); 
    try {
      const report = await api.analyzeAI(selectedPersona, dashboardData.articles);
      setAiData(report);
    } catch (e: any) {
      console.error(e);
      alert("Analysis failed: " + (e.message || "Unknown error"));
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDeepAnalyze = useCallback(async (article: Article) => {
    if (!isConfigured) {
        setIsSettingsOpen(true);
        return;
    }

    setDeepArticle(article);
    setAnalyzingArticleUrl(article.url);
    setDeepModalOpen(true);
    setDeepLoading(true);
    setDeepReport(null);

    try {
        const content = await api.crawlArticleContent(article.url);
        if (!content) throw new Error("Failed to fetch article content.");

        const report = await api.analyzeDeepArticle(article, content, selectedPersona);
        setDeepReport(report);
    } catch (e: any) {
        console.error(e);
        alert("Deep analysis failed: " + (e.message || "Unknown error"));
        setDeepModalOpen(false);
    } finally {
        setDeepLoading(false);
        setAnalyzingArticleUrl(null);
    }
  }, [isConfigured, selectedPersona]);

  const handleBatchAnalyze = useCallback(async (articles: Article[]) => {
    if (!isConfigured) {
        setIsSettingsOpen(true);
        return;
    }
    
    const personaName = t(`persona_${selectedPersona}`);
    const msg = t('batch_confirm_msg')
      .replace('{count}', articles.length.toString())
      .replace('{persona}', personaName);
    
    if (!window.confirm(msg)) return;

    setBatchProgress({ current: 0, total: articles.length });

    try {
        for (let i = 0; i < articles.length; i++) {
            const article = articles[i];
            setBatchProgress({ current: i + 1, total: articles.length });
            setAnalyzingArticleUrl(article.url);

            try {
                const content = await api.crawlArticleContent(article.url);
                if (content) {
                    const report = await api.analyzeDeepArticle(article, content, selectedPersona);
                    api.saveToDossier({
                        id: crypto.randomUUID(),
                        article,
                        report,
                        timestamp: Date.now(),
                        persona: selectedPersona
                    });
                }
            } catch (e) {
                console.error(`Error in batch item ${article.title}:`, e);
            }
        }
        alert(t('batch_complete'));
        setDossierOpen(true);
    } finally {
        setBatchProgress(null);
        setAnalyzingArticleUrl(null);
    }
  }, [isConfigured, selectedPersona, t]);

  const cycleLanguage = () => {
    const order: Language[] = ['zh', 'en', 'jp'];
    const idx = order.indexOf(language);
    setLanguage(order[(idx + 1) % order.length]);
  };

  const hasData = dashboardData && dashboardData.stats && dashboardData.stats.top_keywords.length > 0;

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
              <Newspaper size={20} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{t('appTitle')}</h1>
          </div>
          <div className="flex items-center gap-2">
            {batchProgress && (
                <div className="hidden sm:flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-lg mr-2">
                    <Loader2 size={14} className="animate-spin text-indigo-600" />
                    <span className="text-xs font-bold text-indigo-700">
                        {t('analyzing_batch').replace('{current}', batchProgress.current.toString()).replace('{total}', batchProgress.total.toString())}
                    </span>
                </div>
            )}
            <button onClick={cycleLanguage} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-2">
              <Globe size={20} />
              <span className="text-xs font-semibold uppercase w-4">{language}</span>
            </button>
            <div className="h-6 w-px bg-slate-200 mx-1"></div>
            <button onClick={() => setDossierOpen(true)} className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title={t('dossier')}>
              <Archive size={20} />
            </button>
            <button onClick={() => setIsSettingsOpen(true)} className={`p-2 rounded-lg transition-colors ${!isConfigured ? 'text-red-500 bg-red-50 animate-pulse' : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'}`} title={t('settings')}>
              <Settings size={20} />
            </button>
            <button onClick={handleManualRefresh} disabled={loading || !!batchProgress} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title={t('refresh')}>
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
        {loading && !dashboardData ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 size={48} className="animate-spin mb-4 text-indigo-600" />
            <p>{t('loading_crawling')}</p>
          </div>
        ) : !hasData ? (
           <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-slate-100">
             <AlertTriangle size={48} className="text-slate-300 mb-4" />
            <p className="text-slate-500 mb-4">{t('no_data')}</p>
            <button onClick={handleManualRefresh} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                {t('retry')}
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {dashboardData?.stats && <StatsSection data={dashboardData.stats} />}
              </div>
              <div className="lg:col-span-1 h-full">
                {dashboardData && (
                    <ArticleList 
                        articles={dashboardData.articles} 
                        onAnalyzeDeep={handleDeepAnalyze}
                        onBatchAnalyze={handleBatchAnalyze}
                        analyzingUrl={analyzingArticleUrl}
                        isBatchAnalyzing={!!batchProgress}
                    />
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center py-10 border-t border-slate-200">
              <PersonaSelector selected={selectedPersona} onSelect={setSelectedPersona} disabled={analyzing || !!batchProgress} />
              <div className="relative group">
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing || !!batchProgress}
                  className={`flex items-center gap-3 px-8 py-4 rounded-full text-lg font-semibold shadow-lg transition-all ${(analyzing || !!batchProgress) ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200 hover:-translate-y-1'}`}
                >
                  {analyzing ? <><Loader2 size={24} className="animate-spin" /> {t('generating')}</> : <><Sparkles size={24} className="animate-pulse" /> {t('generate_report')}</>}
                </button>
                {!isConfigured && <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 cursor-pointer" onClick={() => setIsSettingsOpen(true)}>
                    <AlertTriangle size={16} /> {t('config_required')}
                </div>}
              </div>
            </div>
            {aiData && <AIReportSection report={aiData} persona={selectedPersona} />}
          </>
        )}
      </main>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onSave={async (config) => { await api.updateConfig(config); await checkConfig(); }} />
      <DeepAnalysisModal isOpen={deepModalOpen} onClose={() => setDeepModalOpen(false)} loading={deepLoading} data={deepReport} article={deepArticle} currentPersona={selectedPersona} />
      <DossierModal isOpen={dossierOpen} onClose={() => setDossierOpen(false)} />
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
