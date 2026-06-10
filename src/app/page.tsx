'use client';

import React, { useReducer, useEffect, useCallback } from 'react';
import Layout from '@/components/election/Layout';
import ExecutiveDashboard from '@/components/election/ExecutiveDashboard';
import TaskTracking from '@/components/election/TaskTracking';
import WarRoom from '@/components/election/WarRoom';
import FieldAgentPortal from '@/components/election/FieldAgentPortal';
import CommunicationEngine from '@/components/election/CommunicationEngine';
import SMSBroadcasting from '@/components/election/SMSBroadcasting';
import TribalManagement from '@/components/election/TribalManagement';
import VoterRegistration from '@/components/election/VoterRegistration';
import ElectoralKeyManagement from '@/components/election/ElectoralKeyManagement';
import DataAnalysis from '@/components/election/DataAnalysis';
import EarlyWarningMonitor from '@/components/election/EarlyWarningMonitor';
import AdvancedIndicators from '@/components/election/AdvancedIndicators';
import LoginGate from '@/components/election/LoginGate';
import OwnerPanel from '@/components/election/OwnerPanel';

// الأنظمة الأربعة المضافة حديثاً لتكامل الأنظمة الـ 14
import ServicesManagement from '@/components/election/ServicesManagement';
import CompetitorsManagement from '@/components/election/CompetitorsManagement';
import VolunteersManagement from '@/components/election/VolunteersManagement';
import PublicOpinion from '@/components/election/PublicOpinion';

import type { PageId } from '@/components/election/Sidebar';

interface AuthState {
  isLoggedIn: boolean;
  authToken: string;
  isOwner: boolean;
  mounted: boolean;
}

type AuthAction =
  | { type: 'HYDRATE'; payload: AuthState }
  | { type: 'LOGIN'; token: string }
  | { type: 'LOGOUT' };

const initialAuthState: AuthState = {
  isLoggedIn: false,
  authToken: '',
  isOwner: false,
  mounted: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'HYDRATE':
      return action.payload;
    case 'LOGIN': {
      let isOwner = false;
      try {
        isOwner = atob(action.token).startsWith('owner:');
      } catch {
        // not owner
      }
      sessionStorage.setItem('election_auth', action.token);
      return { isLoggedIn: true, authToken: action.token, isOwner, mounted: true };
    }
    case 'LOGOUT':
      sessionStorage.removeItem('election_auth');
      if (typeof window !== 'undefined') {
        document.cookie = "election_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; secure; samesite=strict";
      }
      return { isLoggedIn: false, authToken: '', isOwner: false, mounted: true };
    default:
      return state;
  }
}

function getHydratedState(): AuthState {
  if (typeof window === 'undefined') {
    return { ...initialAuthState, mounted: false };
  }
  try {
    const saved = sessionStorage.getItem('election_auth');
    if (saved) {
      // Sync cookie so API requests don't fail on reload
      document.cookie = `election_auth=${saved}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=strict`;
      try {
        const decoded = atob(saved);
        return { isLoggedIn: true, authToken: saved, isOwner: decoded.startsWith('owner:'), mounted: true };
      } catch {
        return { isLoggedIn: true, authToken: saved, isOwner: false, mounted: true };
      }
    }
  } catch (e) {
    console.error('[Home] Failed to load from sessionStorage:', e);
  }
  return { ...initialAuthState, mounted: true };
}

export default function Home() {
  const [activePage, setActivePage] = React.useState<PageId>('dashboard');
  const [showOwnerPanel, setShowOwnerPanel] = React.useState(false);
  const [authState, dispatch] = useReducer(authReducer, initialAuthState);

  // Debugging log to see state transitions in browser console
  console.log('[Home] Render - authState:', authState);

  // Hydrate auth state from sessionStorage on mount
  useEffect(() => {
    try {
      const state = getHydratedState();
      console.log('[Home] Hydrating state:', state);
      dispatch({ type: 'HYDRATE', payload: state });
    } catch (e) {
      console.error('[Home] Hydration effect error:', e);
      // fallback to mount
      dispatch({ type: 'HYDRATE', payload: { ...initialAuthState, mounted: true } });
    }
  }, []);

  // Ignore chrome extension errors that crash Next.js dev overlay
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

  const handleLogin = useCallback((token: string) => {
    dispatch({ type: 'LOGIN', token });
  }, []);

  const handleLogout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
    setShowOwnerPanel(false);
  }, []);

  // Don't render until mounted to avoid hydration mismatch, show loading
  if (!authState.mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9ff]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#031635] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#031635] text-sm font-medium">جاري تهيئة النظام...</p>
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
        {renderPage()}
      </Layout>
      <OwnerPanel
        isOpen={showOwnerPanel}
        onClose={() => setShowOwnerPanel(false)}
        authToken={authState.authToken}
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
