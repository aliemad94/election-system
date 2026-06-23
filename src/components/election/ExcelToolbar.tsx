'use client';

import React, { useState, useRef } from 'react';
import { Download, Upload, FileSpreadsheet } from 'lucide-react';

const ENTITY_OPTIONS = [
  { value: 'voters', label: 'الناخبون' },
  { value: 'keys', label: 'المفاتيح الانتخابية' },
  { value: 'tribes', label: 'العشائر' },
  { value: 'commission', label: 'بيانات المفوضية' },
];

const IMPORT_OPTIONS = [
  { value: 'voters', label: 'الناخبون' },
  { value: 'keys', label: 'المفاتيح الانتخابية' },
];

export default function ExcelToolbar() {
  const [exportEntity, setExportEntity] = useState('voters');
  const [importEntity, setImportEntity] = useState('voters');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      const res = await fetch(`/api/export?entity=${exportEntity}`);
      if (!res.ok) throw new Error('فشل التصدير');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exportEntity}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('فشل التصدير');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('entity', importEntity);
      const res = await fetch('/api/import/bulk', { method: 'POST', body: fd });
      const data = await res.json();
      setImportResult(data);
    } catch (err) {
      setImportResult({ error: 'فشل الاستيراد' });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* تصدير */}
      <div className="flex items-center gap-1.5">
        <select
          value={exportEntity}
          onChange={e => setExportEntity(e.target.value)}
          className="bg-el-surface border border-el-outline-variant rounded px-2 py-1 text-[11px] text-el-on-surface"
        >
          {ENTITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button
          onClick={handleExport}
          className="flex items-center gap-1 bg-el-primary text-white rounded px-3 py-1 text-[11px] font-semibold hover:bg-el-primary/90"
        >
          <Download className="w-3 h-3" /> تصدير Excel
        </button>
      </div>

      {/* استيراد */}
      <div className="flex items-center gap-1.5">
        <select
          value={importEntity}
          onChange={e => setImportEntity(e.target.value)}
          className="bg-el-surface border border-el-outline-variant rounded px-2 py-1 text-[11px] text-el-on-surface"
        >
          {IMPORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <label className="flex items-center gap-1 bg-el-surface-container-high border border-el-outline-variant rounded px-3 py-1 text-[11px] font-semibold cursor-pointer hover:bg-el-surface-container-highest">
          <Upload className="w-3 h-3" /> {importing ? 'جاري الرفع...' : 'استيراد Excel'}
          <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
        </label>
      </div>

      {/* نتيجة الاستيراد */}
      {importResult && (
        <div className={`text-[10px] px-2 py-1 rounded ${importResult.error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {importResult.error
            ? importResult.error
            : `تم: ${importResult.created} | متخطى: ${importResult.skipped} | المجموع: ${importResult.total}`}
        </div>
      )}
    </div>
  );
}
