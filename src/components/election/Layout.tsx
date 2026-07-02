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
  excelToolbar?: React.ReactNode;
}

export default function Layout({ activePage, onPageChange, children, isOwner, onOwnerPanelOpen, onLogout, excelToolbar }: LayoutProps) {
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
        onPageChange={onPageChange}
      />
      <main className="flex-1 mt-12 md:mr-64 p-5 bg-el-background w-full overflow-x-hidden">
        {excelToolbar && (
          <div className="mb-4 flex justify-end">
            {excelToolbar}
          </div>
        )}
        <div key={activePage} className="animate-fade-in duration-300">
          {children}
        </div>
      </main>
    </div>
  );
}

