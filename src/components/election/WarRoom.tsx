"use client";

// ====================================================================
// WarRoom — غرفة العمليات اللحظية (Command Deck)
// ====================================================================

import { useEffect, useState } from "react";
import {
  Star,
  Phone,
  AlertTriangle,
  ShieldCheck,
  AlertCircle,
  BarChart3,
  Activity,
  Users,
  Trophy,
  RefreshCw,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface VoterItem {
  id: string;
  fullName: string;
  phone: string;
  district: string;
  supportDegree: number;
  votedOnDay: boolean;
  tribeName: string;
}

interface AlertItem {
  id: string;
  type: "CRITICAL" | "WARNING" | "INFO";
  title: string;
  description: string;
  district: string | null;
  createdAt: string;
}

interface StatsData {
  totalVoters: number;
  checkedInCount: number;
  votedPercentage: number;
  districts: { district: string; count: number }[];
}

export default function WarRoom() {
  const [voters, setVoters] = useState<VoterItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const load = async () => {
    setRefreshing(true);
    try {
      const [votersRes, alertsRes, statsRes] = await Promise.all([
        fetch("/api/voters?votedStatus=not_voted&limit=10"),
        fetch("/api/alerts"),
        fetch("/api/voters/stats"),
      ]);
      if (votersRes.ok) {
        const data = await votersRes.json();
        setVoters(data.voters || []);
      }
      if (alertsRes.ok) setAlerts(await alertsRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch {
      // تجاهل
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulate = async (count: number) => {
    setSimulating(true);
    try {
      const res = await fetch(`/api/reset/simulate-turnout?count=${count}`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        toast.success(data.message || `تم بنجاح تسجيل حضور ${data.checkedInCount} ناخب!`);
        load(); // Reload statistics
      }
    } catch {
      toast.error('حدث خطأ أثناء الاتصال بالخادم لمسار المحاكاة');
    } finally {
      setSimulating(false);
    }
  };

  const handleResetSimulate = async () => {
    if (!window.confirm('هل أنت متأكد من تصفير حضور جميع الناخبين في الماكينة الانتخابية؟')) return;
    setSimulating(true);
    try {
      const res = await fetch('/api/reset/simulate-turnout?action=reset', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        toast.success(data.message || 'تم تصفير حضور الناخبين بنجاح.');
        load();
      }
    } catch {
      toast.error('حدث خطأ أثناء تصفير الحضور');
    } finally {
      setSimulating(false);
    }
  };

  const votedPercentage = stats?.votedPercentage || 0;
  const districts = stats?.districts || [];
  const sortedDistricts = [...districts].sort((a, b) => b.count - a.count);
  const maxCount = sortedDistricts[0]?.count || 1;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="w-7 h-7 border-[3px] border-[var(--el-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 space-y-3.5 max-w-7xl mx-auto" dir="rtl">
      {/* ===== رأس غرفة العمليات ===== */}
      <div className="flex items-center justify-between px-4 h-14 rounded-lg bg-[var(--el-surface)] border border-[var(--el-line)]">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-[var(--el-text)] whitespace-nowrap">
            غرفة العمليات — ذي قار
          </h2>

          {/* شريط التقدّم الأفقي الضخم */}
          <div className="flex-grow mx-4 hidden md:flex flex-col justify-center min-w-0">
            <div className="flex justify-between items-end mb-1">
              <span className="text-[10.5px] font-bold tracking-wide text-[var(--el-muted)]">
                نسبة الاقتراع العامة
              </span>
              <span className="text-sm font-bold tnum text-[var(--el-primary)]">
                {votedPercentage}%
              </span>
            </div>
            <div className="h-3 w-full rounded-full overflow-hidden relative bg-[var(--el-surface-container)]">
              <div
                className="h-full transition-all duration-1000 relative bg-[var(--el-primary)]"
                style={{ width: `${votedPercentage}%` }}
              >
                <div className="absolute inset-0 bg-white/10 animate-pulse" />
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={load}
            disabled={refreshing}
            className="h-8 text-[var(--el-muted)] hover:text-[var(--el-text)] hover:bg-[var(--el-surface-container)] shrink-0 cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ml-1 ${refreshing ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline text-xs">تحديث</span>
          </Button>
        </div>
      </div>

      {/* ===== منصة المحاكاة والتحكم للتجربة والتدريب ===== */}
      <div className="bg-[var(--el-surface)] border border-[rgba(242,160,36,0.25)] rounded-lg p-3.5 flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-[rgba(242,160,36,0.1)] text-[var(--el-primary)] shrink-0 animate-pulse">
            <Zap className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-xs font-bold text-[var(--el-text)]">منصة محاكاة إقبال الناخبين يوم الحسم</h3>
            <p className="text-[10px] text-[var(--el-muted)]">تحكّم بزيادة تدفق الناخبين بشكل افتراضي لمحاكاة وتدريب كوادر غرف العمليات.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <Button
            size="sm"
            onClick={() => handleSimulate(25)}
            disabled={simulating}
            className="h-8 text-xs font-bold bg-[var(--el-primary)] hover:bg-[var(--el-primary)]/90 text-white cursor-pointer"
          >
            إقبال تدريجي (+25)
          </Button>
          <Button
            size="sm"
            onClick={() => handleSimulate(100)}
            disabled={simulating}
            className="h-8 text-xs font-bold bg-[var(--el-primary)] hover:bg-[var(--el-primary)]/90 text-white cursor-pointer"
          >
            إقبال مكثف (+100)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleResetSimulate}
            disabled={simulating}
            className="h-8 text-xs font-bold border-red-500/30 text-red-500 hover:bg-red-500/10 cursor-pointer"
          >
            تصفير يوم الاقتراع
          </Button>
        </div>
      </div>

      {/* ===== الشبكة الرئيسية ===== */}
      <div className="grid grid-cols-12 gap-3">
        {/* العمود الأيسر: أهداف عالية القيمة */}
        <div className="col-span-12 lg:col-span-7 flex flex-col rounded-lg bg-[var(--el-surface)] border border-[var(--el-line)] overflow-hidden">
          <div className="px-4 py-2.5 flex justify-between items-center bg-[var(--el-surface-container)] border-b border-[var(--el-line)]">
            <h3 className="text-sm font-semibold text-[var(--el-text)] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[var(--el-primary)]" />
              أهداف عالية القيمة (لم تصوّت)
            </h3>
            <span className="chip chip-alert text-[10px]">فرز مباشر</span>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[380px] custom-scroll">
            <table className="w-full text-right">
              <thead className="sticky top-0 z-10 bg-[var(--el-surface-container)] border-b border-[var(--el-line)] text-[var(--el-muted)]">
                <tr>
                  <th className="text-[10.5px] font-bold tracking-wide px-3 py-2 w-20">
                    الثقة
                  </th>
                  <th className="text-[10.5px] font-bold tracking-wide px-3 py-2">
                    الاسم
                  </th>
                  <th className="text-[10.5px] font-bold tracking-wide px-3 py-2 text-center hidden sm:table-cell">
                    القضاء / العشيرة
                  </th>
                  <th className="text-[10.5px] font-bold tracking-wide px-3 py-2 text-center">
                    إجراء
                  </th>
                </tr>
              </thead>
              <tbody>
                {voters.slice(0, 8).map((voter, index) => (
                  <tr
                    key={voter.id}
                    className="transition-colors h-9 border-b border-[var(--el-line)] hover:bg-[var(--el-surface-container)]"
                  >
                    <td className="px-3 py-1.5">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < voter.supportDegree ? "fill-current" : ""}`}
                            style={{
                              color:
                                i < voter.supportDegree
                                  ? "var(--el-primary)"
                                  : "var(--el-line)",
                            }}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-1.5">
                      <div className="text-[12.5px] font-semibold text-[var(--el-text)]">
                        {voter.fullName}
                      </div>
                      <div
                        className="text-[10.5px] text-[var(--el-muted)] tnum"
                        dir="ltr"
                      >
                        {voter.phone
                          ? voter.phone.replace(
                              /(\d{4})(\d{3})(\d{3})/,
                              "$1 *** $3"
                            )
                          : "—"}
                      </div>
                    </td>
                    <td className="px-3 py-1.5 text-center hidden sm:table-cell">
                      <span
                        className="bg-[var(--el-surface-container-high)] text-[var(--el-text)] border border-[var(--el-line)] px-2 py-0.5 rounded text-[10px]"
                      >
                        {voter.tribeName !== "غير محدد"
                          ? voter.tribeName
                          : voter.district}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 text-center">
                      <button className="text-[var(--el-text)] border border-[var(--el-line)] px-2.5 py-1 rounded text-[11px] flex items-center gap-1 w-full justify-center hover:bg-[var(--el-surface-container)] hover:border-[var(--el-primary)] transition-all cursor-pointer">
                        <Phone className="w-3 h-3" />
                        اتصل
                      </button>
                    </td>
                  </tr>
                ))}
                {voters.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-8 text-center text-[var(--el-muted)] text-sm"
                    >
                      <Users className="w-7 h-7 mx-auto mb-2 opacity-50" />
                      لا توجد أهداف عالية القيمة
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* العمود الأيمن */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-3">
          {/* تصدّر الأقضية */}
          <div className="rounded-lg bg-[var(--el-surface)] border border-[var(--el-line)] overflow-hidden">
            <div className="px-4 py-2.5 flex justify-between items-center bg-[var(--el-surface-container)] border-b border-[var(--el-line)]">
              <h3 className="text-sm font-semibold text-[var(--el-text)] flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[var(--el-secondary)]" />
                تصدّر الأقضية
              </h3>
              <span className="text-[10.5px] text-[var(--el-muted)] tnum">
                {sortedDistricts.length} قضاء
              </span>
            </div>
            <div className="p-2 space-y-1 max-h-[180px] overflow-y-auto custom-scroll">
              {sortedDistricts.slice(0, 10).map((ds, index) => {
                const pct = Math.round((ds.count / maxCount) * 100);
                const isLow = ds.count < 3;
                const color =
                  index === 0
                    ? "var(--el-secondary)"
                    : isLow
                    ? "var(--el-alert)"
                    : "var(--el-text)";
                return (
                  <div
                    key={ds.district}
                    className="p-1.5 rounded flex items-center justify-between"
                    style={{
                      border: `1px solid ${isLow ? "rgba(229,72,77,0.25)" : "var(--el-line)"}`,
                      backgroundColor: isLow
                        ? "rgba(229,72,77,0.06)"
                        : "transparent",
                    }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="text-[11px] font-bold w-5 text-center tnum"
                        style={{ color }}
                      >
                        {index + 1}
                      </span>
                      <span
                        className="text-[12px] font-semibold truncate"
                        style={{ color }}
                      >
                        {ds.district}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-16 h-1.5 rounded-full overflow-hidden bg-[var(--el-surface-container)]">
                        <div
                          className="h-full"
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </div>
                      <span
                        className="text-[11px] font-medium tnum w-6 text-left"
                        style={{ color }}
                      >
                        {ds.count}
                      </span>
                    </div>
                  </div>
                );
              })}
              {sortedDistricts.length === 0 && (
                <div className="p-3 text-center text-[var(--el-muted)] text-xs">
                  لا توجد بيانات أقضية
                </div>
              )}
            </div>
          </div>

          {/* التنبيهات المباشرة */}
          <div className="rounded-lg bg-[var(--el-surface)] border border-[rgba(242,160,36,0.3)] overflow-hidden flex flex-col">
            <div className="px-4 py-2.5 flex justify-between items-center bg-[rgba(242,160,36,0.08)] border-b border-[rgba(242,160,36,0.2)]">
              <h3 className="text-sm font-semibold text-[var(--el-primary)] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                التنبيهات المباشرة
              </h3>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-alert-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-[var(--el-primary)]" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--el-primary)]" />
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-1.5 space-y-1 max-h-[180px] custom-scroll">
              {alerts.map((alert) => {
                const isCritical = alert.type === "CRITICAL";
                const isWarning = alert.type === "WARNING";
                const color = isCritical
                  ? "var(--el-alert)"
                  : isWarning
                  ? "var(--el-primary)"
                  : "var(--el-secondary)";
                const Icon = isCritical
                  ? AlertTriangle
                  : isWarning
                  ? AlertCircle
                  : ShieldCheck;

                return (
                  <div
                    key={alert.id}
                    className="p-1.5 rounded flex gap-2 items-start bg-[var(--el-bg)]"
                    style={{ borderRight: `2px solid ${color}` }}
                  >
                    <Icon
                      className="w-3 h-3 shrink-0 mt-0.5"
                      style={{ color }}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10.5px] font-medium text-[var(--el-text)] block leading-tight">
                        {alert.title}
                      </span>
                      <span className="text-[9.5px] text-[var(--el-muted)] leading-tight">
                        {alert.description}
                      </span>
                    </div>
                  </div>
                );
              })}
              {alerts.length === 0 && (
                <div className="p-3 text-center text-[var(--el-muted)] text-xs flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[var(--el-secondary)]" />
                  لا توجد تنبيهات — الوضع مستقر
                </div>
              )}
            </div>
          </div>
        </div>

        {/* شريط مؤشرات سفلي */}
        <div className="col-span-12 grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
          <MetricPill
            icon={<Users className="w-3.5 h-3.5" />}
            label="إجمالي الناخبين"
            value={stats?.totalVoters ?? 0}
            color="var(--el-text)"
          />
          <MetricPill
            icon={<Activity className="w-3.5 h-3.5" />}
            label="صوّتوا"
            value={stats?.checkedInCount ?? 0}
            color="var(--el-secondary)"
          />
          <MetricPill
            icon={<BarChart3 className="w-3.5 h-3.5" />}
            label="نسبة الاقتراع"
            value={`${votedPercentage}%`}
            color="var(--el-primary)"
          />
          <MetricPill
            icon={<AlertTriangle className="w-3.5 h-3.5" />}
            label="تنبيهات نشطة"
            value={alerts.length}
            color={alerts.length > 0 ? "var(--el-alert)" : "var(--el-secondary)"}
          />
        </div>
      </div>
    </div>
  );
}

function MetricPill({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="rounded-lg bg-[var(--el-surface)] border border-[var(--el-line)] p-2.5 flex items-center gap-2.5">
      <span
        className="inline-flex items-center justify-center w-8 h-8 rounded-md shrink-0"
        style={{ backgroundColor: `rgba(${color === "var(--el-primary)" ? "242,160,36" : color === "var(--el-secondary)" ? "45,212,191" : color === "var(--el-alert)" ? "229,72,77" : "138,153,180"},0.12)`, color }}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[9.5px] text-[var(--el-muted)] truncate">{label}</p>
        <p className="text-base font-bold tnum" style={{ color }}>
          {typeof value === "number" ? value.toLocaleString("ar-IQ") : value}
        </p>
      </div>
    </div>
  );
}
