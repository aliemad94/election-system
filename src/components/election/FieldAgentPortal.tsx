"use client";

// ====================================================================
// FieldAgentPortal — بوابة الوكلاء الميدانيين
// ====================================================================

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Vote,
  CheckCircle2,
  MapPin,
  Smartphone,
  UserCheck,
  Loader2,
  Filter,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { DHIQAR_DISTRICTS } from "@/lib/types";

interface Voter {
  id: string;
  fullName: string;
  phone: string;
  district: string;
  pollingCenter: string;
  status: string;
  supportDegree: number;
  votedOnDay: boolean;
  tribeName: string;
}

export default function FieldAgentPortal() {
  const [voters, setVoters] = useState<Voter[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("all");
  const [checkinLoading, setCheckinLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: "1",
        limit: "30",
        search,
        district,
        votedStatus: "not_voted",
      });
      const res = await fetch(`/api/voters?${params}`);
      if (res.ok) {
        const data = await res.json();
        setVoters(data.voters || []);
        setTotal(data.total || 0);
      }
    } catch {
      toast.error("تعذر تحميل البيانات");
    } finally {
      setLoading(false);
    }
  }, [search, district]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const handleCheckin = async (voterId: string, name: string) => {
    setCheckinLoading(voterId);
    try {
      const res = await fetch("/api/voters/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voterId }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.status === "checked_in") {
          toast.success(`تم تسجيل حضور ${name}`);
        } else {
          toast.info(`${name} سبق تسجيله`);
        }
        setVoters((prev) =>
          prev.map((v) =>
            v.id === voterId ? { ...v, votedOnDay: true } : v
          )
        );
      } else {
        toast.error(data.error || "فشل");
      }
    } catch {
      toast.error("تعذر الاتصال");
    } finally {
      setCheckinLoading(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto">
      {/* الرأس */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--el-on-surface)]">
          بوابة الوكلاء الميدانيين
        </h2>
        <p className="text-sm text-[var(--el-on-surface-variant)] mt-1">
          {total} ناخب بانتظار التصويت — تسجيل حضور سريع وموثوق
        </p>
      </div>

      {/* بطاقات إحصائية سريعة */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <QuickStat
          icon={<UserCheck className="w-5 h-5" />}
          label="بانتظار التصويت"
          value={total}
          tone="amber"
        />
        <QuickStat
          icon={<CheckCircle2 className="w-5 h-5" />}
          label="تم تسجيلهم"
          value={voters.filter((v) => v.votedOnDay).length}
          tone="emerald"
        />
        <QuickStat
          icon={<Vote className="w-5 h-5" />}
          label="داعمون متبقّون"
          value={voters.filter((v) => v.status === "SUPPORTED").length}
          tone="primary"
        />
        <QuickStat
          icon={<MapPin className="w-5 h-5" />}
          label="أقضية نشطة"
          value={new Set(voters.map((v) => v.district)).size}
          tone="info"
        />
      </div>

      {/* الفلاتر */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--el-on-surface-variant)]" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="بحث بالاسم أو الهاتف..."
                className="pr-10"
              />
            </div>
            <Select value={district} onValueChange={setDistrict}>
              <SelectTrigger>
                <Filter className="w-4 h-4 ml-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الأقضية</SelectItem>
                {DHIQAR_DISTRICTS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* جدول الناخبين */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[var(--el-primary)]" />
            قائمة الناخبين — تسجيل حضور سريع
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-[var(--el-primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : voters.length === 0 ? (
            <div className="py-12 text-center text-[var(--el-on-surface-variant)]">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-400 opacity-60" />
              <p>لا يوجد ناخبون بانتظار التصويت</p>
              <p className="text-xs mt-1">جميع الناخبين صوّتوا أو لا توجد بيانات</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-[var(--el-surface-container-low)] z-10">
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      الهاتف
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      القضاء
                    </TableHead>
                    <TableHead className="text-center">الحالة</TableHead>
                    <TableHead className="text-center">الثقة</TableHead>
                    <TableHead className="text-center">إجراء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {voters.map((v) => (
                    <TableRow
                      key={v.id}
                      className="hover:bg-[var(--el-surface-container-low)]"
                    >
                      <TableCell className="font-medium">
                        {v.fullName}
                      </TableCell>
                      <TableCell
                        className="hidden sm:table-cell text-xs font-mono"
                        dir="ltr"
                      >
                        {v.phone || "—"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs">
                        {v.district}
                      </TableCell>
                      <TableCell className="text-center">
                        <StatusBadge status={v.status} />
                      </TableCell>
                      <TableCell className="text-center text-xs font-medium">
                        {v.supportDegree}/5
                      </TableCell>
                      <TableCell className="text-center">
                        {v.votedOnDay ? (
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                            <CheckCircle2 className="w-3 h-3 ml-1" />
                            تم
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleCheckin(v.id, v.fullName)}
                            disabled={checkinLoading === v.id}
                            className="h-8"
                          >
                            {checkinLoading === v.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 ml-1" />
                                تسجيل حضور
                              </>
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; class: string }> = {
    SUPPORTED: {
      label: "داعم",
      class: "bg-emerald-100 text-emerald-700",
    },
    NEUTRAL: {
      label: "محايد",
      class: "bg-[var(--el-surface-container-high)] text-[var(--el-on-surface-variant)]",
    },
    WEAK: { label: "ضعيف", class: "bg-red-100 text-red-700" },
  };
  const s = map[status] || map.NEUTRAL;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${s.class}`}
    >
      {s.label}
    </span>
  );
}

function QuickStat({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: "primary" | "emerald" | "amber" | "info";
}) {
  const toneClasses = {
    primary: "bg-[var(--el-primary)]/10 text-[var(--el-primary)]",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    info: "bg-[var(--el-surface-container-high)] text-[var(--el-primary)]",
  }[tone];

  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <span
          className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${toneClasses}`}
        >
          {icon}
        </span>
        <div>
          <p className="text-xs text-[var(--el-on-surface-variant)]">{label}</p>
          <p className="text-xl font-bold text-[var(--el-on-surface)]">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

