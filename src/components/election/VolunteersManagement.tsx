"use client";

// ====================================================================
// VolunteersManagement — إدارة المتطوعين (Command Deck)
// ====================================================================

import { useEffect, useState, useCallback, useRef } from "react";
import { UserPlus, Search, Users, Award, CheckCircle2, Trash2, X, Edit2 } from "lucide-react";
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
import { useToast } from "@/components/election/toastprovider";
import { DHIQAR_DISTRICTS } from "@/lib/types";
import { canEdit, canDelete, canBulkAction, type Role } from "@/lib/permissions";
import { useUndoableDelete } from "@/hooks/useUndoableDelete";

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

interface VolunteersManagementProps {
  role?: Role;
}

export default function VolunteersManagement({ role = "OBSERVER" }: VolunteersManagementProps) {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // UX states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingCell, setEditingCell] = useState<{ id: string; field: "fullName" | "phone" } | null>(null);
  const [editValue, setEditValue] = useState("");
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/volunteers");
      if (res.ok) setVolunteers(await res.json());
    } catch {
      toast("تعذر تحميل المتطوعين", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Hook-based Multi-Timer Undo Delete
  const onConfirmDelete = useCallback(async (item: Volunteer) => {
    const res = await fetch(`/api/volunteers/${item.id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Delete failed");
  }, []);

  const onRestore = useCallback((item: Volunteer) => {
    setVolunteers(prev => {
      if (prev.some(v => v.id === item.id)) return prev;
      return [item, ...prev];
    });
  }, []);

  const onDeleteFailed = useCallback((item: Volunteer, _error: unknown) => {
    onRestore(item);
    toast(`فشل حذف المتطوع ${item.fullName} — تحقق من الاتصال وحاول مجدداً`, "error");
  }, [onRestore, toast]);

  const { requestDelete, undoDelete } = useUndoableDelete<Volunteer>(
    onConfirmDelete,
    onRestore,
    onDeleteFailed,
    5000
  );

  useEffect(() => {
    load();
  }, [load]);

  const filtered = volunteers.filter(
    (v) => v.fullName.includes(search) || v.phone.includes(search)
  );

  const handleSave = async () => {
    if (!form.fullName.trim() || !form.phone.trim()) {
      toast("الاسم والهاتف مطلوبان", "warning");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/volunteers", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast("تم إنشاء المتطوع بنجاح", "success");
        setDialogOpen(false);
        setForm(emptyForm);
        load();
      } else {
        toast(data.error || "فشل الإنشاء", "error");
      }
    } catch {
      toast("تعذر الاتصال بالخادم", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveInline = async (id: string, field: "fullName" | "phone") => {
    const val = editValue.trim();
    if (!val) {
      toast("الحقل لا يمكن أن يكون فارغاً", "error");
      setEditingCell(null);
      return;
    }

    const vol = volunteers.find(v => v.id === id);
    if (vol && vol[field] === val) {
      setEditingCell(null);
      return;
    }

    // Optimistically update locally
    setVolunteers(prev => prev.map(v => v.id === id ? { ...v, [field]: val } : v));
    setEditingCell(null);

    try {
      const res = await fetch(`/api/volunteers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: val }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast(data.error || "فشل التحديث", "error");
        load();
      } else {
        toast("تم تحديث البيانات بنجاح", "success");
      }
    } catch {
      toast("تعذر حفظ التعديل على الخادم", "error");
      load();
    }
  };

  const handleDelete = (volunteer: Volunteer) => {
    // Remove from UI optimistically
    setVolunteers(prev => prev.filter(v => v.id !== volunteer.id));
    setSelectedIds(prev => prev.filter(item => item !== volunteer.id));

    // Request delete via hook
    requestDelete(volunteer);

    toast(
      `تم حذف المتطوع ${volunteer.fullName}.`,
      "success",
      {
        label: "تراجع",
        onClick: () => {
          undoDelete(volunteer.id);
        }
      },
      5000,
      `delete-${volunteer.id}`
    );
  };

  const handleBulkDelete = () => {
    const idsToProcess = [...selectedIds];
    const volunteersToProcess = volunteers.filter(v => idsToProcess.includes(v.id));

    setSelectedIds([]);

    // Remove from UI optimistically
    setVolunteers(prev => prev.filter(v => !idsToProcess.includes(v.id)));

    // Request delete for each volunteer
    volunteersToProcess.forEach(v => requestDelete(v));

    const bulkToastId = `bulk-delete-${Math.random()}`;

    toast(
      `تم حذف ${idsToProcess.length} متطوعين.`,
      "success",
      {
        label: "تراجع",
        onClick: () => {
          idsToProcess.forEach(id => undoDelete(id));
        }
      },
      5000,
      bulkToastId
    );
  };

  const handleClearSearch = () => {
    setSearch("");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <div className="p-4 sm:p-5 space-y-4 max-w-7xl mx-auto pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[var(--el-text)]">المتطوعون</h2>
          <p className="text-[11px] text-[var(--el-muted)] mt-0.5">
            {volunteers.length} متطوع — الكوادر الميدانية وكفاءتها {canEdit(role) && "(انقر مزدوجاً أو اضغط على ✏️ للتعديل)"}
          </p>
        </div>
        {canEdit(role) && (
          <Button onClick={() => { setForm(emptyForm); setDialogOpen(true); }} size="sm" className="h-8">
            <UserPlus className="w-3.5 h-3.5 ml-1" /> متطوع جديد
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <MiniStat icon={<Users className="w-3.5 h-3.5" />} label="الإجمالي" value={volunteers.length} color="var(--el-primary)" />
        <MiniStat icon={<Award className="w-3.5 h-3.5" />} label="متوسط الكفاءة" value={`${Math.round(volunteers.reduce((s, v) => s + v.efficiencyScore, 0) / Math.max(1, volunteers.length))}%`} color="var(--el-secondary)" />
        <MiniStat icon={<CheckCircle2 className="w-3.5 h-3.5" />} label="مهام مكتملة" value={volunteers.reduce((s, v) => s + v.totalCompletedTasks, 0)} color="var(--el-secondary)" />
        <MiniStat icon={<Users className="w-3.5 h-3.5" />} label="مهام معيّنة" value={volunteers.reduce((s, v) => s + v.totalAssignedTasks, 0)} color="var(--el-text)" />
      </div>

      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--el-muted)]" />
        <Input
          ref={searchInputRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث بالاسم أو الهاتف..."
          className="pr-9 pl-8 h-8 text-xs bg-[var(--el-surface-container)] border-[var(--el-line)]"
        />
        {search && (
          <button
            onClick={handleClearSearch}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--el-muted)] hover:text-[var(--el-text)] p-0.5 rounded-full hover:bg-[var(--el-surface-variant)] cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
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
                    {canBulkAction(role) && (
                      <TableHead className="w-10 text-center">
                        <div className="flex items-center gap-1.5 justify-center">
                          <input
                            type="checkbox"
                            checked={filtered.length > 0 && filtered.every(v => selectedIds.includes(v.id))}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedIds(prev => {
                                  const newIds = [...prev];
                                  filtered.forEach(v => {
                                    if (!newIds.includes(v.id)) newIds.push(v.id);
                                  });
                                  return newIds;
                                });
                              } else {
                                setSelectedIds(prev => prev.filter(id => !filtered.some(v => v.id === id)));
                              }
                            }}
                            className="rounded border-[var(--el-line)] bg-[var(--el-surface)] text-[var(--el-primary)] focus:ring-[var(--el-primary)] w-3.5 h-3.5 cursor-pointer"
                          />
                          <span className="text-[10px] text-[var(--el-muted)] hidden lg:inline select-none whitespace-nowrap">تحديد الكل (الصفحة الحالية)</span>
                        </div>
                      </TableHead>
                    )}
                    <TableHead className="text-[10.5px] text-[var(--el-muted)]">الاسم</TableHead>
                    <TableHead className="text-[10.5px] text-[var(--el-muted)] hidden sm:table-cell">الهاتف</TableHead>
                    <TableHead className="text-[10.5px] text-[var(--el-muted)]">الدور</TableHead>
                    <TableHead className="text-[10.5px] text-[var(--el-muted)] hidden md:table-cell">القضاء</TableHead>
                    <TableHead className="text-[10.5px] text-center text-[var(--el-muted)]">الكفاءة</TableHead>
                    <TableHead className="text-[10.5px] text-center text-[var(--el-muted)]">الإنجاز</TableHead>
                    {canDelete(role) && (
                      <TableHead className="text-[10.5px] text-center text-[var(--el-muted)] w-16">إجراءات</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((v) => (
                    <TableRow key={v.id} className="border-[var(--el-line)] hover:bg-[var(--el-surface-container)] group">
                      {canBulkAction(role) && (
                        <TableCell className="py-2 text-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(v.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedIds(prev => [...prev, v.id]);
                              } else {
                                setSelectedIds(prev => prev.filter(id => id !== v.id));
                              }
                            }}
                            className="rounded border-[var(--el-line)] bg-[var(--el-surface)] text-[var(--el-primary)] focus:ring-[var(--el-primary)] w-3.5 h-3.5 cursor-pointer"
                          />
                        </TableCell>
                      )}
                      <TableCell className="text-xs font-medium text-[var(--el-text)] py-2 select-none">
                        {editingCell?.id === v.id && editingCell?.field === "fullName" ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => handleSaveInline(v.id, "fullName")}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveInline(v.id, "fullName");
                              if (e.key === "Escape") setEditingCell(null);
                            }}
                            className="bg-[var(--el-surface-container-high)] border border-[var(--el-primary)] text-[var(--el-text)] text-xs rounded px-1.5 py-0.5 w-full focus:outline-none"
                            autoFocus
                          />
                        ) : (
                          <div
                            onDoubleClick={() => {
                              if (!canEdit(role)) return;
                              setEditingCell({ id: v.id, field: "fullName" });
                              setEditValue(v.fullName);
                            }}
                            className="flex items-center gap-1 cursor-pointer hover:bg-[var(--el-surface-container-high)] px-1 py-0.5 rounded transition-colors"
                            title={canEdit(role) ? "نقر مزدوج للتعديل" : ""}
                          >
                            <span className="truncate">{v.fullName}</span>
                            {canEdit(role) && (
                              <Edit2
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingCell({ id: v.id, field: "fullName" });
                                  setEditValue(v.fullName);
                                }}
                                className="w-3 h-3 text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-[var(--el-primary)] transition-all shrink-0 ml-1.5 cursor-pointer"
                              />
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-[var(--el-muted)] py-2 hidden sm:table-cell tnum select-none" dir="ltr">
                        {editingCell?.id === v.id && editingCell?.field === "phone" ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => handleSaveInline(v.id, "phone")}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveInline(v.id, "phone");
                              if (e.key === "Escape") setEditingCell(null);
                            }}
                            className="bg-[var(--el-surface-container-high)] border border-[var(--el-primary)] text-[var(--el-text)] text-xs rounded px-1.5 py-0.5 w-full focus:outline-none text-right"
                            autoFocus
                          />
                        ) : (
                          <div
                            onDoubleClick={() => {
                              if (!canEdit(role)) return;
                              setEditingCell({ id: v.id, field: "phone" });
                              setEditValue(v.phone);
                            }}
                            className="flex items-center justify-end gap-1 cursor-pointer hover:bg-[var(--el-surface-container-high)] px-1 py-0.5 rounded transition-colors text-right sm:text-left"
                            title={canEdit(role) ? "نقر مزدوج للتعديل" : ""}
                          >
                            <span className="truncate">{v.phone}</span>
                            {canEdit(role) && (
                              <Edit2
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingCell({ id: v.id, field: "phone" });
                                  setEditValue(v.phone);
                                }}
                                className="w-3 h-3 text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-[var(--el-primary)] transition-all shrink-0 ml-1.5 cursor-pointer"
                              />
                            )}
                          </div>
                        )}
                      </TableCell>
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
                      {canDelete(role) && (
                        <TableCell className="text-center py-2">
                          <button
                            onClick={() => handleDelete(v)}
                            className="p-1 text-[var(--el-muted)] hover:text-[var(--el-alert)] transition-colors rounded hover:bg-red-500/10 cursor-pointer"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk actions secondary helper link when filtered is larger */}
      {selectedIds.length > 0 && selectedIds.length < filtered.length && canBulkAction(role) && (
        <div className="text-center text-xs text-[var(--el-muted)] select-none">
          تم تحديد {selectedIds.length} من أصل {filtered.length} نتائج مطابقة.{" "}
          <button
            onClick={() => setSelectedIds(filtered.map(v => v.id))}
            className="text-[var(--el-primary)] hover:underline font-semibold cursor-pointer"
          >
            تحديد كل النتائج المطابقة ({filtered.length})
          </button>
        </div>
      )}

      {/* Floating Toolbar for Bulk Operations */}
      {selectedIds.length > 0 && canBulkAction(role) && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[var(--el-surface-container)] border border-[var(--el-line)] shadow-2xl rounded-lg px-4 py-3 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <span className="text-xs text-[var(--el-text)] font-medium">
            تم تحديد <strong className="text-[var(--el-primary)] font-bold tnum">{selectedIds.length}</strong> كوادر
          </span>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              className="h-8 text-xs bg-[var(--el-error)] text-white hover:opacity-90 active:scale-95 transition-all"
              onClick={handleBulkDelete}
            >
              حذف المحدّد
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs text-[var(--el-text)] border-[var(--el-line)] hover:bg-[var(--el-surface)]"
              onClick={() => setSelectedIds([])}
            >
              إلغاء التحديد
            </Button>
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md bg-[var(--el-surface)] border-[var(--el-line)]">
          <DialogHeader><DialogTitle className="text-sm text-[var(--el-text)]">متطوع جديد</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-[var(--el-text)]">الاسم الكامل *</Label>
              <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="h-8 text-xs bg-[var(--el-surface-container)] border-[var(--el-line)]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-[var(--el-text)]">الهاتف *</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} dir="ltr" className="h-8 text-xs bg-[var(--el-surface-container)] border-[var(--el-line)]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-[var(--el-text)]">الدور</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                  <SelectTrigger className="h-8 text-xs bg-[var(--el-surface-container)] border-[var(--el-line)]"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[var(--el-surface)] border-[var(--el-line)]">{VOLUNTEER_ROLES.map((r) => <SelectItem key={r} value={r} className="text-xs">{ROLE_LABELS[r]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-[var(--el-text)]">القضاء</Label>
                <Select value={form.district || "none"} onValueChange={(v) => setForm({ ...form, district: v === "none" ? "" : v })}>
                  <SelectTrigger className="h-8 text-xs bg-[var(--el-surface-container)] border-[var(--el-line)]"><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent className="bg-[var(--el-surface)] border-[var(--el-line)]">
                    <SelectItem value="none" className="text-xs">—</SelectItem>
                    {DHIQAR_DISTRICTS.map((d) => <SelectItem key={d} value={d} className="text-xs">{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-[var(--el-text)]">المنطقة</Label>
                <Input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className="h-8 text-xs bg-[var(--el-surface-container)] border-[var(--el-line)]" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-[var(--el-text)]">ملاحظات</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="text-xs bg-[var(--el-surface-container)] border-[var(--el-line)]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)} className="text-[var(--el-text)] border-[var(--el-line)]">إلغاء</Button>
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



