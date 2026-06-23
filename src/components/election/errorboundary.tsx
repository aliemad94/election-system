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
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 bg-red-50/50 border border-red-200 rounded-lg p-8 text-center">
          <ShieldAlert className="w-12 h-12 text-red-400" />
          <h3 className="text-[16px] font-bold text-red-700">حدث خطأ غير متوقع</h3>
          <p className="text-[13px] text-red-600/70 max-w-md">
            {this.state.error?.message || 'تعذر عرض هذا القسم. قد يكون بسبب بيانات فارغة أو تالفة.'}
          </p>
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-[13px] hover:bg-red-200 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> إعادة المحاولة
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
