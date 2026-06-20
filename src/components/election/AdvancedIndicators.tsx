"use client";

// ====================================================================
// AdvancedIndicators — لوحة المؤشرات التحليلية الكاملة
// ====================================================================

import { useEffect, useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import {
  Cpu,
  TrendingUp,
  AlertTriangle,
  Map,
  Trophy,
  Activity,
  Users,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AreaMetrics {
  eiiScore: number;
  kriScore: number;
  vpsScore: number;
  drsScore: number;
  campaignROI: number;
  apiScore: number;
  ewliScore: number;
  gsiScore: number;
  edriScore: number;
  efiScore: number;
  totalKeysInArea: number;
  totalNetVotes: number;
  totalSupportedVotes: number;
  totalNeutralVotes: number;
  totalWeakVotes: number;
  totalVotersInArea: number;
  projectedSeats: number;
}

interface IndicatorsData {
  governorate: AreaMetrics & { id: string; name: string; calculatedAt: string };
  districts: (AreaMetrics & {
    id: string;
    name: string;
    district: string;
    calculatedAt: string;
  })[];
  lastCalculated: string;
  seatProjection: {
    governorate: { partyName: string; votes: number; seats: number }[];
    totalSeats: number;
  };
}

const EFI_COLOR = (score: number) => {
  if (score >= 75) return "#10b981"; // emerald
  if (score >= 60) return "#84cc16"; // lime
  if (score >= 45) return "#f59e0b"; // amber
  return "#ef4444"; // red
};

export default function AdvancedIndicators() {
  const [data, setData] = useState<IndicatorsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const res = await fetch("/api/indicators");
      if (res.ok) setData(await res.json());
    } catch {
      // تجاهل
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    load();
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[var(--el-primary)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[var(--el-on-surface-variant)]">
            جاري حساب المؤشرات المركّبة...
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center text-[var(--el-on-surface-variant)]">
        <Cpu className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p>تعذر تحميل المؤشرات</p>
        <Button onClick={handleRefresh} variant="outline" className="mt-3">
          <RefreshCw className="w-4 h-4 ml-1" />
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  const gov = data.governorate;

  // بيانات الرادار (8 مؤشرات)
  const radarData = [
    { metric: "EII", value: gov.eiiScore, fullMark: 100 },
    { metric: "KRI", value: gov.kriScore, fullMark: 100 },
    { metric: "VPS", value: gov.vpsScore, fullMark: 100 },
    { metric: "API", value: gov.apiScore, fullMark: 100 },
    { metric: "GSI", value: gov.gsiScore, fullMark: 100 },
    { metric: "EDRI", value: gov.edriScore, fullMark: 100 },
    { metric: "أمان", value: 100 - gov.drsScore, fullMark: 100 },
    { metric: "ثبات", value: 100 - gov.ewliScore, fullMark: 100 },
  ];

  // بيانات مقارنة الأقضية (EFI)
  const districtData = data.districts
    .slice(0, 10)
    .map((d) => ({
      name: d.name,
      EFI: d.efiScore,
      EII: d.eiiScore,
      KRI: d.kriScore,
      seats: d.projectedSeats,
    }));

  // بيانات توزيع المقاعد
  const seatData = data.seatProjection.governorate
    .filter((p) => p.seats > 0)
    .map((p, i) => ({
      name: p.partyName,
      seats: p.seats,
      votes: p.votes,
      fill: p.partyName === "حملتنا الانتخابية" ? "#031635" : "#fea619",
    }));

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* الرأس */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--el-on-surface)]">
            المؤشرات التحليلية المتقدمة
          </h2>
          <p className="text-sm text-[var(--el-on-surface-variant)] mt-1">
            محركات EII / KRI / EFI + توزيع المقاعد (Saint-Laguë)
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          disabled={refreshing}
        >
          <RefreshCw
            className={`w-4 h-4 ml-1 ${refreshing ? "animate-spin" : ""}`}
          />
          تحديث
        </Button>
      </div>

      {/* بطاقة EFI الرئيسية */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
            {/* EFI Gauge */}
            <div className="p-6 flex flex-col items-center justify-center border-l border-[var(--el-outline-variant)]">
              <p className="text-sm font-medium text-[var(--el-on-surface-variant)] mb-2">
                مؤشر التنبؤ الانتخابي
              </p>
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="var(--el-surface-container-high)"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke={EFI_COLOR(gov.efiScore)}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${(gov.efiScore / 100) * 264} 264`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    className="text-4xl font-bold"
                    style={{ color: EFI_COLOR(gov.efiScore) }}
                  >
                    {gov.efiScore}
                  </span>
                  <span className="text-xs text-[var(--el-on-surface-variant)]">
                    من 100
                  </span>
                </div>
              </div>
              <Badge
                className="mt-3"
                style={{
                  backgroundColor: `${EFI_COLOR(gov.efiScore)}20`,
                  color: EFI_COLOR(gov.efiScore),
                }}
              >
                {gov.efiScore >= 75
                  ? "وضع ممتاز"
                  : gov.efiScore >= 60
                  ? "وضع جيد"
                  : gov.efiScore >= 45
                  ? "وضع متوسط"
                  : "وضع حرج"}
              </Badge>
            </div>

            {/* المؤشرات السريعة */}
            <div className="p-6 grid grid-cols-2 gap-4 border-l border-[var(--el-outline-variant)]">
              <MiniMetric
                label="EII"
                sub="التأثير الانتخابي"
                value={gov.eiiScore}
              />
              <MiniMetric
                label="KRI"
                sub="موثوقية المفتاح"
                value={gov.kriScore}
              />
              <MiniMetric
                label="VPS"
                sub="احتمالية التصويت"
                value={gov.vpsScore}
              />
              <MiniMetric
                label="DRS"
                sub="خطر الانشقاق"
                value={gov.drsScore}
                inverted
              />
              <MiniMetric
                label="API"
                sub="اختراق المنطقة"
                value={gov.apiScore}
              />
              <MiniMetric
                label="EDRI"
                sub="جاهزية يوم الاقتراع"
                value={gov.edriScore}
              />
            </div>

            {/* المقاعد المتوقعة */}
            <div className="p-6 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-5 h-5 text-[var(--el-secondary)]" />
                <h3 className="font-bold text-[var(--el-on-surface)]">
                  المقاعد المتوقعة
                </h3>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-bold text-[var(--el-primary)]">
                  {gov.projectedSeats}
                </span>
                <span className="text-lg text-[var(--el-on-surface-variant)]">
                  / {data.seatProjection.totalSeats}
                </span>
              </div>
              <div className="flex gap-1 mb-4">
                {Array.from({ length: data.seatProjection.totalSeats }).map(
                  (_, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-2 rounded-sm ${
                        i < gov.projectedSeats
                          ? "bg-[var(--el-primary)]"
                          : "bg-[var(--el-surface-container-high)]"
                      }`}
                    />
                  )
                )}
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--el-on-surface-variant)]">
                    أصواتنا الصافية
                  </span>
                  <span className="font-bold text-[var(--el-on-surface)]">
                    {gov.totalNetVotes.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--el-on-surface-variant)]">
                    إجمالي المفاتيح
                  </span>
                  <span className="font-bold text-[var(--el-on-surface)]">
                    {gov.totalKeysInArea}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* رادار المؤشرات */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-[var(--el-primary)]" />
              خريطة المؤشرات (محافظة ذي قار)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--el-outline-variant)" />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fill: "var(--el-on-surface-variant)", fontSize: 12 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fill: "var(--el-on-surface-variant)", fontSize: 10 }}
                />
                <Radar
                  name="القيمة"
                  dataKey="value"
                  stroke="var(--el-primary)"
                  fill="var(--el-primary)"
                  fillOpacity={0.4}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--el-surface-container-lowest)",
                    border: "1px solid var(--el-outline-variant)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* توزيع المقاعد */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[var(--el-secondary)]" />
              توزيع المقاعد التشريعية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={seatData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, seats }) => `${name}: ${seats}`}
                  outerRadius={90}
                  dataKey="seats"
                >
                  {seatData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--el-surface-container-lowest)",
                    border: "1px solid var(--el-outline-variant)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* مقارنة الأقضية */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Map className="w-4 h-4 text-[var(--el-primary)]" />
            مقارنة المؤشرات حسب القضاء (EFI)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={districtData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--el-outline-variant)" />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fill: "var(--el-on-surface-variant)", fontSize: 11 }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={80}
                tick={{ fill: "var(--el-on-surface)", fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--el-surface-container-lowest)",
                  border: "1px solid var(--el-outline-variant)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="EFI" radius={[0, 4, 4, 0]}>
                {districtData.map((entry, index) => (
                  <Cell key={index} fill={EFI_COLOR(entry.EFI)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* جدول تفصيلي للأقضية */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[var(--el-primary)]" />
            التفصيل الكامل حسب القضاء
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-[var(--el-surface-container-low)] z-10">
                <TableRow>
                  <TableHead>القضاء</TableHead>
                  <TableHead className="text-center">EFI</TableHead>
                  <TableHead className="text-center">EII</TableHead>
                  <TableHead className="text-center">KRI</TableHead>
                  <TableHead className="text-center">VPS</TableHead>
                  <TableHead className="text-center">DRS</TableHead>
                  <TableHead className="text-center hidden md:table-cell">
                    API
                  </TableHead>
                  <TableHead className="text-center hidden md:table-cell">
                    EWLI
                  </TableHead>
                  <TableHead className="text-center">مقاعد</TableHead>
                  <TableHead className="text-center hidden lg:table-cell">
                    مفاتيح
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.districts.map((d) => (
                  <TableRow
                    key={d.id}
                    className="hover:bg-[var(--el-surface-container-low)]"
                  >
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        style={{
                          backgroundColor: `${EFI_COLOR(d.efiScore)}20`,
                          color: EFI_COLOR(d.efiScore),
                        }}
                      >
                        {d.efiScore}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-xs">
                      {d.eiiScore}
                    </TableCell>
                    <TableCell className="text-center text-xs">
                      {d.kriScore}
                    </TableCell>
                    <TableCell className="text-center text-xs">
                      {d.vpsScore}
                    </TableCell>
                    <TableCell className="text-center text-xs">
                      <span
                        className={
                          d.drsScore > 50 ? "text-red-600 font-bold" : ""
                        }
                      >
                        {d.drsScore}
                      </span>
                    </TableCell>
                    <TableCell className="text-center text-xs hidden md:table-cell">
                      {d.apiScore}
                    </TableCell>
                    <TableCell className="text-center text-xs hidden md:table-cell">
                      <span
                        className={
                          d.ewliScore > 50 ? "text-red-600 font-bold" : ""
                        }
                      >
                        {d.ewliScore}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className="font-bold border-[var(--el-primary)] text-[var(--el-primary)]"
                      >
                        {d.projectedSeats}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-xs hidden lg:table-cell">
                      {d.totalKeysInArea}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* تحذيرات مبكرة */}
      <EarlyWarnings data={data} />

      {/* توقيت آخر حساب */}
      <p className="text-xs text-center text-[var(--el-on-surface-variant)]">
        آخر حساب: {new Date(data.lastCalculated).toLocaleString("ar-IQ")}
      </p>
    </div>
  );
}

// ===== مكوّن مؤشر مصغّر =====
function MiniMetric({
  label,
  sub,
  value,
  inverted,
}: {
  label: string;
  sub: string;
  value: number;
  inverted?: boolean;
}) {
  const displayValue = inverted ? value : value;
  const good = inverted ? value < 40 : value >= 60;
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-xs font-bold text-[var(--el-on-surface-variant)]">
          {label}
        </span>
        <span
          className={`text-lg font-bold ${
            good
              ? "text-emerald-600"
              : inverted
              ? "text-red-600"
              : "text-amber-600"
          }`}
        >
          {displayValue}
        </span>
      </div>
      <Progress
        value={inverted ? 100 - value : value}
        className="h-1.5"
      />
      <p className="text-xs text-[var(--el-on-surface-variant)] mt-1">{sub}</p>
    </div>
  );
}

// ===== مكوّن التحذيرات المبكرة =====
function EarlyWarnings({ data }: { data: IndicatorsData }) {
  const warnings: { district: string; type: string; severity: string; value: number }[] = [];

  data.districts.forEach((d) => {
    if (d.drsScore > 55) {
      warnings.push({
        district: d.name,
        type: "خطر انشقاق عالٍ",
        severity: "حرج",
        value: d.drsScore,
      });
    }
    if (d.ewliScore > 55) {
      warnings.push({
        district: d.name,
        type: "إنذار فقدان أصوات",
        severity: "عالٍ",
        value: d.ewliScore,
      });
    }
    if (d.efiScore < 45) {
      warnings.push({
        district: d.name,
        type: "تنبؤ انتخابي ضعيف",
        severity: "متوسط",
        value: d.efiScore,
      });
    }
  });

  if (warnings.length === 0) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-3">
        <TrendingUp className="w-5 h-5 text-emerald-600 shrink-0" />
        <p className="text-sm text-emerald-700">
          لا توجد تحذيرات حرجة — الوضع الانتخابي مستقر في كل الأقضية.
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2 text-red-600">
          <AlertTriangle className="w-4 h-4" />
          التحذيرات المبكرة ({warnings.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 max-h-64 overflow-y-auto">
        {warnings.map((w, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-2 px-3 rounded-lg bg-red-50 border border-red-100"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-[var(--el-on-surface)]">
                  {w.district}
                </p>
                <p className="text-xs text-[var(--el-on-surface-variant)]">
                  {w.type}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={
                  w.severity === "حرج"
                    ? "border-red-500 text-red-600"
                    : w.severity === "عالٍ"
                    ? "border-orange-500 text-orange-600"
                    : "border-amber-500 text-amber-600"
                }
              >
                {w.severity}
              </Badge>
              <span className="text-sm font-bold text-red-600">{w.value}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

