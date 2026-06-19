'use client';

import React, { useState, useEffect } from 'react';
import { Vote, Lock, Shield, Eye, EyeOff, Loader2, User } from 'lucide-react';

interface LoginGateProps {
  onLogin: (role: string) => void;
}

export default function LoginGate({ onLogin }: LoginGateProps) {
  const [accessEnabled, setAccessEnabled] = useState<boolean | null>(null);
  const [loginMode, setLoginMode] = useState<'visitor' | 'key' | 'owner'>('visitor');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const res = await fetch('/api/access');
        const data = await res.json();
        setAccessEnabled(data.enabled);
      } catch {
        setAccessEnabled(true);
      }
    };
    checkAccess();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let bodyData = {};
      if (loginMode === 'owner') {
        bodyData = { action: 'owner-login', ownerPassword: password };
      } else if (loginMode === 'key') {
        bodyData = { action: 'login', username, password };
      } else {
        bodyData = { action: 'login', password };
      }

      const res = await fetch('/api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });
      const data = await res.json();

      if (data.success) {
        // Token is now in httpOnly cookie - no need to store it
        onLogin(data.role || (loginMode === 'owner' ? 'ADMIN' : loginMode === 'key' ? 'KEY_USER' : 'OBSERVER'));
      } else {
        setError(data.message || 'حدث خطأ غير متوقع');
      }
    } catch {
      setError('تعذر الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  // Loading state while checking access
  if (accessEnabled === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Access disabled state
  if (!accessEnabled && loginMode === 'visitor') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center px-6 max-w-sm">
          <div className="w-28 h-28 mx-auto mb-6 rounded-full bg-card border border-border flex items-center justify-center shadow-lg">
            <Lock className="w-14 h-14 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">النظام معطل حالياً</h1>
          <p className="text-muted-foreground text-base">تم إيقاف الوصول من قبل المالك</p>
          <p className="text-muted-foreground/60 text-sm mt-2 font-mono">يرجى المحاولة لاحقاً</p>
          <div className="mt-6">
            <button
              onClick={() => { setLoginMode('owner'); setAccessEnabled(true); }}
              className="text-xs text-primary hover:underline font-bold"
            >
              الولوج كمالك النظام
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-10">
        {/* Card Header with subtle background */}
        <div className="px-8 pt-10 pb-6 text-center bg-muted/20 border-b border-border/40">
          {/* Logo */}
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl flex items-center justify-center shadow-lg border border-primary/20 bg-primary/5 text-primary">
            <Vote className="w-10 h-10" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-1">منصة إدارة الماكينة الانتخابية</h1>
          <p className="text-sm text-muted-foreground font-medium">محافظة ذي قار</p>
        </div>

        {/* Card Body */}
        <div className="px-8 pb-8 pt-6">
          {/* Mode Switch Tabs */}
          <div className="flex bg-muted/60 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => { setLoginMode('visitor'); setError(''); setPassword(''); setUsername(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                loginMode === 'visitor'
                  ? 'bg-card text-foreground shadow'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              دخول الزائر
            </button>
            <button
              type="button"
              onClick={() => { setLoginMode('key'); setError(''); setPassword(''); setUsername(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                loginMode === 'key'
                  ? 'bg-card text-foreground shadow'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              دخول الكوادر
            </button>
            <button
              type="button"
              onClick={() => { setLoginMode('owner'); setError(''); setPassword(''); setUsername(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                loginMode === 'owner'
                  ? 'bg-card text-foreground shadow'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              دخول المالك
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input - for staff custom login */}
            {loginMode === 'key' && (
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                  اسم المستخدم
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setError(''); }}
                    placeholder="أدخل اسم المستخدم الخاص بك"
                    className="w-full px-4 py-3 pr-11 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm font-mono text-right"
                    dir="rtl"
                    required
                    autoFocus
                  />
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            )}

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                {loginMode === 'owner' ? 'كلمة مرور المالك' : loginMode === 'key' ? 'كلمة المرور للكوادر' : 'كلمة المرور للزائر'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder={loginMode === 'owner' ? 'أدخل كلمة مرور المالك' : 'أدخل كلمة المرور'}
                  className="w-full px-4 py-3 pr-11 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm font-mono"
                  dir="ltr"
                  required
                  autoFocus={loginMode !== 'key'}
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-2.5 text-destructive text-sm flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !password || (loginMode === 'key' && !username)}
              className="w-full py-3 px-4 bg-primary text-primary-foreground font-bold text-sm rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-lg hover:shadow-xl cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري التحقق...
                </span>
              ) : (
                loginMode === 'owner' ? 'دخول كمالك' : 'دخول'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
