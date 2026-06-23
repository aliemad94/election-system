'use client';

import React, { useReducer, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Layout from '@/components/election/Layout';
import LoginGate from '@/components/election/LoginGate';
import OwnerPanel from '@/components/election/OwnerPanel';
import { ErrorBoundary } from '@/components/election/errorboundary';

const ExecutiveDashboard = dynamic(() => import('@/components/election/ExecutiveDashboard'), { ssr: false });
const TaskTracking = dynamic(() => import('@/components/election/TaskTracking'), { ssr: false });
const WarRoom = dynamic(() => import('@/components/election/WarRoom'), { ssr: false });
const FieldAgentPortal = dynamic(() => import('@/components/election/FieldAgentPortal'), { ssr: false });
const CommunicationEngine = dynamic(() => import('@/components/election/CommunicationEngine'), { ssr: false });
const SMSBroadcasting = dynamic(() => import('@/components/election/SMSBroadcasting'), { ssr: false });
const TribalManagement = dynamic(() => import('@/components/election/TribalManagement'), { ssr: false });
const VoterRegistration = dynamic(() => import('@/components/election/VoterRegistration'), { ssr: false });
const ElectoralKeyManagement = dynamic(() => import('@/components/election/ElectoralKeyManagement'), { ssr: false });
const DataAnalysis = dynamic(() => import('@/components/election/DataAnalysis'), { ssr: false });
const EarlyWarningMonitor = dynamic(() => import('@/components/election/EarlyWarningMonitor'), { ssr: false });
const AdvancedIndicators = dynamic(() => import('@/components/election/AdvancedIndicators'), { ssr: false });
const ServicesManagement = dynamic(() => import('@/components/election/ServicesManagement'), { ssr: false });
const CompetitorsManagement = dynamic(() => import('@/components/election/CompetitorsManagement'), { ssr: false });
const VolunteersManagement = dynamic(() => import('@/components/election/VolunteersManagement'), { ssr: false });
const PublicOpinion = dynamic(() => import('@/components/election/PublicOpinion'), { ssr: false });
const CommissionManagement = dynamic(() => import('@/components/election/CommissionManagement'), { ssr: false });

import type { PageId } from '@/components/election/Sidebar';

interface AuthState {
  isLoggedIn: boolean;
  userRole: string;
  isOwner: boolean;
  mounted: boolean;
}

type AuthAction =
  | { type: 'HYDRATE'; payload: AuthState }
  | { type: 'LOGIN'; role: string }
  | { type: 'LOGOUT' };

const initialAuthState: AuthState = {
  isLoggedIn: false,
  userRole: '',
  isOwner: false,
  mounted: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'HYDRATE':
      return action.payload;
    case 'LOGIN': {
      const isOwner = action.role === 'ADMIN';
      return { isLoggedIn: true, userRole: action.role, isOwner, mounted: true };
    }
    case 'LOGOUT':
      if (typeof window !== 'undefined') {
        // Clear the httpOnly cookie by calling the server
        fetch('/api/access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'logout' }),
        }).catch(() => {});
        // Also clear client-side cookie as backup
        document.cookie = "election_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; secure; samesite=strict";
      }
      return { isLoggedIn: false, userRole: '', isOwner: false, mounted: true };
    default:
      return state;
  }
}

export default function Home() {
  const [activePage, setActivePage] = React.useState<PageId>('dashboard');
  const [showOwnerPanel, setShowOwnerPanel] = React.useState(false);
  const [authState, dispatch] = useReducer(authReducer, initialAuthState);

  // Hydrate auth state by checking with the server on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            dispatch({
              type: 'HYDRATE',
              payload: {
                isLoggedIn: true,
                userRole: data.role,
                isOwner: data.isOwner || data.role === 'ADMIN',
                mounted: true,
              },
            });
          } else {
            dispatch({ type: 'HYDRATE', payload: { ...initialAuthState, mounted: true } });
          }
        } else {
          dispatch({ type: 'HYDRATE', payload: { ...initialAuthState, mounted: true } });
        }
      } catch {
        dispatch({ type: 'HYDRATE', payload: { ...initialAuthState, mounted: true } });
      }
    };
    checkAuth();
  }, []);

  // Ignore chrome extension errors
  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      if (reason && (
        reason.code === -32603 || 
        (reason.message && reason.message.includes('JSON-RPC')) || 
        (typeof reason === 'object' && Object.keys(reason).length === 0)
      )) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    const handleError = (event: ErrorEvent) => {
      if (event.filename && event.filename.includes('chrome-extension://')) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    window.addEventListener('unhandledrejection', handleRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  const handleLogin = useCallback((role: string) => {
    dispatch({ type: 'LOGIN', role });
  }, []);

  const handleLogout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
    setShowOwnerPanel(false);
  }, []);

  // Don't render until mounted
  if (!authState.mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-foreground text-sm font-medium">جاري تهيئة النظام...</p>
        </div>
      </div>
    );
  }

  if (!authState.isLoggedIn) {
    return <LoginGate onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <ExecutiveDashboard />;
      case 'tribes':
        return <TribalManagement />;
      case 'voters':
        return <VoterRegistration />;
      case 'electoral-keys':
        return <ElectoralKeyManagement />;
      case 'services':
        return <ServicesManagement />;
      case 'tasks':
        return <TaskTracking />;
      case 'volunteers':
        return <VolunteersManagement />;
      case 'public-opinion':
        return <PublicOpinion />;
      case 'competitors':
        return <CompetitorsManagement />;
      case 'data-analysis':
        return <DataAnalysis />;
      case 'early-warnings':
        return <EarlyWarningMonitor />;
      case 'advanced-indicators':
        return <AdvancedIndicators />;
      case 'fieldagent':
        return <FieldAgentPortal />;
      case 'comms':
        return <CommunicationEngine />;
      case 'warroom':
        return <WarRoom />;
      case 'commission':
        return <CommissionManagement />;
      case 'sms':
        return <SMSBroadcasting />;
      default:
        return <ExecutiveDashboard />;
    }
  };

  return (
    <>
      <Layout
        activePage={activePage}
        onPageChange={setActivePage}
        isOwner={authState.isOwner}
        onOwnerPanelOpen={() => setShowOwnerPanel(true)}
        onLogout={handleLogout}
      >
        <ErrorBoundary>{renderPage()}</ErrorBoundary>
      </Layout>
      <OwnerPanel
        isOpen={showOwnerPanel}
        onClose={() => setShowOwnerPanel(false)}
        onLogout={handleLogout}
      />
      {/* Owner toggle button - only visible to owner */}
      {authState.isOwner && (
        <button
          onClick={() => setShowOwnerPanel(true)}
          className="fixed bottom-6 left-6 z-40 bg-el-primary text-el-on-primary p-3 rounded-full shadow-lg hover:opacity-90 transition-all active:scale-95 cursor-pointer"
          title="لوحة تحكم المالك"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </button>
      )}
    </>
  );
}

