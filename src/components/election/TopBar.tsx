'use client';

import React, { useState, useEffect } from 'react';
import { Search, Bell, Settings, Map, Menu, LogOut, Shield, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

interface TopBarProps {
  onMenuToggle: () => void;
  isOwner?: boolean;
  onOwnerPanelOpen?: () => void;
  onLogout?: () => void;
}

export default function TopBar({ onMenuToggle, isOwner, onOwnerPanelOpen, onLogout }: TopBarProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    voters: any[];
    tribes: any[];
    electionKeys: any[];
  }>({ voters: [], tribes: [], electionKeys: [] });
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ voters: [], tribes: [], electionKeys: [] });
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleVoterClick = (voter: any) => {
    window.dispatchEvent(
      new CustomEvent('global-search-select', {
        detail: {
          type: 'voter',
          fullName: voter.fullName,
          id: voter.id,
        },
      })
    );
    setShowResults(false);
    setSearchQuery('');
  };

  return (
    <header className="fixed top-0 left-0 w-full z-30 flex justify-between items-center px-4 h-12 bg-el-surface border-b border-el-outline-variant md:pr-64">
      <div className="flex items-center gap-4 w-full justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onMenuToggle}
            className="md:hidden text-el-on-surface-variant hover:bg-el-surface-container-high transition-colors p-1 rounded cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-[24px] leading-[32px] font-semibold text-el-primary truncate hidden sm:block">
            منصة إدارة الماكينة الانتخابية - ذي قار
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Global Filters */}
          <div className="hidden lg:flex items-center gap-2 ml-4">
            <div className="relative">
              <select className="appearance-none bg-el-surface-container border border-el-outline-variant text-el-on-surface text-[12px] leading-[16px] rounded pl-8 pr-3 py-1 h-8 focus:outline-none focus:border-el-primary cursor-pointer">
                <option>ذي قار</option>
              </select>
              <Map className="absolute left-2 top-1.5 text-el-on-surface-variant w-4 h-4 pointer-events-none" />
            </div>
            <div className="relative">
              <select className="appearance-none bg-el-surface-container border border-el-outline-variant text-el-on-surface text-[12px] leading-[16px] rounded pl-8 pr-3 py-1 h-8 focus:outline-none focus:border-el-primary cursor-pointer">
                <option>جميع الأقضية</option>
                <option>الناصرية</option>
                <option>الشطرة</option>
                <option>سوق الشيوخ</option>
                <option>الرفاعي</option>
                <option>قلعة سكر</option>
                <option>عشيرة</option>
                <option>البطحاء</option>
              </select>
              <Map className="absolute left-2 top-1.5 text-el-on-surface-variant w-4 h-4 pointer-events-none" />
            </div>
          </div>

          {/* Search */}
          <div className="hidden md:flex relative">
            <Search className="absolute right-2 top-1/2 -translate-y-1/2 text-el-outline w-4 h-4" />
            <input
              className="pl-3 pr-8 py-1 rounded bg-el-surface-container-low border border-el-outline-variant text-[12px] leading-[16px] h-8 w-64 focus:ring-el-primary focus:border-el-primary text-right"
              placeholder="البحث السريع..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowResults(true)}
              onBlur={() => setShowResults(false)}
            />
            {showResults && searchQuery.trim() !== '' && (
              <div className="absolute top-full right-0 w-80 bg-el-surface border border-el-outline-variant shadow-lg rounded-sm mt-1 max-h-96 overflow-y-auto z-50 text-right">
                {searching && (
                  <div className="p-3 text-center text-el-on-surface-variant text-[12px]">
                    جاري البحث...
                  </div>
                )}
                {!searching &&
                  searchResults.voters.length === 0 &&
                  searchResults.electionKeys.length === 0 &&
                  searchResults.tribes.length === 0 && (
                    <div className="p-3 text-center text-el-on-surface-variant text-[12px]">
                      لا توجد نتائج مطابقة
                    </div>
                  )}

                {!searching && searchResults.voters.length > 0 && (
                  <div>
                    <div className="bg-el-surface-container border-b border-el-outline-variant px-3 py-1.5 text-[11px] font-bold text-el-primary">
                      الناخبون ({searchResults.voters.length})
                    </div>
                    <div className="divide-y divide-el-outline-variant/30">
                      {searchResults.voters.map((v) => (
                        <button
                          key={v.id}
                          onMouseDown={() => handleVoterClick(v)}
                          className="w-full text-right px-3 py-2 hover:bg-el-surface-container-high transition-colors flex flex-col gap-0.5 cursor-pointer"
                        >
                          <span className="text-[12px] font-medium text-el-on-surface">
                            {v.fullName}
                          </span>
                          <span className="text-[10px] text-el-on-surface-variant">
                            {v.subtitle}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {!searching && searchResults.electionKeys.length > 0 && (
                  <div>
                    <div className="bg-el-surface-container border-b border-el-outline-variant px-3 py-1.5 text-[11px] font-bold text-el-primary">
                      المفاتيح الانتخابية ({searchResults.electionKeys.length})
                    </div>
                    <div className="divide-y divide-el-outline-variant/30">
                      {searchResults.electionKeys.map((k) => (
                        <div
                          key={k.id}
                          className="px-3 py-2 hover:bg-el-surface-container-high transition-colors flex flex-col gap-0.5"
                        >
                          <span className="text-[12px] font-medium text-el-on-surface">
                            {k.fullName}
                          </span>
                          <span className="text-[10px] text-el-on-surface-variant">
                            {k.subtitle}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!searching && searchResults.tribes.length > 0 && (
                  <div>
                    <div className="bg-el-surface-container border-b border-el-outline-variant px-3 py-1.5 text-[11px] font-bold text-el-primary">
                      العشائر ({searchResults.tribes.length})
                    </div>
                    <div className="divide-y divide-el-outline-variant/30">
                      {searchResults.tribes.map((t) => (
                        <div
                          key={t.id}
                          className="px-3 py-2 hover:bg-el-surface-container-high transition-colors flex flex-col gap-0.5"
                        >
                          <span className="text-[12px] font-medium text-el-on-surface">
                            {t.fullName}
                          </span>
                          <span className="text-[10px] text-el-on-surface-variant">
                            {t.subtitle}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-el-on-surface-variant hover:bg-el-surface-container-high transition-colors p-1.5 rounded cursor-pointer active:opacity-80 flex items-center justify-center"
              title={theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400 fill-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-el-primary" />
              )}
            </button>
          )}

          {/* Actions */}
          <button className="text-el-on-surface-variant hover:bg-el-surface-container-high transition-colors p-1 rounded cursor-pointer active:opacity-80 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-el-error rounded-full" />
          </button>
          <button className="text-el-on-surface-variant hover:bg-el-surface-container-high transition-colors p-1 rounded cursor-pointer active:opacity-80">
            <Settings className="w-5 h-5" />
          </button>

          {/* Owner Panel Button */}
          {isOwner && onOwnerPanelOpen && (
            <button
              onClick={onOwnerPanelOpen}
              className="text-amber-600 hover:bg-amber-50 transition-colors p-1 rounded cursor-pointer active:opacity-80"
              title="لوحة تحكم المالك"
            >
              <Shield className="w-5 h-5" />
            </button>
          )}

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="text-el-on-surface-variant hover:bg-red-50 hover:text-red-600 transition-colors p-1 rounded cursor-pointer active:opacity-80"
              title="تسجيل خروج"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}

          <div className="w-8 h-8 rounded-full bg-el-primary-fixed flex items-center justify-center overflow-hidden border border-el-outline-variant">
            <div className="w-full h-full bg-el-primary-container text-el-on-primary-container flex items-center justify-center text-[12px] font-bold">
              {isOwner ? 'م' : 'ز'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
