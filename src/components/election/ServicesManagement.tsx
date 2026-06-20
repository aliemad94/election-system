"use client";

// ====================================================================
// ServicesManagement — إدارة الخدمات الميدانية
// ====================================================================

import { useEffect, useState, useCallback } from "react";
import {
  Wrench,
  Plus,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  Loader,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  SERVICE_CATEGORIES,
  SERVICE_STATUSES,
  SERVICE_PRIORITIES,
} from "@/lib/types";

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  cost: number;
  estimatedVotesImpact: number;
  assignedTo: string;
  keyCode: string;
  voterName: string;
  createdAt: string;
}

const emptyForm = {
  title: "",
  description: "",
  category: "أخرى",
  priority: "NORMAL",
  cost: 0,
  estimatedVotesImpact: 0,
  assignedTo: "",
};

const STATUS_META: Record<
  string,
  { label: string; icon: React.ReactNode; class: string }
> = {
  PENDING: {
    label: "بانتظار",
    icon: <Clock className="w-3 h-3" />,
    class: "bg-yellow-100 text-yellow-700",
  },
  IN_PROGRESS: {
    label: "قيد التنفيذ",
    icon: <Loader className="w-3 h-3" />,
    class: "bg-blue-100 text-blue-700",
  },
  COMPLETED: {
    label: "منجزة",
    icon: <CheckCircle2 className="w-3 h-3" />,
    class: "bg-emerald-100 text-emerald-700",
  },
  CANCELLED: {
    label: "ملغاة",
    icon: <XCircle className="w-3 h-3" />,
    class: "bg-red-100 text-red-700",
  },
};

const PRIORITY_META: Record<string, { label: string; class: string }> = {
  URGENT: { label: "عاجل", class: "bg-red-100 text-red-700" },
  HIGH: { label: "عالي", class: "bg-orange-100 text-orange-700" },
  NORMAL: { label: "عادي", class: "bg-[var(--el-surface-container-high)] text-[var(--el-on-surface-variant)]" },
  LOW: { label: "منخفض", class: "bg-[var(--el-surface-container)] text-[var(--el-on-surface-variant)]" },
};

export default function ServicesManagement() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/services${statusFilter !== "all" ? `?status=${statusFilter}` : ""}`
      );
      if (res.ok) setServices(await res.json());
    } catch {
      toast.error("تعذر تحميل الخدمات");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("عنوان الخدمة مطلوب");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("تم إنشاء الخدمة");
        setDialogOpen(false);
        setForm(emptyForm);
        load();
      } else {
        toast.error(data.error || "فشل الإنشاء");
      }
    } catch {
      toast.error("تعذر الاتصال بالخادم");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        toast.success("تم تحديث الحالة");
        load();
      } else {
        toast.error("فشل التحديث");
      }
    } catch {
      toast.error("تعذر الاتصال بالخادم");
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto">
      {/* الرأس */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--el-on-surface)]">
            الخدمات الميدانية
          </h2>
          <p className="text-sm text-[var(--el-on-surface-variant)] mt-1">
            {services.length} خدمة — تتبع الطلبات الخدمية وتأثيرها الانتخابي
          </p>
        </div>
        <Button
          onClick={() => {
            setForm(emptyForm);
            setDialogOpen(true);
          }}
          className="shrink-0"
        >
          <Plus className="w-4 h-4 ml-1" />
          خدمة جديدة
        </Button>
      </div>

      {/* فلتر الحالة */}
      <div className="flex gap-2 flex-wrap">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="كل الحالات" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الحالات</SelectItem>
            {SERVICE_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_META[s]?.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* الجدول */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-[var(--el-primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : services.length === 0 ? (
            <div className="py-12 text-center text-[var(--el-on-surface-variant)]">
              <Wrench className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>لا توجد خدمات مسجّلة</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-[var(--el-surface-container-low)] z-10">
                  <TableRow>
                    <TableHead>العنوان</TableHead>
                    <TableHead className="hidden md:table-cell">
                      التصنيف
                    </TableHead>
                    <TableHead className="text-center">الأولوية</TableHead>
                    <TableHead className="text-center">الحالة</TableHead>
                    <TableHead className="hidden lg:table-cell text-center">
                      التأثير
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      التكلفة
                    </TableHead>
                    <TableHead className="text-center">تحديث</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((s) => (
                    <TableRow
                      key={s.id}
                      className="hover:bg-[var(--el-surface-container-low)]"
                    >
                      <TableCell>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">
                            {s.title}
                          </p>
                          {s.description && (
                            <p className="text-xs text-[var(--el-on-surface-variant)] truncate max-w-xs">
                              {s.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs">
                        {s.category}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${PRIORITY_META[s.priority]?.class}`}
                        >
                          {PRIORITY_META[s.priority]?.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${STATUS_META[s.status]?.class}`}
                        >
                          {STATUS_META[s.status]?.icon}
                          {STATUS_META[s.status]?.label}
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-center text-xs">
                        {s.estimatedVotesImpact} صوت
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs">
                        {s.cost > 0 ? `${s.cost.toLocaleString()} د.ع` : "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Select
                          value={s.status}
                          onValueChange={(v) => handleStatusChange(s.id, v)}
                        >
                          <SelectTrigger className="h-7 w-32 text-xs mx-auto">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SERVICE_STATUSES.map((st) => (
                              <SelectItem key={st} value={st}>
                                {STATUS_META[st]?.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* نافذة الإنشاء */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>خدمة جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>العنوان *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="مثال: معالجة طلب رصف شارع"
              />
            </div>
            <div className="space-y-2">
              <Label>الوصف</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>التصنيف</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>الأولوية</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => setForm({ ...form, priority: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {PRIORITY_META[p]?.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>التكلفة (د.ع)</Label>
                <Input
                  type="number"
                  value={form.cost}
                  onChange={(e) =>
                    setForm({ ...form, cost: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>التأثير الانتخابي (أصوات)</Label>
                <Input
                  type="number"
                  value={form.estimatedVotesImpact}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      estimatedVotesImpact: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "جاري الحفظ..." : "إنشاء"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

