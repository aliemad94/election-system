'use client';

import React, { useState, useEffect } from 'react';
import { X, Shield, Power, Copy, Eye, EyeOff, LogOut, Check, Loader2, Link as LinkIcon, Key } from 'lucide-react';

interface OwnerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const PASSWORD_MIN_LENGTH = 8;

export default function OwnerPanel({ isOpen, onClose, onLogout }: OwnerPanelProps) {
  const [accessEnabled, setAccessEnabled] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchAccessStatus = async () => {
    try {
      const res = await fetch('/api/access');
      const data = await res.json();
      setAccessEnabled(data.enabled);
    } catch {
      // default
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAccessStatus();
    }
  }, [isOpen]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleToggleAccess = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle-access',
          enabled: !accessEnabled,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAccessEnabled(data.enabled);
        showMessage('success', data.enabled ? 'تم تفعيل الوصول' : 'تم إيقاف الوصول');
      } else {
        showMessage('error', data.message || 'فشل في تحديث الحالة');
      }
    } catch {
      showMessage('error', 'تعذر الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword.trim()) {
      showMessage('error', 'يرجى إدخال كلمة المرور الحالية');
      return;
    }
    if (!newPassword.trim()) {
      showMessage('error', 'يرجى إدخال كلمة المرور الجديدة');
      return;
    }
    if (newPassword.length < PASSWORD_MIN_LENGTH) {
      showMessage('error', `كلمة المرور يجب أن تكون ${PASSWORD_MIN_LENGTH} أحرف على الأقل`);
      return;
    }
    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    if (!hasLetter || !hasNumber) {
      showMessage('error', 'كلمة المرور يجب أن تحتوي على أحرف وأرقام');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change-password',
          currentPassword,
          newPassword,
        }),
        credentials: 'include', // Send httpOnly cookie
      });
      const data = await res.json();
      if (data.success) {
        setCurrentPassword('');
        setNewPassword('');
        showMessage('success', 'تم تغيير كلمة المرور بنجاح');
      } else {
        showMessage('error', data.message || 'فشل في تغيير كلمة المرور');
      }
    } catch {
      showMessage('error', 'تعذر الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Panel - slides from the right (RTL) */}
      <div
        className="fixed top-0 right-0 h-full w-full max-w-md bg-card border-l border-border z-50 shadow-2xl flex flex-col overflow-hidden"
        style={{ animation: 'slideInRight 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">لوحة تحكم المالك</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Message Toast */}
          {message && (
            <div className={`rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 border ${
              message.type === 'success'
                ? 'bg-secondary/10 text-secondary border-secondary/20'
                : 'bg-destructive/10 text-destructive border-destructive/20'
            }`}>
              {message.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              {message.text}
            </div>
          )}

          {/* Access Toggle Section */}
          <div className="bg-muted/30 border border-border/50 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground text-sm">حالة الوصول</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {accessEnabled ? 'النظام متاح للزوار' : 'النظام معطل عن الزوار'}
                </p>
              </div>
              <div className={`w-3 h-3 rounded-full ${accessEnabled ? 'bg-secondary' : 'bg-destructive'} animate-pulse`} />
            </div>

            <button
              onClick={handleToggleAccess}
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2 border ${
                accessEnabled
                  ? 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20'
                  : 'bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20'
              }`}
            >
              <Power className="w-4 h-4" />
              {accessEnabled ? 'إيقاف الوصول' : 'تفعيل الوصول'}
            </button>
          </div>

          {/* Change Password Section */}
          <div className="bg-muted/30 border border-border/50 rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-foreground text-sm">تغيير كلمة مرور المالك</h3>
            <div className="space-y-2">
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="كلمة المرور الحالية"
                  className="w-full px-4 py-2.5 pr-10 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-mono"
                  dir="ltr"
                />
                <button
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  tabIndex={-1}
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={`كلمة المرور الجديدة (${PASSWORD_MIN_LENGTH} أحرف على الأقل)`}
                  className="w-full px-4 py-2.5 pr-10 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-mono"
                  dir="ltr"
                />
                <button
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              onClick={handleChangePassword}
              disabled={loading || !newPassword || !currentPassword}
              className="w-full py-2.5 px-4 rounded-lg bg-primary text-primary-foreground font-bold text-sm disabled:opacity-50 hover:opacity-95 transition-colors cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
              تغيير كلمة المرور
            </button>
          </div>

          {/* Share Link Section */}
          <div className="bg-muted/30 border border-border/50 rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-primary" />
              رابط المشاركة
            </h3>
            <p className="text-xs text-muted-foreground">شارك هذا الرابط مع الأشخاص الذين تريد منحهم الوصول بعد إعطائهم كلمة المرور</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={typeof window !== 'undefined' ? window.location.href : ''}
                readOnly
                className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground text-xs truncate font-mono"
                dir="ltr"
              />
              <button
                onClick={handleCopyLink}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                  copied
                    ? 'bg-secondary/10 text-secondary border border-secondary/20'
                    : 'bg-primary text-primary-foreground hover:opacity-95'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'تم النسخ' : 'نسخ'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/10">
          <button
            onClick={onLogout}
            className="w-full py-3 px-4 rounded-xl bg-destructive/10 text-destructive font-semibold text-sm border border-destructive/20 hover:bg-destructive/20 transition-colors cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            تسجيل خروج
          </button>
        </div>
      </div>

      {/* Animation */}
      <style jsx>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
