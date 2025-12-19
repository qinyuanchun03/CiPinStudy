
import React, { useEffect, useState } from 'react';
import { X, Archive, Download, Trash2, FileJson, FileText, Search } from 'lucide-react';
import { SavedReport } from '../types';
import { api } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

interface DossierModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DossierModal: React.FC<DossierModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [reports, setReports] = useState<SavedReport[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadReports();
    }
  }, [isOpen]);

  const loadReports = () => {
    setReports(api.getDossier());
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this report?")) {
        const updated = api.deleteFromDossier(id);
        setReports(updated);
    }
  };

  const downloadJSON = () => {
    const dataStr = JSON.stringify(reports, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `xinhua_insight_dossier_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadTXT = () => {
    let content = `XINHUA INSIGHT - CONFIDENTIAL DOSSIER\nExport Date: ${new Date().toLocaleDateString()}\n\n`;
    
    reports.forEach((r, idx) => {
        content += `==================================================\n`;
        content += `REPORT #${idx + 1}: ${r.article.title}\n`;
        content += `DATE: ${r.article.date}\n`;
        content += `URL: ${r.article.url}\n`;
        content += `PERSONA: ${r.persona}\n`;
        content += `--------------------------------------------------\n`;
        content += `[Surface Meaning]: ${r.report.surface_meaning}\n\n`;
        content += `[Deep Logic / Intent]: ${r.report.deep_logic}\n\n`;
        content += `[Impact]: ${r.report.impact_assessment}\n\n`;
        content += `[Key Signals]:\n`;
        r.report.key_segments.forEach(s => content += ` - "${s}"\n`);
        content += `\n`;
    });

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `xinhua_insight_dossier_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-orange-600 text-white rounded">
                <Archive size={18} />
            </div>
            <h2 className="text-lg font-bold text-slate-800">{t('dossier_title')}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={downloadJSON} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs hover:bg-slate-50 transition-colors">
                <FileJson size={14} /> {t('export_json')}
            </button>
            <button onClick={downloadTXT} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs hover:bg-slate-50 transition-colors">
                <FileText size={14} /> {t('export_txt')}
            </button>
            <div className="w-px h-4 bg-slate-300 mx-1"></div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Archive size={48} className="mb-4 opacity-20" />
                <p>{t('dossier_empty')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
                {reports.map((item) => (
                    <div key={item.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="font-bold text-slate-800 leading-tight mb-1">{item.article.title}</h3>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <span className="font-mono">{item.article.date}</span>
                                    <span>•</span>
                                    <span className="uppercase bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-semibold">{item.persona}</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleDelete(item.id)}
                                className="text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 p-1"
                                title={t('delete')}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                        
                        <div className="bg-indigo-50/50 p-3 rounded-md mb-3">
                            <h4 className="text-xs font-bold text-indigo-400 uppercase mb-1">{t('deep_logic')}</h4>
                            <p className="text-sm text-indigo-900 font-medium">{item.report.deep_logic}</p>
                        </div>

                        {item.report.key_segments.length > 0 && (
                             <div className="space-y-1">
                                {item.report.key_segments.slice(0, 2).map((seg, i) => (
                                    <p key={i} className="text-xs text-slate-500 italic truncate border-l-2 border-slate-200 pl-2">
                                        "{seg}"
                                    </p>
                                ))}
                             </div>
                        )}
                    </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
