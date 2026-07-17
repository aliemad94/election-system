'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Settings, Map, Menu, LogOut, Shield, Sun, Moon, X } from 'lucide-react';
import { useTheme } from 'next-themes';

interface TopBarProps {
  onMenuToggle: () => void;
  isOwner?: boolean;
  onOwnerPanelOpen?: () => void;
  onLogout?: () => void;
  onPageChange?: (page: any) => void;
}

export default function TopBar({ onMenuToggle, isOwner, onOwnerPanelOpen, onLogout, onPageChange }: TopBarProps) {
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const handleSearchSelect = (type: 'voter' | 'key' | 'tribe', item: any) => {
    window.dispatchEvent(
      new CustomEvent('global-search-select', {
        detail: {
          type,
          fullName: item.fullName,
          id: item.id,
        },
      })
    );
    setIsModalOpen(false);
    setShowResults(false);
    setSearchQuery('');
    
    // Navigate to page
    if (type === 'voter') {
      onPageChange?.('voters');
    } else if (type === 'key') {
      onPageChange?.('electoral-keys');
    } else if (type === 'tribe') {
      onPageChange?.('tribes');
    }
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
          <div ref={searchRef} className="hidden md:flex relative">
            <button
              onClick={() => setIsModalOpen(true)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-el-outline hover:text-el-primary transition-colors cursor-pointer"
              title="البحث المتقدم"
            >
              <Search className="w-4 h-4" />
            </button>
            <input
              className="pl-8 pr-8 py-1 rounded bg-el-surface-container-low border border-el-outline-variant text-[12px] leading-[16px] h-8 w-64 focus:ring-el-primary focus:border-el-primary text-right focus:outline-none"
              placeholder="البحث السريع..."
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowResults(false);
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-el-outline hover:text-el-error transition-colors cursor-pointer"
                title="مسح البحث"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Dropdown Results Box */}
            {showResults && searchQuery.trim() && (
              <div className="absolute right-0 top-full mt-1.5 w-[380px] bg-el-surface border border-el-outline-variant rounded-lg shadow-2xl max-h-[400px] overflow-y-auto z-50 flex flex-col gap-3 p-4 text-right" dir="rtl">
                {searching ? (
                  <div className="text-center text-xs text-el-on-surface-variant p-4">جاري البحث...</div>
                ) : (searchResults.voters.length === 0 && searchResults.electionKeys.length === 0 && searchResults.tribes.length === 0) ? (
                  <div className="text-center text-xs text-el-on-surface-variant p-4">لا توجد نتائج</div>
                ) : (
                  <>
                    {/* Voters Section */}
                    {searchResults.voters.length > 0 && (
                      <div className="flex flex-col gap-1">
                        <div className="font-bold text-[11px] text-el-primary border-b border-el-outline-variant/60 pb-1 mb-1 flex justify-between items-center">
                          <span>الناخبون</span>
                          <span className="bg-el-primary-container text-el-on-primary-container px-1.5 py-0.5 rounded text-[9px] font-semibold">{searchResults.voters.length}</span>
                        </div>
                        <div className="space-y-0.5 max-h-[120px] overflow-y-auto">
                          {searchResults.voters.slice(0, 5).map((v) => (
                            <button
                              key={v.id}
                              onClick={() => {
                                handleSearchSelect('voter', v);
                                setShowResults(false);
                              }}
                              className="w-full text-right px-2 py-1.5 hover:bg-el-surface-container-high rounded text-[11px] transition-colors flex flex-col cursor-pointer"
                            >
                              <span className="font-semibold text-el-on-surface">{v.fullName}</span>
                              <span className="text-[9px] text-el-on-surface-variant">{v.subtitle}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Electoral Keys Section */}
                    {searchResults.electionKeys.length > 0 && (
                      <div className="flex flex-col gap-1">
                        <div className="font-bold text-[11px] text-el-primary border-b border-el-outline-variant/60 pb-1 mb-1 flex justify-between items-center">
                          <span>المفاتيح الانتخابية</span>
                          <span className="bg-el-primary-container text-el-on-primary-container px-1.5 py-0.5 rounded text-[9px] font-semibold">{searchResults.electionKeys.length}</span>
                        </div>
                        <div className="space-y-0.5 max-h-[120px] overflow-y-auto">
                          {searchResults.electionKeys.slice(0, 5).map((k) => (
                            <button
                              key={k.id}
                              onClick={() => {
                                handleSearchSelect('key', k);
                                setShowResults(false);
                              }}
                              className="w-full text-right px-2 py-1.5 hover:bg-el-surface-container-high rounded text-[11px] transition-colors flex flex-col cursor-pointer"
                            >
                              <span className="font-semibold text-el-on-surface">{k.fullName}</span>
                              <span className="text-[9px] text-el-on-surface-variant">{k.subtitle}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tribes Section */}
                    {searchResults.tribes.length > 0 && (
                      <div className="flex flex-col gap-1">
                        <div className="font-bold text-[11px] text-el-primary border-b border-el-outline-variant/60 pb-1 mb-1 flex justify-between items-center">
                          <span>العشائر</span>
                          <span className="bg-el-primary-container text-el-on-primary-container px-1.5 py-0.5 rounded text-[9px] font-semibold">{searchResults.tribes.length}</span>
                        </div>
                        <div className="space-y-0.5 max-h-[120px] overflow-y-auto">
                          {searchResults.tribes.slice(0, 5).map((t) => (
                            <button
                              key={t.id}
                              onClick={() => {
                                handleSearchSelect('tribe', t);
                                setShowResults(false);
                              }}
                              className="w-full text-right px-2 py-1.5 hover:bg-el-surface-container-high rounded text-[11px] transition-colors flex flex-col cursor-pointer"
                            >
                              <span className="font-semibold text-el-on-surface">{t.fullName}</span>
                              <span className="text-[9px] text-el-on-surface-variant">{t.subtitle}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
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
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[90] flex items-center justify-center p-4" dir="rtl">
          <div className="bg-el-surface border border-el-outline-variant rounded-lg p-6 max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col gap-4 shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-el-outline-variant pb-3">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-el-primary" />
                <h3 className="text-md font-bold text-el-on-surface">نتائج البحث التفصيلية</h3>
              </div>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setSearchQuery('');
                }}
                className="text-el-on-surface-variant hover:bg-el-surface-container-high p-1 rounded-full cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search Input */}
            <div className="relative w-full">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-el-outline w-5 h-5" />
              <input
                className="w-full pl-4 pr-10 py-2.5 rounded-md bg-el-surface-container-low border border-el-outline-variant text-sm focus:ring-el-primary focus:border-el-primary text-right"
                placeholder="اكتب اسم الناخب، المفتاح الانتخابي، أو العشيرة للبحث..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>

            {/* Results Grid */}
            <div className="flex-grow overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
              {/* Voters Column */}
              <div className="border border-el-outline-variant/60 rounded-md p-3 flex flex-col gap-2 bg-el-surface-container-lowest">
                <div className="font-bold text-xs text-el-primary border-b border-el-outline-variant pb-1.5 flex justify-between items-center">
                  <span>الناخبون</span>
                  <span className="bg-el-primary-container text-el-on-primary-container px-2 py-0.5 rounded text-[10px]">
                    {searching ? '...' : (searchResults?.voters || []).length}
                  </span>
                </div>
                <div className="flex-grow overflow-y-auto max-h-[45vh] space-y-1.5 divide-y divide-el-outline-variant/30">
                  {searching ? (
                    <div className="text-center text-xs text-el-on-surface-variant p-4">جاري البحث...</div>
                  ) : (searchResults?.voters || []).length === 0 ? (
                    <div className="text-center text-xs text-el-on-surface-variant p-4">لا توجد نتائج</div>
                  ) : (
                    (searchResults?.voters || []).map((v) => (
                      <button
                        key={v.id}
                        onClick={() => handleSearchSelect('voter', v)}
                        className="w-full text-right px-2.5 py-2 hover:bg-el-surface-container-high rounded transition-colors flex flex-col gap-0.5 cursor-pointer"
                      >
                        <span className="text-xs font-semibold text-el-on-surface">{v.fullName}</span>
                        <span className="text-[10px] text-el-on-surface-variant">{v.subtitle}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Electoral Keys Column */}
              <div className="border border-el-outline-variant/60 rounded-md p-3 flex flex-col gap-2 bg-el-surface-container-lowest">
                <div className="font-bold text-xs text-el-primary border-b border-el-outline-variant pb-1.5 flex justify-between items-center">
                  <span>المفاتيح الانتخابية</span>
                  <span className="bg-el-primary-container text-el-on-primary-container px-2 py-0.5 rounded text-[10px]">
                    {searching ? '...' : (searchResults?.electionKeys || []).length}
                  </span>
                </div>
                <div className="flex-grow overflow-y-auto max-h-[45vh] space-y-1.5 divide-y divide-el-outline-variant/30">
                  {searching ? (
                    <div className="text-center text-xs text-el-on-surface-variant p-4">جاري البحث...</div>
                  ) : (searchResults?.electionKeys || []).length === 0 ? (
                    <div className="text-center text-xs text-el-on-surface-variant p-4">لا توجد نتائج</div>
                  ) : (
                    (searchResults?.electionKeys || []).map((k) => (
                      <button
                        key={k.id}
                        onClick={() => handleSearchSelect('key', k)}
                        className="w-full text-right px-2.5 py-2 hover:bg-el-surface-container-high rounded transition-colors flex flex-col gap-0.5 cursor-pointer"
                      >
                        <span className="text-xs font-semibold text-el-on-surface">{k.fullName}</span>
                        <span className="text-[10px] text-el-on-surface-variant">{k.subtitle}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Tribes Column */}
              <div className="border border-el-outline-variant/60 rounded-md p-3 flex flex-col gap-2 bg-el-surface-container-lowest">
                <div className="font-bold text-xs text-el-primary border-b border-el-outline-variant pb-1.5 flex justify-between items-center">
                  <span>العشائر</span>
                  <span className="bg-el-primary-container text-el-on-primary-container px-2 py-0.5 rounded text-[10px]">
                    {searching ? '...' : (searchResults?.tribes || []).length}
                  </span>
                </div>
                <div className="flex-grow overflow-y-auto max-h-[45vh] space-y-1.5 divide-y divide-el-outline-variant/30">
                  {searching ? (
                    <div className="text-center text-xs text-el-on-surface-variant p-4">جاري البحث...</div>
                  ) : (searchResults?.tribes || []).length === 0 ? (
                    <div className="text-center text-xs text-el-on-surface-variant p-4">لا توجد نتائج</div>
                  ) : (
                    (searchResults?.tribes || []).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => handleSearchSelect('tribe', t)}
                        className="w-full text-right px-2.5 py-2 hover:bg-el-surface-container-high rounded transition-colors flex flex-col gap-0.5 cursor-pointer"
                      >
                        <span className="text-xs font-semibold text-el-on-surface">{t.fullName}</span>
                        <span className="text-[10px] text-el-on-surface-variant">{t.subtitle}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="border-t border-el-outline-variant pt-3 text-[11px] text-el-on-surface-variant text-left">
              انقر على أي نتيجة لفتح الصفحة الخاصة بها وعرض التفاصيل مباشرة.
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

