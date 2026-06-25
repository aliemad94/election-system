'use client';

import React, { useState, useRef } from 'react';
import { Download, Upload, FileSpreadsheet, Printer, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
  const [exportingComprehensive, setExportingComprehensive] = useState(false);
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
      toast.success('تم تصدير البيانات بنجاح!');
    } catch (e) {
      toast.error('فشل تصدير البيانات');
    }
  };

  const handleExportComprehensiveReport = async () => {
    setExportingComprehensive(true);
    try {
      const [indicatorsRes, tribesRes, keysRes] = await Promise.all([
        fetch('/api/comprehensive-indicators'),
        fetch('/api/tribes'),
        fetch('/api/electoral-keys'),
      ]);

      if (!indicatorsRes.ok || !tribesRes.ok || !keysRes.ok) {
        throw new Error('فشل جلب البيانات للتقرير الشامل');
      }

      const indicatorsData = await indicatorsRes.json();
      const tribesData = await tribesRes.json();
      const keysData = await keysRes.json();

      const XLSX = await import('xlsx');

      // Sheet 1: Executive Summary
      const summaryList = [
        { 'المؤشر الاستراتيجي': 'عدد الأصوات المتوقعة يوم الاقتراع', 'القيمة': indicatorsData.decisive.expectedVotesOnDay },
        { 'المؤشر الاستراتيجي': 'نسبة المشاركة المتوقعة', 'القيمة': `${indicatorsData.decisive.expectedParticipation}%` },
        { 'المؤشر الاستراتيجي': 'إجمالي الأصوات الصافية المضمونة', 'القيمة': indicatorsData.decisive.totalNetVotes },
        { 'المؤشر الاستراتيجي': 'الأصوات المطلوبة للفوز (العتبة)', 'القيمة': indicatorsData.decisive.votesNeededToWin },
        { 'المؤشر الاستراتيجي': 'الفجوة الانتخابية الحالية', 'القيمة': indicatorsData.decisive.electoralGap },
        { 'المؤشر الاستراتيجي': 'احتمالية الفوز الآمن بالمقعد', 'القيمة': `${indicatorsData.decisive.winProbability}%` },
        { 'المؤشر الاستراتيجي': 'تقدير المقاعد المقترحة', 'القيمة': indicatorsData.decisive.projectedSeats },
        { 'المؤشر الاستراتيجي': 'مؤشر المخاطر الشامل', 'القيمة': `${indicatorsData.decisive.overallRisk}%` },
        { 'المؤشر الاستراتيجي': 'متوسط دقة تقارير المفاتيح (KRI)', 'القيمة': `${indicatorsData.decisive.avgKRI}%` },
        { 'المؤشر الاستراتيجي': 'متوسط خطر تسرب الأصوات (DRS)', 'القيمة': `${indicatorsData.decisive.avgDRS}%` },
      ];
      const wsSummary = XLSX.utils.json_to_sheet(summaryList);

      // Sheet 2: Districts Breakdown
      const districtsList = indicatorsData.decisive.areaMap.map((d: any) => ({
        'القضاء': d.district,
        'أصوات صافية': d.netVotes,
        'قوة التأييد': `${d.strength}%`,
        'مستوى التقييم': d.color === 'green' ? 'قوي' : d.color === 'yellow' ? 'متأرجح' : 'ضعيف',
        'عدد المفاتيح': d.keyCount,
      }));
      const wsDistricts = XLSX.utils.json_to_sheet(districtsList);

      // Sheet 3: Electoral Keys list
      const keysList = keysData.map((k: any) => ({
        'كود المفتاح': k.code,
        'الاسم الكامل': `${k.firstName} ${k.fatherName || ''} ${k.grandfatherName || ''}`.trim(),
        'اللقب': k.nickname || '',
        'القضاء': k.district || '',
        'مركز الاقتراع': k.pollingCenter || '',
        'إجمالي الأصوات': k.totalVotes,
        'أصوات مؤيدة': k.supportedVotes,
        'أصوات محايدة': k.neutralVotes,
        'أصوات ضعيفة': k.weakVotes,
        'الأصوات الصافية': k.netVotes,
        'التقييم الموزون': `${k.weightedScore || 0}%`,
        'التصنيف': k.classification || '',
        'حالة التدريب': k.trainingStatus || 'غير مدرب',
        'دقة البيانات': k.dataAccuracy || '3',
      }));
      const wsKeys = XLSX.utils.json_to_sheet(keysList);

      // Sheet 4: Tribes Breakdown
      const tribesList = tribesData.map((t: any) => ({
        'الاسم': t.name,
        'مستوى التأثير': t.influence,
        'القضاء': t.district || '',
        'عدد الناخبين': t.voterCount,
      }));
      const wsTribes = XLSX.utils.json_to_sheet(tribesList);

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, wsSummary, 'ملخص المؤشرات');
      XLSX.utils.book_append_sheet(wb, wsDistricts, 'تحليل الأقضية');
      XLSX.utils.book_append_sheet(wb, wsKeys, 'تقييم المفاتيح');
      XLSX.utils.book_append_sheet(wb, wsTribes, 'بيانات العشائر');

      XLSX.writeFile(wb, `electoral_comprehensive_report_${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success('تم تصدير التقرير التنفيذي الشامل بنجاح!');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'فشل تصدير التقرير الشامل');
    } finally {
      setExportingComprehensive(false);
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
      toast.success('تم استيراد البيانات بنجاح!');
    } catch (err) {
      setImportResult({ error: 'فشل الاستيراد' });
      toast.error('فشل استيراد ملف Excel');
    } finally {
      setImporting(false);
    }
  };

  const cancelPreview = () => {
    setPreviewData(null);
    setPendingFile(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-wrap items-center gap-3 print:hidden">
      {/* تصدير أساسي */}
      <div className="flex items-center gap-1.5">
        <select
          value={exportEntity}
          onChange={e => setExportEntity(e.target.value)}
          className="bg-[var(--el-surface)] border border-[var(--el-line)] rounded px-2.5 py-1 text-[11px] text-[var(--el-text)] cursor-pointer outline-none focus:border-el-primary"
        >
          {ENTITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 bg-[var(--el-surface-container-high)] text-[var(--el-text)] border border-[var(--el-line)] rounded px-3 py-1 text-[11px] font-bold hover:bg-[var(--el-surface-container-highest)] cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" /> تصدير Excel
        </button>
      </div>

      {/* تقرير تنفيذي شامل */}
      <button
        onClick={handleExportComprehensiveReport}
        disabled={exportingComprehensive}
        className="flex items-center gap-1.5 bg-el-primary text-white rounded px-3 py-1 text-[11px] font-bold hover:bg-el-primary/95 cursor-pointer disabled:opacity-50"
      >
        {exportingComprehensive ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <FileSpreadsheet className="w-3.5 h-3.5" />
        )}
        التقرير التنفيذي الشامل
      </button>

      {/* طباعة التقرير PDF */}
      <button
        onClick={handlePrint}
        className="flex items-center gap-1.5 bg-[var(--el-surface-container-high)] text-[var(--el-text)] border border-[var(--el-line)] rounded px-3 py-1 text-[11px] font-bold hover:bg-[var(--el-surface-container-highest)] cursor-pointer"
      >
        <Printer className="w-3.5 h-3.5 text-el-secondary" /> طباعة تقرير PDF
      </button>

      {/* فاصل */}
      <div className="w-[1px] h-6 bg-[var(--el-line)] mx-1 hidden sm:block" />

      {/* استيراد */}
      <div className="flex items-center gap-1.5">
        <select
          value={importEntity}
          onChange={e => setImportEntity(e.target.value)}
          className="bg-[var(--el-surface)] border border-[var(--el-line)] rounded px-2.5 py-1 text-[11px] text-[var(--el-text)] cursor-pointer outline-none focus:border-el-primary"
        >
          {IMPORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <label className="flex items-center gap-1.5 bg-[var(--el-surface-container-high)] border border-[var(--el-line)] rounded px-3 py-1 text-[11px] font-bold cursor-pointer hover:bg-[var(--el-surface-container-highest)]">
          <Upload className="w-3.5 h-3.5" /> {importing ? 'جاري الرفع...' : 'استيراد Excel'}
          <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
        </label>
      </div>

      {/* نتيجة الاستيراد */}
      {importResult && (
        <div className={`text-[10px] px-2.5 py-1 rounded font-bold ${importResult.error ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
          {importResult.error
            ? importResult.error
            : `تم: ${importResult.created} | متخطى: ${importResult.skipped} | المجموع: ${importResult.total}`}
        </div>
      )}

      {/* معاينة قبل الاستيراد */}
      {previewData && (
        <div className="fixed inset-0 bg-black/75 z-[80] flex items-center justify-center p-4" dir="rtl">
          <div className="bg-[var(--el-surface)] border border-[var(--el-line)] rounded-lg p-5 max-w-2xl w-full max-h-[85vh] overflow-auto flex flex-col gap-4 shadow-2xl">
            <div>
              <h3 className="text-sm font-bold text-[var(--el-text)]">معاينة استيراد البيانات — أول 5 صفوف</h3>
              <p className="text-[11px] text-[var(--el-muted)] mt-1">الملف المختار: {pendingFile?.name}</p>
            </div>
            
            {previewData.length > 0 ? (
              <div className="overflow-x-auto border border-[var(--el-line)] rounded">
                <table className="w-full text-[11px] border-collapse text-right">
                  <thead>
                    <tr className="bg-[var(--el-surface-container)] text-[var(--el-text)] border-b border-[var(--el-line)] font-bold">
                      {Object.keys(previewData[0]).slice(0, 8).map(h => (
                        <th key={h} className="px-3 py-2 border-l border-[var(--el-line)]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--el-line)] text-[var(--el-text)]">
                    {previewData.map((row, i) => (
                      <tr key={i} className="hover:bg-[var(--el-surface-container-lowest)] transition-colors">
                        {Object.values(row).slice(0, 8).map((v: any, j: number) => (
                          <td key={j} className="px-3 py-1.5 border-l border-[var(--el-line)] font-sans">{String(v)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-red-500">لا توجد صفوف صالحة لقراءتها في الملف.</p>
            )}

            <div className="flex justify-end gap-3 border-t border-[var(--el-line)] pt-3.5">
              <button
                onClick={confirmImport}
                disabled={importing}
                className="bg-el-primary text-white px-4 py-1.5 rounded text-xs font-bold hover:bg-el-primary/90 cursor-pointer disabled:opacity-40"
              >
                تأكيد الاستيراد والحفظ
              </button>
              <button
                onClick={cancelPreview}
                className="border border-[var(--el-line)] text-[var(--el-text)] px-4 py-1.5 rounded text-xs font-bold hover:bg-[var(--el-surface-container)] cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
