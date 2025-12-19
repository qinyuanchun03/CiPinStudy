
import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, CheckCircle2, Wifi, Server, Terminal } from 'lucide-react';
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
  
  const [loading, setLoading] = useState(false); // For saving
  const [testing, setTesting] = useState(false); // For validation
  const [testMessage, setTestMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Load configuration from local storage when modal opens
  useEffect(() => {
    if (isOpen) {
      const currentConfig = api.getConfig();
      if (currentConfig) {
        setProvider(currentConfig.provider);
        setApiKey(currentConfig.apiKey || '');
        setBaseUrl(currentConfig.baseUrl || '');
        setModelId(currentConfig.modelId || '');
      }
      setTestMessage(null); // Clear previous test results
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!modelId) {
        setTestMessage({ type: 'error', text: "Please enter a Model ID to test." });
        return;
    }

    setTesting(true);
    setTestMessage(null);

    // Pass all parameters including Model ID for a full integration test
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
    await onSave({ provider, apiKey, baseUrl: baseUrl || undefined, modelId });
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
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* Note */}
          <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded-lg flex items-start gap-2">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <p>{t('api_note')}</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t('step_1')}</h3>
            
            {/* Provider Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('provider')}</label>
              <select 
                value={provider}
                onChange={(e) => {
                  setProvider(e.target.value as any);
                }}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              >
                <option value="openai">OpenAI (GPT-4/3.5)</option>
                <option value="deepseek">DeepSeek</option>
                <option value="ollama">Local Ollama</option>
              </select>
            </div>

            {/* API Key */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('apiKey')}</label>
              <input 
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Base URL (Conditional) */}
            {(provider === 'ollama' || provider === 'openai') && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('baseUrl')}</label>
                <input 
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder={provider === 'ollama' ? "http://localhost:11434" : "https://api.openai.com/v1"}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            )}

             {/* Model ID - Moved Up and Always Visible */}
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">{t('model_id')}</label>
               <div className="relative">
                 <input
                   list="model-options"
                   type="text"
                   value={modelId}
                   onChange={(e) => setModelId(e.target.value)}
                   placeholder="e.g. gpt-4o, deepseek-chat, llama3:latest"
                   className="w-full px-3 py-2 pl-9 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                 />
                 <Terminal size={16} className="absolute left-3 top-3 text-slate-400" />
                 {/* Datalist for common suggestions */}
                 <datalist id="model-options">
                   <option value="gpt-4o" />
                   <option value="gpt-4-turbo" />
                   <option value="gpt-3.5-turbo" />
                   <option value="deepseek-chat" />
                   <option value="deepseek-coder" />
                   <option value="llama3" />
                   <option value="mistral" />
                 </datalist>
               </div>
             </div>

            {/* Test Connection Button */}
            <button 
              type="button"
              onClick={handleTestConnection}
              disabled={testing || !apiKey}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors border ${
                testing ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50'
              }`}
            >
              {testing ? (
                <><Wifi size={16} className="animate-pulse" /> {t('testing')}</>
              ) : (
                <><Wifi size={16} /> {t('test_connection')}</>
              )}
            </button>

            {testMessage && (
              <div className={`text-sm flex items-start gap-2 p-2 rounded-lg ${testMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                {testMessage.type === 'success' ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> : <AlertCircle size={16} className="mt-0.5 shrink-0" />}
                <span>{testMessage.text}</span>
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end border-t border-slate-100">
            <button 
              type="submit" 
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-sm font-medium"
            >
              {loading ? t('saving') : <><Save size={18} /> {t('save')}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
