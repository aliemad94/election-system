'use client';

import React, { useState, useEffect } from 'react';
import {
  Star,
  Phone,
  AlertTriangle,
  ShieldCheck,
  AlertCircle,
  UserCheck,
  BarChart3,
} from 'lucide-react';

interface DashboardData {
  totalVoters: number;
  votedCount: number;
  votedPercentage: number;
  districtStats: {
    district: string;
    totalVoters: number;
    votedCount: number;
    votedPercentage: number;
  }[];
  recentAlerts: {
    id: string;
    type: string;
    title: string;
    description: string | null;
    district: string | null;
    createdAt: string;
  }[];
}

interface VoterData {
  voters: {
    id: string;
    fullName: string;
    phoneNumber: string;
    district: string;
    confidenceScore: number;
    votedStatus: boolean;
    tribe: { name: string; influence: number } | null;
    _count: { recruits: number };
  }[];
  total: number;
}

export default function WarRoom() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [highValueVoters, setHighValueVoters] = useState<VoterData['voters']>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [dashRes, voterRes] = await Promise.all([
          fetch('/api/dashboard'),
          fetch('/api/voters?votedStatus=false&minConfidence=3&limit=10'),
        ]);
        const dashData = await dashRes.json();
        const voterData = await voterRes.json();
        setDashboardData(dashData);
        setHighValueVoters(Array.isArray(voterData?.voters) ? voterData.voters : []);
      } catch (err) {
        console.error('Error fetching war room data:', err);
      }
    }
    fetchData();
  }, []);

  const votedPercentage = dashboardData?.votedPercentage || 0;
  const districts = dashboardData?.districtStats || [];
  const alerts = dashboardData?.recentAlerts || [];

  return (
    <div
      className="min-h-[calc(100vh-6rem)] -m-4 rounded-sm overflow-hidden"
      style={{ backgroundColor: '#0b1c30', color: '#ffffff' }}
    >
      {/* War Room Header */}
      <div
        className="flex justify-between items-center px-4 h-12"
        style={{ backgroundColor: '#1a2b4b', borderBottom: '1px solid #364768' }}
      >
        <div className="flex items-center gap-4 w-full">
          <h1
            className="text-[20px] leading-[28px] font-semibold whitespace-nowrap"
            style={{ color: '#d8e2ff' }}
          >
            غرفة العمليات - ذي قار
          </h1>

          {/* Massive Horizontal Progress Bar */}
          <div className="flex-grow mx-8 flex flex-col justify-center hidden md:flex">
            <div className="flex justify-between items-end mb-1">
              <span className="text-[11px] leading-[16px] font-bold tracking-[0.05em]" style={{ color: '#d3e4fe' }}>
                نسبة الاقتراع العامة
              </span>
              <span className="text-[12px] leading-[16px] font-bold" style={{ color: '#F59E0B', fontFamily: 'var(--font-geist-mono)' }}>
                {votedPercentage}%
              </span>
            </div>
            <div className="h-4 w-full rounded-full overflow-hidden relative" style={{ backgroundColor: '#4e5e81' }}>
              <div className="h-full transition-all duration-1000 relative" style={{ width: `${votedPercentage}%`, backgroundColor: '#F59E0B' }}>
                <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <main className="p-2 grid grid-cols-12 gap-2 h-full">
        {/* Left Column: High-Value Targets */}
        <div className="col-span-12 lg:col-span-7 flex flex-col rounded-sm overflow-hidden" style={{ backgroundColor: '#1a2b4b', border: '1px solid #364768' }}>
          <div className="p-3 flex justify-between items-center" style={{ backgroundColor: 'rgba(11,28,48,0.5)', borderBottom: '1px solid #364768' }}>
            <h2 className="text-[18px] leading-[24px] font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5" style={{ color: '#F59E0B' }} />
              أهداف عالية القيمة (لم يصوتوا)
            </h2>
            <span className="text-[11px] leading-[16px] font-bold tracking-[0.05em] px-2 py-1 rounded" style={{ backgroundColor: '#ffdad6', color: '#93000a' }}>فرز مباشر</span>
          </div>
          <div className="flex-1 overflow-y-auto p-1">
            <table className="w-full text-right">
              <thead className="sticky top-0 z-10" style={{ backgroundColor: '#1a2b4b', borderBottom: '1px solid #364768' }}>
                <tr>
                  <th className="text-[11px] leading-[16px] font-bold tracking-[0.05em] p-2 w-10" style={{ color: '#d3e4fe' }}>الثقة</th>
                  <th className="text-[11px] leading-[16px] font-bold tracking-[0.05em] p-2" style={{ color: '#d3e4fe' }}>الاسم</th>
                  <th className="text-[11px] leading-[16px] font-bold tracking-[0.05em] p-2 text-center w-24" style={{ color: '#d3e4fe' }}>القضاء / العشيرة</th>
                  <th className="text-[11px] leading-[16px] font-bold tracking-[0.05em] p-2 text-center w-32" style={{ color: '#d3e4fe' }}>إجراء</th>
                </tr>
              </thead>
              <tbody style={{ color: '#ffffff' }}>
                {highValueVoters.slice(0, 5).map((voter, index) => (
                  <tr
                    key={voter.id}
                    className="transition-colors h-9"
                    style={{ borderBottom: '1px solid rgba(54,71,104,0.5)', backgroundColor: index % 2 === 1 ? 'rgba(11,28,48,0.3)' : 'transparent' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(11,28,48,0.3)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = index % 2 === 1 ? 'rgba(11,28,48,0.3)' : 'transparent'; }}
                  >
                    <td className="p-2 text-center">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < voter.confidenceScore ? 'fill-current' : ''}`} style={{ color: i < voter.confidenceScore ? '#F59E0B' : '#d3e4fe' }} />
                        ))}
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="text-[14px] leading-[20px] font-semibold">{voter.fullName}</div>
                      <div className="text-[12px] leading-[16px] font-medium" style={{ color: '#d3e4fe', fontFamily: 'var(--font-geist-mono)' }}>
                        {voter.phoneNumber.replace(/(\+964)(\d{3})(\d{3})(\d{4})/, '$1 $2 *** $4')}
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      <span className="text-[12px] leading-[16px] font-medium px-2 py-0.5 rounded" style={{ backgroundColor: voter.tribe ? '#3e2700' : 'rgba(11,28,48)', color: voter.tribe ? '#F59E0B' : '#d3e4fe', border: voter.tribe ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(117,119,127,0.3)', fontFamily: 'var(--font-geist-mono)' }}>
                        {voter.tribe ? voter.tribe.name : voter.district}
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      <button className="text-white border px-3 py-1 rounded text-[12px] leading-[16px] flex items-center gap-1 w-full justify-center hover:opacity-90 transition-colors" style={{ backgroundColor: '#031635', borderColor: '#b6c6ef' }}>
                        <Phone className="w-4 h-4" />
                        اتصل
                      </button>
                    </td>
                  </tr>
                ))}
                {highValueVoters.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center" style={{ color: '#d3e4fe' }}>لا توجد أهداف عالية القيمة</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-2 h-full">
          {/* District Turnout Leaderboard */}
          <div className="flex-1 rounded-sm overflow-hidden flex flex-col max-h-[60%]" style={{ backgroundColor: '#1a2b4b', border: '1px solid #364768' }}>
            <div className="p-3 flex justify-between items-center" style={{ backgroundColor: 'rgba(11,28,48,0.5)', borderBottom: '1px solid #364768' }}>
              <h2 className="text-[18px] leading-[24px] font-semibold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5" style={{ color: '#10B981' }} />
                تصدر الأقضية
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {districts
                .sort((a, b) => b.votedPercentage - a.votedPercentage)
                .map((ds, index) => (
                  <div
                    key={ds.district}
                    className="p-2 rounded flex items-center justify-between"
                    style={{
                      border: ds.votedPercentage < 30 ? '1px solid rgba(245,158,11,0.3)' : '1px solid #364768',
                      backgroundColor: ds.votedPercentage < 30 ? 'rgba(62,39,0,0.2)' : 'rgba(11,28,48,0.3)',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[12px] leading-[16px] font-bold w-6 text-center"
                        style={{
                          color: index === 0 ? '#10B981' : ds.votedPercentage < 30 ? '#F59E0B' : '#d3e4fe',
                          fontFamily: 'var(--font-geist-mono)',
                        }}
                      >
                        {index + 1}
                      </span>
                      <div
                        className="text-[14px] leading-[20px] font-semibold"
                        style={{ color: ds.votedPercentage < 30 ? '#F59E0B' : '#ffffff' }}
                      >
                        {ds.district}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#4e5e81' }}>
                        <div
                          className="h-full"
                          style={{
                            width: `${ds.votedPercentage}%`,
                            backgroundColor: index === 0 ? '#10B981' : ds.votedPercentage < 30 ? '#F59E0B' : '#b6c6ef',
                          }}
                        />
                      </div>
                      <span
                        className="text-[12px] leading-[16px] font-medium"
                        style={{
                          color: index === 0 ? '#10B981' : ds.votedPercentage < 30 ? '#F59E0B' : '#ffffff',
                          fontFamily: 'var(--font-geist-mono)',
                        }}
                      >
                        {ds.votedPercentage}%
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Conflict Alerts */}
          <div className="flex-1 rounded-sm flex flex-col overflow-hidden relative" style={{ backgroundColor: '#1a2b4b', border: '1px solid rgba(245,158,11,0.5)' }}>
            {/* Header */}
            <div className="absolute top-0 w-full p-3 backdrop-blur-sm flex justify-between items-center z-10" style={{ backgroundColor: 'rgba(26,43,75,0.8)', borderBottom: '1px solid rgba(245,158,11,0.3)' }}>
              <h2 className="text-[18px] leading-[24px] font-semibold flex items-center gap-2" style={{ color: '#F59E0B' }}>
                <AlertTriangle className="w-5 h-5" />
                سجل التنبيهات المباشر
              </h2>
              <span className="relative flex h-3 w-3">
                <span className="animate-alert-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: '#F59E0B' }} />
                <span className="relative inline-flex rounded-full h-3 w-3" style={{ backgroundColor: '#F59E0B' }} />
              </span>
            </div>
            <div className="flex-1 overflow-y-auto pt-16 p-1 space-y-1">
              {alerts.map((alert) => {
                const isGreen = alert.type === 'INFO';
                const isAmber = alert.type === 'WARNING';
                const borderColor = isGreen ? '#10B981' : isAmber ? '#F59E0B' : '#ffdad6';
                const Icon = isGreen ? ShieldCheck : isAmber ? AlertCircle : AlertTriangle;

                return (
                  <div key={alert.id} className="p-2 rounded-r flex gap-2 items-start" style={{ backgroundColor: 'rgba(11,28,48,0.8)', borderLeft: `2px solid ${borderColor}` }}>
                    <span className="text-[11px] font-medium shrink-0" style={{ color: '#d3e4fe', fontFamily: 'var(--font-geist-mono)' }}>
                      {new Date(alert.createdAt).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: borderColor }} />
                    <span className="text-[11px] font-medium text-white">
                      {alert.title} {alert.district && `- ${alert.district}`}
                    </span>
                  </div>
                );
              })}
              {alerts.length === 0 && (
                <div className="p-3 text-center" style={{ color: '#d3e4fe' }}>لا توجد تنبيهات</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
