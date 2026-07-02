'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] caught:', error.message, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      
      return (
        <div className="flex flex-col items-center justify-center min-h-[320px] gap-4 bg-red-500/5 border border-red-500/20 rounded-xl p-8 text-center kowalski-shadow-md max-w-lg mx-auto my-6 animate-fade-in duration-300">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-1">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-[16px] font-bold text-red-800 dark:text-red-400">حدث خطأ غير متوقع في الواجهة</h3>
          <p className="text-[13px] text-el-on-surface-variant font-medium max-w-md leading-relaxed">
            {this.state.error?.message || 'تعذر عرض هذا القسم. قد يكون بسبب بيانات فارغة أو تالفة.'}
          </p>
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 text-red-700 dark:text-red-400 rounded-xl text-[13.5px] font-bold transition-all duration-200 cursor-pointer active:scale-95 shadow-sm"
          >
            <RefreshCw className="w-4 h-4" /> إعادة بناء الواجهة والمحاولة
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
