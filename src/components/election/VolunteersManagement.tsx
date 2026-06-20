"use client";

// ====================================================================
// VolunteersManagement — إدارة المتطوعين (Command Deck)
// ====================================================================

import { useEffect, useState, useCallback } from "react";
import { UserPlus, Search, Users, Award, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { DHIQAR_DISTRICTS } from "@/lib/types";

interface Volunteer {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  role: string;
  district: string | null;
  area: string | null;
  notes: string | null;
  efficiencyScore: number;
  totalAssignedTasks: number;
  totalCompletedTasks: number;
  taskCount: number;
  completionRate: number;
}

const VOLUNTEER_ROLES = [
  "FIELD_AGENT", "LOGISTICS", "MEDIA", "COORDINATOR", "ELECTION_DAY_OBSERVER",
];

const ROLE_LABELS: Record<string, string> = {
  FIELD_AGENT: "وكيل ميداني",
  LOGISTICS: "لوجستيات",
  MEDIA: "إعلام",
  COORDINATOR: "منسّق",
  ELECTION_DAY_OBSERVER: "مراقب يوم الاقتراع",
};

const emptyForm = {
  fullName: "", phone: "", email: "", role: "FIELD_AGENT", district: "", area: "", notes: "",
};

export default function VolunteersManagement() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/volunteers");
      if (res.ok) setVolunteers(await res.json());
    } catch { toast.error("تعذر التحميل"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = volunteers.filter(
    (v) => v.fullName.includes(search) || v.phone.includes(search)
  );

  const handleSave = async () => {
    if (!form.fullName.trim() || !form.phone.trim()) {
      toast.error("الاسم والهاتف مطلوبان"); return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/volunteers", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("تم إنشاء المتطوع"); setDialogOpen(false);
        setForm(emptyForm); load();
      } else toast.error(data.error || "فشل");
    } catch { toast.error("تعذر الاتصال"); }
    finally { setSaving(false); }
  };

  return (
    <div className="p-4 sm:p-5 space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[var(--el-text)]">المتطوعون</h2>
          <p className="text-[11px] text-[var(--el-muted)] mt-0.5">
            {volunteers.length} متطوع — الكوادر الميدانية وكفاءتها
          </p>
        </div>
        <Button onClick={() => { setForm(emptyForm); setDialogOpen(true); }} size="sm" className="h-8">
          <UserPlus className="w-3.5 h-3.5 ml-1" /> متطوع جديد
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <MiniStat icon={<Users className="w-3.5 h-3.5" />} label="الإجمالي" value={volunteers.length} color="var(--el-primary)" />
        <MiniStat icon={<Award className="w-3.5 h-3.5" />} label="متوسط الكفاءة" value={`${Math.round(volunteers.reduce((s, v) => s + v.efficiencyScore, 0) / Math.max(1, volunteers.length))}%`} color="var(--el-secondary)" />
        <MiniStat icon={<CheckCircle2 className="w-3.5 h-3.5" />} label="مهام مكتملة" value={volunteers.reduce((s, v) => s + v.totalCompletedTasks, 0)} color="var(--el-secondary)" />
        <MiniStat icon={<Users className="w-3.5 h-3.5" />} label="مهام معيّنة" value={volunteers.reduce((s, v) => s + v.totalAssignedTasks, 0)} color="var(--el-text)" />
      </div>

      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--el-muted)]" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث بالاسم أو الهاتف..." className="pr-9 h-8 text-xs" />
      </div>

      <Card className="bg-[var(--el-surface)] border-[var(--el-line)]">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-7 h-7 border-[3px] border-[var(--el-primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-[var(--el-muted)]">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">لا يوجد متطوعون</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scroll">
              <Table>
                <TableHeader className="sticky top-0 bg-[var(--el-surface-container)] z-10">
                  <TableRow className="border-[var(--el-line)] hover:bg-transparent">
                    <TableHead className="text-[10.5px] text-[var(--el-muted)]">الاسم</TableHead>
                    <TableHead className="text-[10.5px] text-[var(--el-muted)] hidden sm:table-cell">الهاتف</TableHead>
                    <TableHead className="text-[10.5px] text-[var(--el-muted)]">الدور</TableHead>
                    <TableHead className="text-[10.5px] text-[var(--el-muted)] hidden md:table-cell">القضاء</TableHead>
                    <TableHead className="text-[10.5px] text-center text-[var(--el-muted)]">الكفاءة</TableHead>
                    <TableHead className="text-[10.5px] text-center text-[var(--el-muted)]">الإنجاز</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((v) => (
                    <TableRow key={v.id} className="border-[var(--el-line)] hover:bg-[var(--el-surface-container)]">
                      <TableCell className="text-xs font-medium text-[var(--el-text)] py-2">{v.fullName}</TableCell>
                      <TableCell className="text-xs text-[var(--el-muted)] py-2 hidden sm:table-cell tnum" dir="ltr">{v.phone}</TableCell>
                      <TableCell className="py-2">
                        <span className="chip chip-primary text-[10px]">{ROLE_LABELS[v.role] || v.role}</span>
                      </TableCell>
                      <TableCell className="text-xs text-[var(--el-muted)] py-2 hidden md:table-cell">{v.district || "—"}</TableCell>
                      <TableCell className="text-center py-2">
                        <span className={`tnum text-xs font-bold ${v.efficiencyScore >= 80 ? "text-[var(--el-secondary)]" : v.efficiencyScore >= 50 ? "text-[var(--el-primary)]" : "text-[var(--el-alert)]"}`}>
                          {v.efficiencyScore}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center py-2">
                        <span className="text-xs tnum text-[var(--el-text)]">{v.totalCompletedTasks}/{v.totalAssignedTasks}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="text-sm">متطوع جديد</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">الاسم الكامل *</Label>
              <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="h-8 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">الهاتف *</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} dir="ltr" className="h-8 text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">الدور</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{VOLUNTEER_ROLES.map((r) => <SelectItem key={r} value={r} className="text-xs">{ROLE_LABELS[r]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">القضاء</Label>
                <Select value={form.district || "none"} onValueChange={(v) => setForm({ ...form, district: v === "none" ? "" : v })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="text-xs">—</SelectItem>
                    {DHIQAR_DISTRICTS.map((d) => <SelectItem key={d} value={d} className="text-xs">{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">المنطقة</Label>
                <Input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className="h-8 text-xs" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">ملاحظات</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="text-xs" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>{saving ? "جاري..." : "إنشاء"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MiniStat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number | string; color: string }) {
  return (
    <Card className="bg-[var(--el-surface)] border-[var(--el-line)]">
      <CardContent className="p-2.5 flex items-center gap-2">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-md shrink-0" style={{ backgroundColor: `rgba(${color === "var(--el-primary)" ? "242,160,36" : color === "var(--el-secondary)" ? "45,212,191" : "138,153,180"},0.12)`, color }}>
          {icon}
        </span>
        <div><p className="text-[9.5px] text-[var(--el-muted)]">{label}</p><p className="text-sm font-bold tnum" style={{ color }}>{value}</p></div>
      </CardContent>
    </Card>
  );
}

