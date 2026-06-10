'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Eye,
  Vote,
  Navigation,
  Camera,
  CheckCircle,
  Map,
  AlertTriangle,
  LayoutDashboard,
  ClipboardList,
} from 'lucide-react';

interface VoterData {
  voters: {
    id: string;
    fullName: string;
    phoneNumber: string;
    district: string;
    confidenceScore: number;
    votedStatus: boolean;
    tribe: { name: string; influence: number } | null;
  }[];
  total: number;
}

interface TaskData {
  tasks: {
    id: string;
    title: string;
    priority: string;
    status: string;
    district: string | null;
  }[];
}

export default function FieldAgentPortal() {
  const [voteStatus, setVoteStatus] = useState(false);
  const [voters, setVoters] = useState<VoterData['voters']>([]);
  const [tasks, setTasks] = useState<TaskData['tasks']>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [voterRes, taskRes] = await Promise.all([
          fetch('/api/voters?limit=10'),
          fetch('/api/tasks?status=PENDING&limit=3'),
        ]);
        const voterData = await voterRes.json();
        const taskData = await taskRes.json();
        setVoters(voterData.voters || []);
        setTasks(taskData.tasks || []);
      } catch (err) {
        console.error('Error fetching field agent data:', err);
      }
    }
    fetchData();
  }, []);

  const currentTask = tasks[0];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Agent Profile & Performance */}
      <section className="bg-el-surface-container-lowest border border-el-outline-variant rounded p-3 mb-3">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-[18px] leading-[24px] font-semibold text-el-on-surface">مندوب ميداني</h2>
            <p className="text-[12px] leading-[16px] text-el-on-surface-variant">المنطقة المخصصة: ذي قار</p>
          </div>
          <div className="bg-el-primary-container text-el-on-primary-container px-2 py-1 rounded text-[11px] leading-[16px] font-bold tracking-[0.05em]">
            مندوب ميداني
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[12px] leading-[16px] text-el-on-surface-variant mb-1">
            <span>المهام المنجزة اليوم</span>
            <span>3 / 5</span>
          </div>
          <div className="w-full bg-el-surface-container-highest rounded-full h-2">
            <div className="bg-el-primary h-2 rounded-full" style={{ width: '60%' }} />
          </div>
        </div>
      </section>

      {/* Current Task Card */}
      {currentTask && (
        <section className="bg-el-surface-container-lowest border border-el-primary rounded p-3 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] relative overflow-hidden mb-3">
          <div className="absolute top-0 left-0 w-1 h-full bg-el-primary" />
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-el-primary" />
              <h3 className="text-[18px] leading-[24px] font-semibold text-el-on-surface">المهمة الحالية</h3>
            </div>
            <span className="bg-el-error-container text-el-error text-[11px] leading-[16px] font-bold tracking-[0.05em] px-2 py-1 rounded" style={{ color: '#ba1a1a', backgroundColor: '#ffdad6' }}>
              {currentTask.priority === 'URGENT' ? 'عاجل' : currentTask.priority === 'HIGH' ? 'عالي' : 'عادي'}
            </span>
          </div>
          <p className="text-[14px] leading-[20px] text-el-on-surface mb-3">{currentTask.title}</p>
          <div className="flex gap-2">
            <button className="flex-1 bg-el-primary text-el-on-primary text-[12px] leading-[16px] py-2 rounded flex justify-center items-center gap-1 active:scale-95 transition-transform">
              <Navigation className="w-4 h-4" />
              الحصول على الاتجاهات
            </button>
          </div>
        </section>
      )}

      {/* Voter Search & List */}
      <section className="bg-el-surface-container-lowest border border-el-outline-variant rounded p-3 mb-3">
        <h3 className="text-[18px] leading-[24px] font-semibold text-el-on-surface mb-2">البحث عن الناخبين</h3>
        <div className="relative mb-3">
          <Search className="absolute right-2 top-2 w-4 h-4 text-el-on-surface-variant" />
          <input
            className="w-full bg-el-surface border border-el-outline-variant rounded h-8 pl-2 pr-8 text-[12px] leading-[16px] focus:outline-none focus:border-el-primary"
            placeholder="البحث بالاسم أو رقم الهاتف..."
            type="text"
          />
        </div>
        <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
          {voters.slice(0, 6).map((voter) => (
            <div key={voter.id} className="flex justify-between items-center p-2 border border-el-outline-variant rounded bg-el-surface-bright">
              <div className="flex flex-col">
                <span className="text-[14px] leading-[20px] text-el-on-surface">{voter.fullName}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] leading-[16px] font-medium text-el-on-surface-variant" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                    {voter.phoneNumber}
                  </span>
                  {voter.tribe && (
                    <span className="text-[10px] leading-[14px] bg-el-surface-container text-el-on-surface-variant px-1.5 py-0.5 rounded">
                      {voter.tribe.name}
                    </span>
                  )}
                </div>
              </div>
              {voter.votedStatus ? (
                <span className="bg-el-secondary-container text-el-on-secondary-container text-[11px] leading-[16px] font-bold tracking-[0.05em] px-2 py-1 rounded border border-el-secondary">تم التحقق</span>
              ) : (
                <button className="text-el-primary p-1 active:scale-95 transition-transform bg-el-surface-container-high rounded">
                  <Eye className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Verification Flow */}
      <section className="bg-el-surface-container-lowest border border-el-outline-variant rounded p-3 mb-3">
        <h3 className="text-[18px] leading-[24px] font-semibold text-el-on-surface mb-3 flex items-center gap-2">
          <Vote className="w-5 h-5 text-el-error" />
          تحديث حالة التصويت
        </h3>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[14px] leading-[20px] text-el-on-surface">حالة الاقتراع</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={voteStatus}
                onChange={(e) => setVoteStatus(e.target.checked)}
              />
              <div className="w-11 h-6 bg-el-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-el-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-el-primary" />
              <span className={`ms-3 text-[12px] leading-[16px] ${voteStatus ? 'text-el-primary font-bold' : 'text-el-on-surface-variant'}`}>
                تم الاقتراع
              </span>
            </label>
          </div>

          <div className="flex items-center gap-2 bg-el-surface-container p-2 rounded border border-el-outline-variant">
            <CheckCircle className="w-5 h-5 fill-[#166534] text-white" />
            <div className="flex flex-col">
              <span className="text-[14px] leading-[20px] text-el-on-surface">التحقق من الموقع (GPS)</span>
              <span className="text-[12px] leading-[16px] text-el-on-surface-variant">تطابق الموقع - قرب مركز الاقتراع</span>
            </div>
          </div>

          <div className="border border-dashed border-el-outline-variant rounded p-4 flex flex-col items-center justify-center gap-2 bg-el-surface-bright cursor-pointer hover:bg-el-surface-container-low transition-colors">
            <Camera className="w-8 h-8 text-el-primary" />
            <span className="text-[12px] leading-[16px] text-el-on-surface-variant">تحميل إثبات (صورة الحبر)</span>
          </div>

          <button className="w-full bg-el-primary text-el-on-primary text-[14px] leading-[20px] py-2 rounded active:scale-95 transition-transform mt-2">
            تأكيد وتسجيل
          </button>
        </div>
      </section>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-el-surface-container border-t border-el-outline-variant z-50 flex justify-around items-center h-16 pb-2 pt-2">
        <div className="flex flex-col items-center justify-center w-full h-full cursor-pointer text-el-on-surface-variant hover:bg-el-surface-container-high transition-colors">
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-bold tracking-[0.05em]">الرئيسية</span>
        </div>
        <div className="flex flex-col items-center justify-center w-full h-full cursor-pointer text-el-primary font-bold border-t-2 border-el-primary bg-el-surface-container-high">
          <Vote className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-bold tracking-[0.05em]">المهام</span>
        </div>
        <div className="flex flex-col items-center justify-center w-full h-full cursor-pointer text-el-on-surface-variant hover:bg-el-surface-container-high transition-colors">
          <Map className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-bold tracking-[0.05em]">الخريطة</span>
        </div>
        <div className="flex flex-col items-center justify-center w-full h-full cursor-pointer text-el-on-surface-variant hover:bg-el-surface-container-high transition-colors relative">
          <AlertTriangle className="w-5 h-5" />
          <span className="absolute top-1 right-3 w-2 h-2 bg-el-error rounded-full" />
          <span className="text-[10px] mt-1 font-bold tracking-[0.05em]">تنبيهات</span>
        </div>
      </nav>
    </div>
  );
}
