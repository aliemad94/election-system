'use client';

import React, { useState } from 'react';
import Sidebar, { type PageId } from './Sidebar';
import TopBar from './TopBar';

interface LayoutProps {
  activePage: PageId;
  onPageChange: (page: PageId) => void;
  children: React.ReactNode;
  isOwner?: boolean;
  onOwnerPanelOpen?: () => void;
  onLogout?: () => void;
}

export default function Layout({ activePage, onPageChange, children, isOwner, onOwnerPanelOpen, onLogout }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar
        activePage={activePage}
        onPageChange={onPageChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <TopBar
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        isOwner={isOwner}
        onOwnerPanelOpen={onOwnerPanelOpen}
        onLogout={onLogout}
      />
      <main className="flex-1 mt-12 md:mr-64 p-4 bg-el-background w-full">
        {children}
      </main>
    </div>
  );
}
