import React, { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText, ChevronDown, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export default function ExportButton({ endpoint, resourceName = 'data' }) {
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('');
  const containerRef = useRef(null);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDownload = async (format) => {
    setIsExporting(true);
    setExportFormat(format);
    setIsOpen(false);

    try {
      const response = await api.get(endpoint, {
        params: { format },
        responseType: 'blob',
      });

      // Create a blob URL and trigger browser download
      const mimeType = format === 'csv' ? 'text/csv' : 'application/pdf';
      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${resourceName}_export.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export download failed:', err);
      toast.error('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
      setExportFormat('');
    }
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/80 text-xs sm:text-sm font-semibold transition cursor-pointer disabled:opacity-50 shadow-sm"
      >
        {isExporting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-emerald-600 dark:text-emerald-400" />
            <span>Exporting ({exportFormat.toUpperCase()})...</span>
          </>
        ) : (
          <>
            <Download className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Export</span>
            <ChevronDown className={`h-3.5 w-3.5 text-slate-400 dark:text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl p-1.5 z-40 space-y-1">
          <button
            onClick={() => handleDownload('csv')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-left"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <div>
              <span className="block">Export as CSV</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">.csv spreadsheet</span>
            </div>
          </button>

          <button
            onClick={() => handleDownload('pdf')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-left"
          >
            <FileText className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            <div>
              <span className="block">Export as PDF</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">.pdf document</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
