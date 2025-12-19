
import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, CheckCircle2, Wifi, Server, Terminal, Globe, Info } from 'lucide-react';
import { APIConfig } from '../types';
import { api } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: APIConfig) => Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave }) => {
  const { t } = useLanguage();
  
  const [provider, setProvider] = useState<'openai' | 'deepseek' | 'ollama'>('openai');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [modelId, setModelId] = useState('');
  const [proxyUrls, setProxyUrls] = useState(''); // 以换行符分隔的字符串
  
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testMessage, setTestMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    if (isOpen) {
      const currentConfig = api.getConfig();
      if (currentConfig) {
        setProvider(currentConfig.provider);
        setApiKey(currentConfig.apiKey || '');
        setBaseUrl(currentConfig.baseUrl || '');
        setModelId(currentConfig.modelId || '');
        setProxyUrls((currentConfig.customProxies || []).join('\n'));
      }
      setTestMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!modelId) {
        setTestMessage({ type: 'error', text: t('model_id_required') || "Please enter a Model ID." });
        return;
    }

    setTesting(true);
    setTestMessage(null);

    const result = await api.validateConfig({ provider, apiKey, baseUrl, modelId });
    
    setTesting(false);
    if (result.valid) {
      setTestMessage({ type: 'success', text: result.message || t('connection_success') });
    } else {
      setTestMessage({ type: 'error', text: result.message || t('connection_failed') });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const customProxies = proxyUrls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);

    await onSave({ 
      provider, 
      apiKey, 
      baseUrl: baseUrl || undefined, 
      modelId,
      customProxies
    });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800">{t('settings_title')}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          {/* 1. API Credentials Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Server size={14} /> {t('step_1')}
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('provider')}</label>
              <select 
                value={provider}
                onChange={(e) => setProvider(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
              >
                <option value="openai">OpenAI / Compatible</option>
                <option value="deepseek">DeepSeek Official</option>
                <option value="ollama">Local Ollama</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('apiKey')}</label>
              <input 
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
              />
            </div>

            {(provider === 'ollama' || provider === 'openai') && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('baseUrl')}</label>
                <input 
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder={provider === 'ollama' ? "http://localhost:11434" : "https://api.openai.com/v1"}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-mono"
                />
              </div>
            )}

             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">{t('model_id')}</label>
               <div className="relative">
                 <input
                   list="model-options"
                   type="text"
                   value={modelId}
                   onChange={(e) => setModelId(e.target.value)}
                   placeholder="gpt-4o, deepseek-chat..."
                   className="w-full px-3 py-2 pl-9 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-mono"
                 />
                 <Terminal size={14} className="absolute left-3 top-3 text-slate-400" />
                 <datalist id="model-options">
                   <option value="gpt-4o" />
                   <option value="gpt-4o-mini" />
                   <option value="deepseek-chat" />
                   <option value="deepseek-reasoner" />
                   <option value="qwen2.5:7b" />
                 </datalist>
               </div>
             </div>

            <button 
              type="button"
              onClick={handleTestConnection}
              disabled={testing || !apiKey}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors border text-sm font-medium ${
                testing ? 'bg-slate-50 text-slate-400 border-slate-200' : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50'
              }`}
            >
              {testing ? <Wifi size={16} className="animate-pulse" /> : <Wifi size={16} />}
              {testing ? t('testing') : t('test_connection')}
            </button>

            {testMessage && (
              <div className={`text-xs flex items-start gap-2 p-3 rounded-lg border ${testMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                {testMessage.type === 'success' ? <CheckCircle2 size={14} className="mt-0.5 shrink-0" /> : <AlertCircle size={14} className="mt-0.5 shrink-0" />}
                <span>{testMessage.text}</span>
              </div>
            )}
          </div>

          {/* 2. Proxy Configuration Section */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Globe size={14} /> {t('proxy_settings_title')}
            </h3>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-start gap-2 mb-2">
                    <Info size={14} className="text-indigo-500 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-slate-500 leading-normal">
                        {t('proxy_note')}
                    </p>
                </div>
                <textarea 
                    value={proxyUrls}
                    onChange={(e) => setProxyUrls(e.target.value)}
                    rows={4}
                    placeholder="https://proxy.com/?url=${url}"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-xs font-mono"
                />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-sm font-bold"
            >
              {loading ? <><Loader2 className="animate-spin" size={18} /> {t('saving')}</> : <><Save size={18} /> {t('save')}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Loader2 = ({ className, size }: { className?: string, size?: number }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);
