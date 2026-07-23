"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  KeyRound,
  Loader2,
  LockKeyhole,
  Plus,
  ShieldCheck,
  UserRoundX,
} from "lucide-react";

type ManagedUser = {
  id: string;
  username: string;
  role: "ADMIN" | "KEY_USER" | "OBSERVER";
  isActive: boolean;
  mustChangePwd: boolean;
  electionKeyId: string | null;
  isCurrent: boolean;
  electionKey: {
    keyCode: string;
    firstName: string;
    fatherName: string;
  } | null;
};

type ElectionKeyOption = {
  id: string;
  keyCode: string;
  firstName: string;
  fatherName: string;
};

export default function UserManagementPanel() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [keys, setKeys] = useState<ElectionKeyOption[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<Record<string, string>>({});
  const [resetPasswords, setResetPasswords] = useState<Record<string, string>>(
    {}
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"KEY_USER" | "OBSERVER">("KEY_USER");
  const [electionKeyId, setElectionKeyId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const availableKeys = useMemo(() => {
    const linked = new Set(
      users
        .filter((user) => user.role === "KEY_USER" && user.electionKeyId)
        .map((user) => user.electionKeyId)
    );
    return keys.filter(
      (key) => !linked.has(key.id) || key.id === electionKeyId
    );
  }, [users, keys, electionKeyId]);

  async function load() {
    setLoading(true);
    setMessage(null);
    try {
      const [usersResponse, keysResponse] = await Promise.all([
        fetch("/api/users", { cache: "no-store" }),
        fetch("/api/electoral-keys", { cache: "no-store" }),
      ]);
      if (!usersResponse.ok || !keysResponse.ok) {
        throw new Error("تعذر تحميل الحسابات أو المفاتيح");
      }
      const usersData = await usersResponse.json();
      const keysData = await keysResponse.json();
      const nextUsers = (usersData.users || []) as ManagedUser[];
      setUsers(nextUsers);
      setKeys(Array.isArray(keysData) ? keysData : keysData.keys || []);
      setSelectedKeys(
        Object.fromEntries(
          nextUsers.map((user) => [user.id, user.electionKeyId || ""])
        )
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "تعذر تحميل إدارة الحسابات"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createUser() {
    if (!username || !password || (role === "KEY_USER" && !electionKeyId)) {
      setMessage("أكمل اسم المستخدم وكلمة المرور ونطاق المفتاح");
      return;
    }
    setSaving("create");
    setMessage(null);
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          role,
          electionKeyId: role === "KEY_USER" ? electionKeyId : null,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "فشل إنشاء الحساب");
      setUsername("");
      setPassword("");
      setElectionKeyId("");
      await load();
      setMessage("أُنشئ الحساب وسيُطلب منه تغيير كلمة المرور عند أول دخول");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "فشل إنشاء الحساب");
    } finally {
      setSaving(null);
    }
  }

  async function updateUser(
    id: string,
    changes: Record<string, string | boolean | null>
  ) {
    setSaving(id);
    setMessage(null);
    try {
      const response = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...changes }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "فشل تحديث الحساب");
      await load();
      setMessage("حُدث الحساب وأُبطلت جلساته السابقة");
      setResetPasswords((current) => ({ ...current, [id]: "" }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "فشل تحديث الحساب");
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-40 items-center justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" aria-label="جاري التحميل" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {message && (
        <div
          className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-foreground"
          role="status"
        >
          {message}
        </div>
      )}

      <section className="rounded-xl border border-border/50 bg-muted/40 p-4">
        <div className="mb-4 flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Plus className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold">إضافة حساب ميداني</h3>
            <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
              لكل مستخدم مفتاح نطاق واحد فقط. كلمة المرور مؤقتة وتتغير عند أول دخول.
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="اسم المستخدم بالإنجليزية"
            autoComplete="off"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/30"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="كلمة مرور مؤقتة قوية (12 محرفًا فأكثر)"
            autoComplete="new-password"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/30"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={role}
              onChange={(event) => {
                const nextRole = event.target.value as
                  | "KEY_USER"
                  | "OBSERVER";
                setRole(nextRole);
                if (nextRole === "OBSERVER") setElectionKeyId("");
              }}
              className="rounded-lg border border-border bg-background px-3 py-2 text-xs"
            >
              <option value="KEY_USER">مستخدم مفتاح</option>
              <option value="OBSERVER">مراقب إحصاءات</option>
            </select>
            <select
              value={electionKeyId}
              onChange={(event) => setElectionKeyId(event.target.value)}
              disabled={role !== "KEY_USER"}
              className="rounded-lg border border-border bg-background px-3 py-2 text-xs disabled:opacity-50"
            >
              <option value="">اختر المفتاح</option>
              {availableKeys.map((key) => (
                <option key={key.id} value={key.id}>
                  {key.keyCode} — {key.firstName} {key.fatherName}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={createUser}
            disabled={saving === "create"}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-xs font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          >
            {saving === "create" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
            إنشاء الحساب
          </button>
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-foreground">الحسابات الحالية</h3>
          <span className="text-[10px] tabular-nums text-muted-foreground">
            {users.length} حساب
          </span>
        </div>

        {users.map((managedUser) => {
          const isAdmin = managedUser.role === "ADMIN";
          const isBusy = saving === managedUser.id;
          return (
            <div
              key={managedUser.id}
              className={`rounded-xl border p-3 ${
                managedUser.isActive
                  ? "border-emerald-500/20 bg-emerald-500/[0.04]"
                  : "border-red-500/20 bg-red-500/[0.04]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-xs font-bold">
                      {managedUser.username}
                    </span>
                    <span className="rounded bg-background px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground">
                      {managedUser.role}
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {managedUser.electionKey
                      ? `${managedUser.electionKey.keyCode} — ${managedUser.electionKey.firstName} ${managedUser.electionKey.fatherName}`
                      : isAdmin
                        ? "صلاحية إدارية كاملة"
                        : managedUser.role === "OBSERVER"
                          ? "إحصاءات مجمعة فقط"
                          : "غير مرتبط بمفتاح — لا يمكن تفعيله"}
                  </p>
                </div>
                <div
                  className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                    managedUser.isActive ? "bg-emerald-500" : "bg-red-500"
                  }`}
                  title={managedUser.isActive ? "نشط" : "معطل"}
                />
              </div>

              {!isAdmin && (
                <div className="mt-3 space-y-2 border-t border-border/40 pt-3">
                  {managedUser.role === "KEY_USER" && (
                    <div className="flex gap-2">
                      <select
                        value={selectedKeys[managedUser.id] || ""}
                        onChange={(event) =>
                          setSelectedKeys((current) => ({
                            ...current,
                            [managedUser.id]: event.target.value,
                          }))
                        }
                        className="min-w-0 flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-[10px]"
                      >
                        <option value="">اختر نطاق المفتاح</option>
                        {keys.map((key) => (
                          <option key={key.id} value={key.id}>
                            {key.keyCode} — {key.firstName} {key.fatherName}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() =>
                          updateUser(managedUser.id, {
                            electionKeyId:
                              selectedKeys[managedUser.id] || null,
                            isActive: true,
                          })
                        }
                        disabled={!selectedKeys[managedUser.id] || isBusy}
                        className="rounded-md border border-primary/30 bg-primary/10 px-2.5 text-primary disabled:opacity-40"
                        title="حفظ النطاق وتفعيل الحساب"
                      >
                        <KeyRound className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      updateUser(managedUser.id, {
                        isActive: !managedUser.isActive,
                      })
                    }
                    disabled={
                      isBusy ||
                      (!managedUser.isActive &&
                        managedUser.role === "KEY_USER" &&
                        !managedUser.electionKeyId)
                    }
                    className={`flex w-full items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-[10px] font-bold disabled:opacity-40 ${
                      managedUser.isActive
                        ? "border-red-500/20 text-red-500"
                        : "border-emerald-500/20 text-emerald-600"
                    }`}
                  >
                    {isBusy ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : managedUser.isActive ? (
                      <UserRoundX className="h-3.5 w-3.5" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                    {managedUser.isActive ? "تعطيل الحساب" : "تفعيل الحساب"}
                  </button>
                </div>
              )}
              {!managedUser.isCurrent && (
                <div className="mt-2 flex gap-2 border-t border-border/40 pt-2">
                  <input
                    type="password"
                    value={resetPasswords[managedUser.id] || ""}
                    onChange={(event) =>
                      setResetPasswords((current) => ({
                        ...current,
                        [managedUser.id]: event.target.value,
                      }))
                    }
                    placeholder="كلمة مرور مؤقتة جديدة"
                    autoComplete="new-password"
                    className="min-w-0 flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-[10px]"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateUser(managedUser.id, {
                        newPassword: resetPasswords[managedUser.id] || "",
                      })
                    }
                    disabled={
                      isBusy || !(resetPasswords[managedUser.id] || "").trim()
                    }
                    className="rounded-md border border-primary/30 bg-primary/10 px-2.5 text-primary disabled:opacity-40"
                    title="تعيين كلمة مرور مؤقتة وإبطال الجلسات"
                  >
                    <LockKeyhole className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
