'use client';

import React, { useState } from 'react';
import Sidebar, { type PageId } from './Sidebar';
import TopBar from './TopBar';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  activePage: PageId;
  onPageChange: (page: PageId) => void;
  children: React.ReactNode;
  isOwner?: boolean;
  onOwnerPanelOpen?: () => void;
  onLogout?: () => void;
  excelToolbar?: React.ReactNode;
  userRole?: string;
}

export default function Layout({ activePage, onPageChange, children, isOwner, onOwnerPanelOpen, onLogout, excelToolbar, userRole }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar
        activePage={activePage}
        onPageChange={onPageChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole={userRole}
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
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{
              type: 'spring' as const,
              stiffness: 140,
              damping: 18
            }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}


