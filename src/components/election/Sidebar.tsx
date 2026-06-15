'use client';

import React from 'react';
import {
  LayoutDashboard,
  Network,
  ClipboardList,
  Megaphone,
  Activity,
  MessageSquare,
  Settings,
  HelpCircle,
  Vote,
  Users,
  UserPlus,
  Key,
  BarChart3,
  AlertTriangle,
  Brain,
  Wrench,
  ShieldAlert,
  FileText,
  Users2
} from 'lucide-react';

export type PageId =
  | 'dashboard'
  | 'tribes'
  | 'voters'
  | 'electoral-keys'
  | 'services'
  | 'tasks'
  | 'volunteers'
  | 'public-opinion'
  | 'competitors'
  | 'data-analysis'
  | 'early-warnings'
  | 'advanced-indicators'
  | 'fieldagent'
  | 'comms'
  | 'warroom'
  | 'commission'
  | 'sms';

interface SidebarProps {
  activePage: PageId;
  onPageChange: (page: PageId) => void;
  isOpen: boolean;
  onClose: () => void;
}

const navItems: { id: PageId; label: string; description: string; icon: React.ElementType; section?: string }[] = [
  { id: 'dashboard', label: 'لوحة التحكم', description: 'نظرة عامة على الانتخابات', icon: LayoutDashboard, section: 'الرئيسية' },
  
  { id: 'voters', label: 'تسجيل الناخبين', description: 'إضافة وبحث الناخبين مع GPS', icon: UserPlus, section: 'العمليات الميدانية' },
  { id: 'electoral-keys', label: 'المفاتيح الانتخابية', description: 'إدارة وتقييم المفاتيح', icon: Key, section: 'العمليات الميدانية' },
  { id: 'tribes', label: 'إدارة العشائر', description: 'العشائر والحمائل في ذي قار', icon: Users, section: 'العمليات الميدانية' },
  { id: 'services', label: 'نظام الخدمات والمساعدات', description: 'تلبية ومتابعة طلبات المواطنين', icon: Wrench, section: 'العمليات الميدانية' },
  { id: 'tasks', label: 'تتبع المهام الميدانية', description: 'إدارة وتوجيه المهام والزيارات', icon: ClipboardList, section: 'العمليات الميدانية' },
  { id: 'volunteers', label: 'إدارة الكوادر والمتطوعين', description: 'تنظيم شؤون المندوبين والمشرفين', icon: Users2, section: 'العمليات الميدانية' },
  
  { id: 'public-opinion', label: 'نظام الرأي العام والنبض', description: 'مؤشرات اتجاه الشارع والرضا', icon: MessageSquare, section: 'التحليل والذكاء' },
  { id: 'competitors', label: 'نظام المنافسين والخصوم', description: 'تتبع الخصوم والخطط المضادة', icon: ShieldAlert, section: 'التحليل والذكاء' },
  { id: 'advanced-indicators', label: 'التنبؤ والذكاء الاصطناعي', description: '70 مؤشر تحليلي ذكي للتوقع', icon: Brain, section: 'التحليل والذكاء' },
  { id: 'data-analysis', label: 'تحليل البيانات الشامل', description: 'منظومة تحليل متكاملة', icon: BarChart3, section: 'التحليل والذكاء' },
  { id: 'commission', label: 'بيانات المفوضية', description: 'السجلات الانتخابية وتوزيع الأقضية', icon: FileText, section: 'التحليل والذكاء' },
  { id: 'early-warnings', label: 'مراقب الإنذار المبكر', description: 'مؤشرات التهديدات والفرص', icon: AlertTriangle, section: 'التحليل والذكاء' },
  
  { id: 'fieldagent', label: 'بوابة المندوب الميداني', description: 'تأكيد الحضور وتحديث الميدان', icon: Network, section: 'الاتصال السياسي' },
  { id: 'comms', label: 'محرك الاتصالات السياسية', description: 'إدارة حملات التواصل السياسي', icon: Megaphone, section: 'الاتصال السياسي' },
  { id: 'warroom', label: 'غرفة عمليات الاقتراع', description: 'متابعة مباشرة ليوم التصويت والفرز', icon: Activity, section: 'يوم الحسم' },
];

export default function Sidebar({ activePage, onPageChange, isOpen, onClose }: SidebarProps) {
  const handleNavClick = (pageId: PageId) => {
    onPageChange(pageId);
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <nav
        className={`
          fixed right-0 top-0 h-full z-50 w-64 flex flex-col
          bg-el-surface-container border-l border-el-outline-variant
          pt-12 pb-4 transition-transform duration-300
          ${isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
          md:translate-x-0
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-el-outline-variant mb-4 flex flex-col items-center">
          <div className="w-16 h-16 rounded bg-el-primary-container text-el-on-primary-container flex items-center justify-center mb-2">
            <Vote className="w-8 h-8" />
          </div>
          <h1 className="text-[24px] leading-[32px] font-semibold text-el-primary text-center">
            الماكينة الانتخابية
          </h1>
          <p className="text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface-variant mt-1">
            ذي قار - لوحة التحكم
          </p>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {(() => {
            let lastSection = '';
            const itemsWithHeaders = navItems.map((item) => {
              const showSection = item.section && item.section !== lastSection;
              if (item.section) lastSection = item.section;
              return { ...item, showSection };
            });

            return itemsWithHeaders.map((item) => {
              const isActive = activePage === item.id;
              const Icon = item.icon;
              return (
                <React.Fragment key={item.id}>
                  {item.showSection && (
                    <div className="text-[10px] leading-[14px] font-bold tracking-[0.1em] text-el-on-surface-variant/60 uppercase mt-3 mb-1 px-3">
                      {item.section}
                    </div>
                  )}
                  <button
                    onClick={() => handleNavClick(item.id)}
                    title={item.description}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded w-full text-right cursor-pointer
                      active:scale-95 transition-all
                      ${
                        isActive
                           ? 'bg-el-secondary-container text-el-on-secondary-container font-semibold'
                           : 'text-el-on-surface-variant hover:bg-el-surface-container-highest'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <div className="flex flex-col text-right">
                      <span className="text-[14px] leading-[20px]">{item.label}</span>
                      <span className="text-[10px] leading-[14px] text-el-on-surface-variant opacity-70">{item.description}</span>
                    </div>
                  </button>
                </React.Fragment>
              );
            });
          })()}
        </div>

        {/* Footer */}
        <div className="px-4 mt-auto space-y-4">
          <button
            onClick={() => handleNavClick('sms')}
            className="w-full bg-el-primary text-el-on-primary py-2 px-4 rounded text-[14px] leading-[20px] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <MessageSquare className="w-[18px] h-[18px]" />
            بث رسائل
          </button>
          <div className="pt-2 border-t border-el-outline-variant space-y-1">
            <button className="flex items-center gap-3 px-3 py-2 rounded text-el-on-surface-variant hover:bg-el-surface-container-highest transition-all cursor-pointer active:scale-95 w-full">
              <Settings className="w-5 h-5" />
              <span className="text-[14px] leading-[20px]">الإعدادات</span>
            </button>
            <button className="flex items-center gap-3 px-3 py-2 rounded text-el-on-surface-variant hover:bg-el-surface-container-highest transition-all cursor-pointer active:scale-95 w-full">
              <HelpCircle className="w-5 h-5" />
              <span className="text-[14px] leading-[20px]">المساعدة</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
