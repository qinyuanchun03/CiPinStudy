import React, { useEffect, useState } from 'react';
import { RefreshCw, Sparkles, Loader2, Newspaper, Globe, AlertTriangle, Settings } from 'lucide-react';
import { DashboardData, AIReport, PersonaId, Language } from './types';
import { api } from './services/api';
import { StatsSection } from './components/StatsSection';
import { ArticleList } from './components/ArticleList';
import { AIReportSection } from './components/AIReportSection';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { PersonaSelector } from './components/PersonaSelector';
import { SettingsModal } from './components/SettingsModal';

function AppContent() {
  const { t, language, setLanguage } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [aiData, setAiData] = useState<AIReport | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<PersonaId>('youtuber');
  
  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

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
      // 1. Get Data (Stats + Articles)
      let data = await api.getLatestData();
      
      // 2. If no data (or empty), try to crawl automatically
      if (!data || !data.stats) {
        console.log("No data found, triggering fast crawler (12h)...");
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
        console.log("Manual refresh: Crawling 1 week...");
        await api.crawlNews({ limit_hours: 168 });
        const data = await api.getLatestData();
        setDashboardData(data);
    } catch (e) {
        console.error("Refresh failed", e);
    } finally {
        setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!isConfigured) {
      setIsSettingsOpen(true);
      return;
    }

    // Ensure we have articles to analyze
    if (!dashboardData || dashboardData.articles.length === 0) {
        alert("No articles available to analyze. Please refresh or crawl data first.");
        return;
    }

    setAnalyzing(true);
    setAiData(null); 
    try {
      const report = await api.analyzeAI(selectedPersona, dashboardData.articles);
      setAiData(report);
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Analysis failed. Please check your configuration.");
    } finally {
      setAnalyzing(false);
    }
  };

  const cycleLanguage = () => {
    const order: Language[] = ['zh', 'en', 'jp'];
    const idx = order.indexOf(language);
    setLanguage(order[(idx + 1) % order.length]);
  };

  const hasData = dashboardData && dashboardData.stats && dashboardData.stats.top_keywords.length > 0;

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
              <Newspaper size={20} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{t('appTitle')}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={cycleLanguage}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-2"
              title="Switch Language"
            >
              <Globe size={20} />
              <span className="text-xs font-semibold uppercase w-4">{language}</span>
            </button>
            <div className="h-6 w-px bg-slate-200 mx-1"></div>
            
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className={`p-2 rounded-lg transition-colors ${!isConfigured ? 'text-red-500 bg-red-50 animate-pulse' : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'}`}
              title={t('settings')}
            >
              <Settings size={20} />
            </button>

            <button 
              onClick={handleManualRefresh}
              disabled={loading}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title={t('refresh')}
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
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
                {dashboardData && <ArticleList articles={dashboardData.articles} />}
              </div>
            </div>
            
            {/* AI Action Area */}
            <div className="flex flex-col items-center justify-center py-10 border-t border-slate-200">
              
              <PersonaSelector 
                selected={selectedPersona} 
                onSelect={setSelectedPersona}
                disabled={analyzing}
              />

              <div className="relative group">
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className={`
                    flex items-center gap-3 px-8 py-4 rounded-full text-lg font-semibold shadow-lg transition-all
                    ${analyzing
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200 hover:-translate-y-1'
                    }
                  `}
                >
                  {analyzing ? (
                    <>
                      <Loader2 size={24} className="animate-spin" />
                      {t('generating')}
                    </>
                  ) : (
                    <>
                      <Sparkles size={24} className="animate-pulse" />
                      {t('generate_report')}
                    </>
                  )}
                </button>
                
                {!isConfigured && (
                    <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 cursor-pointer" onClick={() => setIsSettingsOpen(true)}>
                        <AlertTriangle size={16} />
                        {t('config_required')}
                    </div>
                )}
              </div>
            </div>

            {aiData && <AIReportSection report={aiData} persona={selectedPersona} />}
          </>
        )}
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        onSave={async (config) => {
          await api.updateConfig(config);
          await checkConfig();
        }}
      />
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