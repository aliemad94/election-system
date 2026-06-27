'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Star,
  Plus,
  Search,
  ChevronDown,
  MapPin,
  Phone,
  TrendingUp,
  Crown,
  X,
} from 'lucide-react';

interface Tribe {
  id: string;
  name: string;
  leaderName: string | null;
  leaderPhone: string | null;
  influence: number;
  governorate: string;
  district: string | null;
  notes: string | null;
  voterCount: number;
  votedCount: number;
  votedPercentage: number;
  avgConfidence: number;
  createdAt: string;
}

const DISTRICTS = [
  'الناصرية',
  'الشطرة',
  'سوق الشيوخ',
  'الرفاعي',
  'الجبايش',
  'قلعة سكر',
  'الغراف',
  'النصر',
  'الفجر',
  'الفهود',
  'البطحاء',
  'سيد دخيل',
  'الإصلاح',
  'الدواية',
  'الفضلية',
  'العكيكة',
  'الطار',
  'كرمة بني سعيد',
  'أور',
  'المنار',
  'الحمار'
];

export default function TribalManagement() {
  const [tribes, setTribes] = useState<Tribe[]>([]);
  const [allTribesForStats, setAllTribesForStats] = useState<Tribe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedTribe, setSelectedTribe] = useState<Tribe | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Form state
  const [newTribe, setNewTribe] = useState({
    name: '',
    leaderName: '',
    leaderPhone: '',
    influence: 3,
    district: 'الناصرية',
    notes: '',
  });

  const fetchAllTribes = useCallback(async () => {
    try {
      const res = await fetch(`/api/tribes`);
      const data = await res.json();
      setAllTribesForStats(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching all tribes for stats:', err);
    }
  }, []);

  const fetchTribes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      params.set('limit', '12'); // 12 items per page matches 3-column layout
      if (selectedDistrict) params.set('district', selectedDistrict);
      if (searchQuery) params.set('search', searchQuery);
      
      const res = await fetch(`/api/tribes?${params.toString()}`);
      const data = await res.json();
      if (data && data.list) {
        setTribes(data.list);
        setTotalPages(data.totalPages || 1);
        setTotalItems(data.total || 0);
      } else {
        setTribes(Array.isArray(data) ? data : []);
        setTotalPages(1);
        setTotalItems(Array.isArray(data) ? data.length : 0);
      }
    } catch (err) {
      console.error('Error fetching tribes:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedDistrict, searchQuery]);

  // Reset page when search filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDistrict, searchQuery]);

  // Load paginated list
  useEffect(() => {
    fetchTribes();
  }, [fetchTribes]);

  // Load stats once on mount
  useEffect(() => {
    fetchAllTribes();
  }, [fetchAllTribes]);

  const handleAddTribe = async () => {
    try {
      const res = await fetch('/api/tribes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTribe),
      });
      if (res.ok) {
        setShowAddDialog(false);
        setNewTribe({ name: '', leaderName: '', leaderPhone: '', influence: 3, district: 'الناصرية', notes: '' });
        fetchTribes();
        fetchAllTribes(); // Refresh summaries
      }
    } catch (err) {
      console.error('Error adding tribe:', err);
    }
  };

  const filteredTribes = tribes;

  const maxInfluence = allTribesForStats.length > 0 ? Math.max(...allTribesForStats.map((t) => t.influence), 1) : 5;

  return (
    <div className="flex flex-col gap-4 max-w-[1440px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[24px] leading-[32px] font-bold text-el-primary">إدارة العشائر</h1>
          <p className="text-[12px] leading-[16px] text-el-on-surface-variant mt-1">
            العشائر والحمائل في محافظة ذي قار - المحرك الرئيسي للانتخابات
          </p>
        </div>
        <button
          onClick={() => setShowAddDialog(true)}
          className="bg-el-primary text-el-on-primary px-4 py-2 rounded flex items-center gap-2 hover:opacity-90 transition-all shadow-sm"
        >
          <Plus className="w-[18px] h-[18px]" />
          <span className="text-[14px] leading-[20px] font-medium">إضافة عشيرة</span>
        </button>
      </div>

      {/* Influence Ranking Summary */}
      <section className="bg-el-surface-container-lowest border border-el-outline-variant rounded-sm p-4">
        <h3 className="text-[18px] leading-[24px] font-semibold text-el-on-surface mb-3 flex items-center gap-2">
          <Crown className="w-5 h-5 text-el-secondary" />
          ترتيب التأثير العشائري
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {[...allTribesForStats]
            .sort((a, b) => b.influence - a.influence)
            .slice(0, 5)
            .map((tribe, index) => (
              <div
                key={tribe.id}
                className={`p-3 rounded border ${
                  index === 0
                    ? 'border-el-secondary bg-el-secondary-container/10'
                    : 'border-el-outline-variant bg-el-surface-container-low'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-[12px] leading-[16px] font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      index === 0
                        ? 'bg-el-secondary text-white'
                        : index === 1
                          ? 'bg-el-primary-fixed text-el-on-primary-fixed'
                          : 'bg-el-surface-variant text-el-on-surface-variant'
                    }`}
                    style={{ fontFamily: 'var(--font-geist-mono)' }}
                  >
                    {index + 1}
                  </span>
                  <span className="text-[14px] leading-[20px] font-semibold text-el-on-surface truncate">
                    {tribe.name}
                  </span>
                </div>
                <div className="flex items-center gap-1 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < tribe.influence ? 'text-el-secondary fill-current' : 'text-el-outline-variant'}`}
                    />
                  ))}
                </div>
                <div className="text-[11px] leading-[16px] text-el-on-surface-variant">
                  {tribe.voterCount} ناخب · {tribe.district}
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 text-el-outline w-4 h-4" />
          <input
            className="w-full bg-el-surface-container-lowest border border-el-outline-variant rounded h-8 pl-3 pr-8 text-[12px] leading-[16px] focus:outline-none focus:border-el-primary"
            placeholder="البحث عن عشيرة أو شيخ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative">
          <select
            className="appearance-none bg-el-surface-container border border-el-outline-variant text-el-on-surface text-[12px] leading-[16px] rounded pl-8 pr-3 py-1 h-8 focus:outline-none focus:border-el-primary cursor-pointer"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
          >
            <option value="">جميع الأقضية</option>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-el-outline pointer-events-none" />
        </div>
      </div>

      {/* Tribe Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64 text-el-on-surface-variant">جاري التحميل...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTribes.map((tribe) => (
            <div
              key={tribe.id}
              className="bg-el-surface-container-lowest border border-el-outline-variant rounded-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedTribe(tribe)}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-[16px] leading-[24px] font-semibold text-el-on-surface">{tribe.name}</h3>
                  {tribe.leaderName && (
                    <p className="text-[12px] leading-[16px] text-el-on-surface-variant flex items-center gap-1">
                      <Crown className="w-3 h-3" /> {tribe.leaderName}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < tribe.influence ? 'text-el-secondary fill-current' : 'text-el-outline-variant'}`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[12px] leading-[16px]">
                  <span className="text-el-on-surface-variant">عدد الناخبين</span>
                  <span className="text-el-on-surface font-semibold" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                    {tribe.voterCount}
                  </span>
                </div>
                <div className="flex justify-between text-[12px] leading-[16px]">
                  <span className="text-el-on-surface-variant">صوّتوا</span>
                  <span className="text-el-on-surface font-semibold" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                    {tribe.votedCount} ({tribe.votedPercentage}%)
                  </span>
                </div>
                <div className="w-full bg-el-surface-variant h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-el-primary h-full transition-all"
                    style={{ width: `${tribe.votedPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[12px] leading-[16px]">
                  <span className="text-el-on-surface-variant">متوسط الثقة</span>
                  <span className="text-el-secondary font-semibold" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                    {tribe.avgConfidence} ⭐
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-3 pt-3 border-t border-el-outline-variant">
                {tribe.district && (
                  <span className="text-[10px] leading-[14px] bg-el-surface-container text-el-on-surface-variant px-2 py-0.5 rounded flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {tribe.district}
                  </span>
                )}
                {tribe.leaderPhone && (
                  <span className="text-[10px] leading-[14px] bg-el-surface-container text-el-on-surface-variant px-2 py-0.5 rounded flex items-center gap-1" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                    <Phone className="w-3 h-3" /> {tribe.leaderPhone}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center bg-el-surface-container-lowest border border-el-outline-variant rounded-sm p-4 gap-4">
          <div className="text-[12px] text-el-on-surface-variant">
            عرض {filteredTribes.length} من أصل {totalItems} عشيرة (الصفحة {currentPage} من {totalPages})
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 h-8 text-[12px] font-medium border border-el-outline-variant rounded hover:bg-el-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer text-el-on-surface"
            >
              السابق
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pNum = idx + 1;
              return (
                <button
                  key={pNum}
                  onClick={() => setCurrentPage(pNum)}
                  className={`w-8 h-8 text-[12px] font-medium rounded transition-colors cursor-pointer ${
                    currentPage === pNum
                      ? 'bg-el-primary text-el-on-primary font-bold'
                      : 'border border-el-outline-variant text-el-on-surface hover:bg-el-surface-container'
                  }`}
                >
                  {pNum}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 h-8 text-[12px] font-medium border border-el-outline-variant rounded hover:bg-el-surface-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer text-el-on-surface"
            >
              التالي
            </button>
          </div>
        </div>
      )}

      {/* District Distribution */}
      <section className="bg-el-surface-container-lowest border border-el-outline-variant rounded-sm p-4">
        <h3 className="text-[18px] leading-[24px] font-semibold text-el-on-surface mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-el-primary" />
          توزيع العشائر حسب الأقضية
        </h3>
        <div className="space-y-3">
          {DISTRICTS.map((district) => {
            const districtTribes = allTribesForStats.filter((t) => t.district === district);
            const totalVotersInDistrict = districtTribes.reduce((sum, t) => sum + t.voterCount, 0);
            const maxVoters = Math.max(...DISTRICTS.map((d) => allTribesForStats.filter((t) => t.district === d).reduce((s, t) => s + t.voterCount, 0)), 1);
            return (
              <div key={district}>
                <div className="flex justify-between text-[12px] leading-[16px] mb-1">
                  <span className="text-el-on-surface">{district} ({districtTribes.length} عشيرة)</span>
                  <span className="font-medium text-el-on-surface-variant" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                    {totalVotersInDistrict} ناخب
                  </span>
                </div>
                <div className="h-2 w-full bg-el-surface-variant rounded-full overflow-hidden">
                  <div
                    className="bg-el-primary h-full transition-all"
                    style={{ width: `${(totalVotersInDistrict / maxVoters) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Add Tribe Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-el-surface-container-lowest rounded-sm border border-el-outline-variant w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[18px] leading-[24px] font-semibold text-el-on-surface">إضافة عشيرة جديدة</h3>
              <button onClick={() => setShowAddDialog(false)} className="text-el-on-surface-variant hover:text-el-on-surface">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface-variant mb-1">اسم العشيرة *</label>
                <input
                  className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] leading-[16px] focus:outline-none focus:border-el-primary"
                  value={newTribe.name}
                  onChange={(e) => setNewTribe({ ...newTribe, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface-variant mb-1">اسم الشيخ</label>
                <input
                  className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] leading-[16px] focus:outline-none focus:border-el-primary"
                  value={newTribe.leaderName}
                  onChange={(e) => setNewTribe({ ...newTribe, leaderName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface-variant mb-1">هاتف الشيخ</label>
                <input
                  className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] leading-[16px] focus:outline-none focus:border-el-primary"
                  placeholder="+964"
                  value={newTribe.leaderPhone}
                  onChange={(e) => setNewTribe({ ...newTribe, leaderPhone: e.target.value })}
                  style={{ fontFamily: 'var(--font-geist-mono)' }}
                />
              </div>
              <div>
                <label className="block text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface-variant mb-1">القضاء</label>
                <div className="relative">
                  <select
                    className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 text-[12px] leading-[16px] appearance-none pr-8 focus:outline-none focus:border-el-primary cursor-pointer"
                    value={newTribe.district}
                    onChange={(e) => setNewTribe({ ...newTribe, district: e.target.value })}
                  >
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-el-outline pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface-variant mb-1">التأثير (1-5)</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onClick={() => setNewTribe({ ...newTribe, influence: s })}
                      className={`flex-1 h-8 border rounded text-[12px] leading-[16px] font-medium transition-colors ${
                        newTribe.influence >= s
                          ? 'border-el-secondary bg-el-secondary-container text-el-on-secondary-container'
                          : 'border-el-outline-variant text-el-on-surface-variant'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[11px] leading-[16px] font-bold tracking-[0.05em] text-el-on-surface-variant mb-1">ملاحظات</label>
                <textarea
                  className="w-full bg-el-surface border border-el-outline-variant rounded p-2 text-[12px] leading-[16px] h-16 resize-none focus:outline-none focus:border-el-primary"
                  value={newTribe.notes}
                  onChange={(e) => setNewTribe({ ...newTribe, notes: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4 pt-4 border-t border-el-outline-variant">
              <button
                onClick={handleAddTribe}
                className="flex-1 bg-el-primary text-el-on-primary py-2 rounded text-[14px] leading-[20px] font-medium hover:opacity-90"
              >
                إضافة
              </button>
              <button
                onClick={() => setShowAddDialog(false)}
                className="flex-1 border border-el-outline-variant text-el-on-surface-variant py-2 rounded text-[14px] leading-[20px] hover:bg-el-surface-container"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tribe Detail Dialog */}
      {selectedTribe && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-el-surface-container-lowest rounded-sm border border-el-outline-variant w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[20px] leading-[28px] font-semibold text-el-on-surface">{selectedTribe.name}</h3>
              <button onClick={() => setSelectedTribe(null)} className="text-el-on-surface-variant hover:text-el-on-surface">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-el-secondary" />
                <span className="text-[14px] leading-[20px] text-el-on-surface">{selectedTribe.leaderName || 'غير محدد'}</span>
              </div>
              {selectedTribe.leaderPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-el-on-surface-variant" />
                  <span className="text-[14px] leading-[20px] text-el-on-surface" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                    {selectedTribe.leaderPhone}
                  </span>
                </div>
              )}
              {selectedTribe.district && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-el-on-surface-variant" />
                  <span className="text-[14px] leading-[20px] text-el-on-surface">{selectedTribe.district}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <span className="text-[14px] leading-[20px] text-el-on-surface-variant">التأثير:</span>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < selectedTribe.influence ? 'text-el-secondary fill-current' : 'text-el-outline-variant'}`}
                  />
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-el-outline-variant">
                <div className="text-center p-2 bg-el-surface-container rounded">
                  <div className="text-[20px] leading-[28px] font-bold text-el-primary" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                    {selectedTribe.voterCount}
                  </div>
                  <div className="text-[11px] leading-[16px] text-el-on-surface-variant">ناخب</div>
                </div>
                <div className="text-center p-2 bg-el-surface-container rounded">
                  <div className="text-[20px] leading-[28px] font-bold text-el-on-surface" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                    {selectedTribe.votedCount}
                  </div>
                  <div className="text-[11px] leading-[16px] text-el-on-surface-variant">صوّت</div>
                </div>
                <div className="text-center p-2 bg-el-surface-container rounded">
                  <div className="text-[20px] leading-[28px] font-bold text-el-secondary" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                    {selectedTribe.votedPercentage}%
                  </div>
                  <div className="text-[11px] leading-[16px] text-el-on-surface-variant">نسبة</div>
                </div>
              </div>
              {selectedTribe.notes && (
                <div className="pt-3 border-t border-el-outline-variant">
                  <span className="text-[12px] leading-[16px] text-el-on-surface-variant">{selectedTribe.notes}</span>
                </div>
              )}
            </div>
            <button
              onClick={() => setSelectedTribe(null)}
              className="w-full mt-4 pt-4 border-t border-el-outline-variant border-el-primary text-el-primary py-2 rounded text-[14px] leading-[20px] font-medium hover:bg-el-primary-container"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

