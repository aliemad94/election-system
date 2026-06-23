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
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
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
    setPendingFile(file);
    setPreviewData(null);
    setImportResult(null);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const XLSX = await import('xlsx');
      const wb = XLSX.read(arrayBuffer);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws);
      setPreviewData(rows.slice(0, 5));
    } catch {
      setPreviewData([]);
    }
  };

  const confirmImport = async () => {
    if (!pendingFile) return;
    setImporting(true);
    try {
      const fd = new FormData();
      fd.append('file', pendingFile);
      fd.append('entity', importEntity);
      const res = await fetch('/api/import/bulk', { method: 'POST', body: fd });
      const data = await res.json();
      setImportResult(data);
      setPreviewData(null);
      setPendingFile(null);
    } catch (err) {
      setImportResult({ error: 'فشل الاستيراد' });
    } finally {
      setImporting(false);
    }
  };

  const cancelPreview = () => {
    setPreviewData(null);
    setPendingFile(null);
    if (fileRef.current) fileRef.current.value = '';
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

      {/* معاينة قبل الاستيراد */}
      {previewData && (
        <div className="fixed inset-0 bg-black/70 z-[80] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-5 max-w-2xl w-full max-h-[80vh] overflow-auto">
            <h3 className="text-sm font-bold mb-3">معاينة الاستيراد — أول 5 صفوف ({pendingFile?.name})</h3>
            {previewData.length > 0 ? (
              <table className="w-full text-[11px] border-collapse mb-4">
                <thead>
                  <tr className="bg-gray-100">
                    {Object.keys(previewData[0]).slice(0, 8).map(h => (
                      <th key={h} className="border px-2 py-1 text-right">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).slice(0, 8).map((v: any, j: number) => (
                        <td key={j} className="border px-2 py-1">{String(v)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500 text-sm mb-4">لا توجد بيانات للمعاينة</p>
            )}
            <div className="flex gap-2 justify-end">
              <button
                onClick={confirmImport}
                disabled={importing}
                className="bg-green-600 hover:bg-green-500 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm font-bold"
              >
                {importing ? 'جاري الاستيراد...' : '✅ تأكيد الاستيراد'}
              </button>
              <button
                onClick={cancelPreview}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded text-sm"
              >إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
