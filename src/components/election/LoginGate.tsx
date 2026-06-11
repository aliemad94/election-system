'use client';

import React, { useState, useEffect } from 'react';
import { Vote, Lock, Shield, Eye, EyeOff, Loader2 } from 'lucide-react';

interface LoginGateProps {
  onLogin: (role: string) => void;
}

export default function LoginGate({ onLogin }: LoginGateProps) {
  const [accessEnabled, setAccessEnabled] = useState<boolean | null>(null);
  const [isOwnerMode, setIsOwnerMode] = useState(false);
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
      const res = await fetch('/api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isOwnerMode
            ? { action: 'owner-login', ownerPassword: password }
            : { action: 'login', password }
        ),
      });
      const data = await res.json();

      if (data.success) {
        // Token is now in httpOnly cookie - no need to store it
        onLogin(data.role || (isOwnerMode ? 'ADMIN' : 'OBSERVER'));
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #01579b 100%)' }}>
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  // Access disabled state
  if (!accessEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #01579b 100%)' }}>
        <div className="text-center px-6">
          <div className="w-28 h-28 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
            <Lock className="w-14 h-14 text-white/70" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">النظام معطل حالياً</h1>
          <p className="text-white/60 text-base">تم إيقاف الوصول من قبل المالك</p>
          <p className="text-white/40 text-sm mt-2">يرجى المحاولة لاحقاً</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #01579b 100%)' }}>
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-white/3 rounded-full blur-3xl" />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Card Header with gradient */}
        <div className="px-8 pt-10 pb-6 text-center" style={{ background: 'linear-gradient(180deg, #f5f5ff 0%, #ffffff 100%)' }}>
          {/* Logo */}
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)' }}>
            <Vote className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">منصة إدارة الماكينة الانتخابية</h1>
          <p className="text-sm text-gray-500 font-medium">محافظة ذي قار</p>
        </div>

        {/* Card Body */}
        <div className="px-8 pb-8">
          {/* Mode indicator */}
          <div className="flex items-center justify-center gap-2 mb-5">
            {isOwnerMode ? (
              <Shield className="w-4 h-4 text-amber-600" />
            ) : (
              <Lock className="w-4 h-4 text-blue-700" />
            )}
            <span className="text-sm font-medium text-gray-600">
              {isOwnerMode ? 'دخول المالك' : 'دخول الزائر'}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {isOwnerMode ? 'كلمة مرور المالك' : 'كلمة المرور'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder={isOwnerMode ? 'أدخل كلمة مرور المالك' : 'أدخل كلمة المرور'}
                  className="w-full px-4 py-3 pr-11 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-sm"
                  dir="ltr"
                  autoFocus
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-red-600 text-sm flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-3 px-4 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-lg hover:shadow-xl cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري التحقق...
                </span>
              ) : (
                isOwnerMode ? 'دخول كمالك' : 'دخول'
              )}
            </button>
          </form>

          {/* Mode Switch */}
          <div className="mt-6 text-center border-t border-gray-100 pt-5">
            {isOwnerMode ? (
              <button
                onClick={() => { setIsOwnerMode(false); setError(''); setPassword(''); }}
                className="text-sm text-blue-700 hover:text-blue-800 font-medium transition-colors cursor-pointer"
              >
                دخول الزائر
              </button>
            ) : (
              <button
                onClick={() => { setIsOwnerMode(true); setError(''); setPassword(''); }}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5" />
                دخول المالك
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
