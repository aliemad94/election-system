'use client';

import React, { useState, useEffect } from 'react';
import {
  ListChecks,
  Clock,
  CheckCircle,
  Timer,
  PlusCircle,
  Download,
  SlidersHorizontal,
  MoreVertical,
  Search,
  ChevronDown,
} from 'lucide-react';

const DISTRICTS = ['الناصرية', 'الشطرة', 'سوق الشيوخ', 'الرفاعي', 'قلعة سكر', 'عشيرة', 'البطحاء'];

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  taskType: string;
  district: string | null;
  impactEstimate: string | null;
  targetVoter: { id: string; fullName: string; phoneNumber: string; confidenceScore: number } | null;
  assignedTo: { id: string; name: string; district: string | null } | null;
  createdAt: string;
}

interface TaskData {
  tasks: Task[];
  statusCounts: { status: string; _count: { id: number } }[];
}

const priorityLabels: Record<string, string> = {
  URGENT: 'عاجل',
  HIGH: 'عالي',
  NORMAL: 'متوسط',
  LOW: 'عادي',
};

const priorityColors: Record<string, string> = {
  URGENT: 'border-[#dc3545] text-[#dc3545] bg-[#fff5f5]',
  HIGH: 'border-el-secondary text-el-secondary bg-el-secondary-fixed',
  NORMAL: 'border-el-secondary text-el-secondary bg-el-secondary-fixed',
  LOW: 'border-el-outline text-el-on-surface-variant bg-el-surface-container',
};

const statusLabels: Record<string, string> = {
  PENDING: 'قيد الانتظار',
  IN_PROGRESS: 'قيد التنفيذ',
  COMPLETED: 'مكتمل',
  CANCELLED: 'ملغي',
};

export default function TaskTracking() {
  const [taskData, setTaskData] = useState<TaskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    async function fetchTasks() {
      try {
        const params = new URLSearchParams();
        if (filterDistrict) params.set('district', filterDistrict);
        if (filterStatus) params.set('status', filterStatus);
        const res = await fetch(`/api/tasks?${params.toString()}`);
        const data = await res.json();
        setTaskData(data);
      } catch (err) {
        console.error('Error fetching tasks:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, [filterDistrict, filterStatus]);

  const tasks = Array.isArray(taskData?.tasks) ? taskData.tasks : [];
  const statusCounts = Array.isArray(taskData?.statusCounts) ? taskData.statusCounts : [];

  const totalTasks = statusCounts.reduce((sum, sc) => sum + sc._count.id, 0);
  const pendingCount = statusCounts.find((sc) => sc.status === 'PENDING')?._count.id || 0;
  const inProgressCount = statusCounts.find((sc) => sc.status === 'IN_PROGRESS')?._count.id || 0;
  const completedCount = statusCounts.find((sc) => sc.status === 'COMPLETED')?._count.id || 0;

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-el-on-surface-variant">جاري التحميل...</div>;
  }

  return (
    <div>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-[32px] leading-[40px] font-bold text-el-primary mb-1" style={{ letterSpacing: '-0.02em' }}>
            نظام تتبع المهام الميدانية - ذي قار
          </h1>
          <p className="text-[14px] leading-[20px] text-el-on-surface-variant">
            إدارة وتوجيه فرق العمل الميدانية في محافظة ذي قار
          </p>
        </div>
        <button className="bg-el-primary text-el-on-primary px-4 py-2 rounded flex items-center gap-2 hover:opacity-90 transition-all shadow-sm">
          <PlusCircle className="w-[18px] h-[18px]" />
          <span className="text-[14px] leading-[20px] font-medium">إضافة مهمة جديدة</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-el-surface-container-low border border-el-outline-variant p-4 rounded-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[18px] leading-[24px] font-semibold text-el-on-surface">إجمالي المهام</span>
            <div className="p-1.5 bg-el-primary-container text-el-on-primary-container rounded">
              <ListChecks className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] leading-[40px] font-bold text-el-primary" style={{ letterSpacing: '-0.02em' }}>{totalTasks}</span>
            <span className="text-[12px] leading-[16px] text-el-on-surface-variant">في ذي قار</span>
          </div>
        </div>

        <div className="bg-el-surface-container-low border border-el-outline-variant p-4 rounded-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-el-secondary-container opacity-20 rounded-full blur-xl" />
          <div className="flex justify-between items-start mb-2 relative z-10">
            <span className="text-[18px] leading-[24px] font-semibold text-el-on-surface">مهام قيد التنفيذ</span>
            <div className="p-1.5 bg-el-secondary-container text-el-on-secondary-container rounded">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-[32px] leading-[40px] font-bold text-el-secondary" style={{ letterSpacing: '-0.02em' }}>{inProgressCount + pendingCount}</span>
            <span className="text-[12px] leading-[16px] text-el-outline">تحتاج متابعة</span>
          </div>
        </div>

        <div className="bg-el-surface-container-low border border-el-outline-variant p-4 rounded-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[18px] leading-[24px] font-semibold text-el-on-surface">مهام مكتملة</span>
            <div className="p-1.5 bg-[#d4edda] text-[#155724] rounded">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] leading-[40px] font-bold text-el-on-surface" style={{ letterSpacing: '-0.02em' }}>{completedCount}</span>
            <span className="text-[12px] leading-[16px] text-[#155724]">منجز</span>
          </div>
          <div className="w-full bg-el-surface-variant h-1.5 rounded mt-3 overflow-hidden">
            <div className="bg-el-primary h-full rounded" style={{ width: `${totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0}%` }} />
          </div>
        </div>

        <div className="bg-el-surface-container-low border border-el-outline-variant p-4 rounded-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[18px] leading-[24px] font-semibold text-el-on-surface">نسبة الإنجاز</span>
            <div className="p-1.5 bg-[#ffddb1] text-[#5d4217] rounded">
              <Timer className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] leading-[40px] font-bold text-el-on-surface" style={{ letterSpacing: '-0.02em' }}>
              {totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0}%
            </span>
            <span className="text-[12px] leading-[16px] text-el-on-surface-variant">من المهام</span>
          </div>
        </div>
      </div>

      {/* Main Content Area with Table and Filtering Sidebar */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 bg-el-surface border border-el-outline-variant rounded-sm overflow-hidden flex flex-col">
          <div className="p-3 bg-el-surface-container-lowest border-b border-el-outline-variant flex justify-between items-center bg-opacity-80 backdrop-blur-sm sticky top-0">
            <div className="flex items-center gap-2">
              <span className="text-[18px] leading-[24px] font-semibold">سجل المهام النشطة</span>
              <span className="px-2 py-0.5 bg-el-primary-fixed text-el-on-primary-fixed rounded-full text-[10px] font-medium" style={{ fontFamily: 'var(--font-geist-mono)' }}>LIVE</span>
            </div>
            <div className="flex gap-2">
              <button className="p-1.5 text-el-on-surface-variant border border-el-outline-variant rounded hover:bg-el-surface-container transition-colors">
                <Download className="w-[18px] h-[18px]" />
              </button>
              <button className="p-1.5 text-el-on-surface-variant border border-el-outline-variant rounded hover:bg-el-surface-container transition-colors">
                <SlidersHorizontal className="w-[18px] h-[18px]" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-el-surface-container-low border-b border-el-outline-variant">
                  <th className="py-2 px-3 text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface-variant w-12 text-center">حالة</th>
                  <th className="py-2 px-3 text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface-variant">الأولوية</th>
                  <th className="py-2 px-3 text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface-variant min-w-[200px]">عنوان المهمة</th>
                  <th className="py-2 px-3 text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface-variant">المندوب / المنطقة</th>
                  <th className="py-2 px-3 text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface-variant">التأثير المتوقع</th>
                  <th className="py-2 px-3 text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface-variant w-10">إجراء</th>
                </tr>
              </thead>
              <tbody className="text-[12px] leading-[16px] divide-y divide-el-outline-variant">
                {tasks.map((task, index) => {
                  const isCompleted = task.status === 'COMPLETED';
                  return (
                    <tr key={task.id} className={`hover:bg-el-surface-container-lowest transition-colors h-9 ${index % 2 === 1 ? 'bg-el-surface-container-low/30' : ''}`}>
                      <td className="py-1 px-3 text-center">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : task.status === 'IN_PROGRESS' ? 'bg-el-secondary-container/30 text-el-on-secondary-container' : 'bg-el-surface-variant text-el-on-surface-variant'}`}>
                          {statusLabels[task.status] || task.status}
                        </span>
                      </td>
                      <td className="py-1 px-3">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-medium ${priorityColors[task.priority] || ''}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${task.priority === 'URGENT' ? 'bg-[#dc3545]' : task.priority === 'HIGH' ? 'bg-el-secondary' : 'bg-el-outline'}`} />
                          {priorityLabels[task.priority] || task.priority}
                        </span>
                      </td>
                      <td className={`py-1 px-3 font-medium text-el-on-surface ${isCompleted ? 'line-through text-el-outline' : ''}`}>{task.title}</td>
                      <td className="py-1 px-3 text-el-on-surface-variant">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-el-primary-container text-el-on-primary-container flex items-center justify-center text-[10px] font-bold">
                            {task.assignedTo?.name?.charAt(0) || '؟'}
                          </div>
                          {task.assignedTo?.name || 'غير محدد'} <span className="text-el-outline text-[10px]">({task.district || 'ذي قار'})</span>
                        </div>
                      </td>
                      <td className="py-1 px-3">
                        <span className="text-el-secondary font-medium">{task.impactEstimate || '—'}</span>
                      </td>
                      <td className="py-1 px-3 text-center">
                        <button className="text-el-outline hover:text-el-primary transition-colors"><MoreVertical className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  );
                })}
                {tasks.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-el-on-surface-variant">لا توجد مهام</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-t border-el-outline-variant bg-el-surface-container-lowest text-center flex justify-between items-center text-[12px] leading-[16px] text-el-outline">
            <span>عرض {tasks.length} من أصل {totalTasks} مهمة</span>
          </div>
        </div>

        {/* Filtering Sidebar */}
        <aside className="w-full lg:w-72 bg-el-surface border border-el-outline-variant rounded-sm p-4 h-fit sticky top-16">
          <div className="flex items-center gap-2 mb-4 border-b border-el-outline-variant pb-2">
            <SlidersHorizontal className="w-5 h-5 text-el-primary" />
            <h3 className="text-[18px] leading-[24px] font-semibold">عوامل التصفية</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface-variant mb-1">القضاء</label>
              <div className="relative">
                <select
                  className="w-full bg-el-surface-container-low border border-el-outline-variant rounded p-2 text-[12px] leading-[16px] appearance-none pr-8 cursor-pointer"
                  value={filterDistrict}
                  onChange={(e) => setFilterDistrict(e.target.value)}
                >
                  <option value="">الكل</option>
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-el-outline pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface-variant mb-1">حالة المهمة</label>
              <div className="relative">
                <select
                  className="w-full bg-el-surface-container-low border border-el-outline-variant rounded p-2 text-[12px] leading-[16px] appearance-none pr-8 cursor-pointer"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">الكل</option>
                  <option value="PENDING">قيد الانتظار</option>
                  <option value="IN_PROGRESS">قيد التنفيذ</option>
                  <option value="COMPLETED">مكتمل</option>
                  <option value="CANCELLED">ملغي</option>
                </select>
                <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-el-outline pointer-events-none" />
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-el-outline-variant flex gap-2">
              <button
                onClick={() => { setFilterDistrict(''); setFilterStatus(''); }}
                className="flex-1 border border-el-outline-variant text-el-on-surface-variant py-1.5 rounded text-[12px] leading-[16px] hover:bg-el-surface-container"
              >
                إعادة ضبط
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

