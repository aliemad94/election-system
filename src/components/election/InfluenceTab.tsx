'use client';

import React from 'react';
import {
  Crown, Medal, Star, Shield, Users, TrendingUp,
  Target, Heart, AlertTriangle, MessageSquare, ThumbsUp,
  Eye, Zap, Award
} from 'lucide-react';

// ═══════════════════════════════════════════════════════
// مكوّن مساعد: بطاقة تصنيف
// ═══════════════════════════════════════════════════════
function ClassificationCard({ label, count, total, color, bgColor, icon: Icon }: {
  label: string; count: number; total: number; color: string; bgColor: string; icon: any;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className={`${bgColor} border border-el-outline-variant rounded-lg p-3 text-center`}>
      <Icon className={`w-4 h-4 mx-auto mb-1 ${color}`} />
      <div className={`text-lg font-bold ${color}`}>{count}</div>
      <div className="text-[11px] font-semibold text-el-on-surface mb-0.5">{label}</div>
      <div className="text-[10px] text-el-on-surface-variant">{pct}% من المفاتيح</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// مكوّن مساعد: شريط تقدم لبُعد تقييمي
// ═══════════════════════════════════════════════════════
function DimensionBar({ label, weight, avg, icon: Icon, color }: {
  label: string; weight: number; avg: number; icon: any; color: string;
}) {
  const pct = Math.round((avg / 5) * 100);
  return (
    <div className="flex items-center gap-2 py-1">
      <Icon className={`w-3.5 h-3.5 ${color} shrink-0`} />
      <span className="text-[11px] text-el-on-surface w-[88px] shrink-0 truncate">{label}</span>
      <span className="text-[10px] text-el-on-surface-variant w-[28px] text-right shrink-0">{weight}%</span>
      <div className="flex-1 h-1.5 bg-el-surface-container-highest rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color.replace('text-','bg-')}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-mono text-el-on-surface w-[24px] text-right shrink-0">{avg.toFixed(1)}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 5. النفوذ الاجتماعي والسياسي — نظام الأبعاد التسعة
// ═══════════════════════════════════════════════════════
export default function InfluenceTab({ data }: { data: any }) {
  const d = data || {};
  const cs = d.classificationStats || { weak: 0, acceptable: 0, good: 0, strong: 0, total: 0 };
  const dims = d.dimensionAverages;
  const topKeys = d.topInfluenceKeys || [];

  return (
    <div className="flex flex-col gap-4">

      {/* ═══ القسم الأول: تصنيف المفاتيح ═══ */}
      <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-4">
        <h3 className="text-[13px] font-bold text-el-on-surface mb-3 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-500" />
          توزيع تصنيف المفاتيح الانتخابية حسب القوة النهائية
        </h3>
        <div className="grid grid-cols-4 gap-2">
          <ClassificationCard label="ضعيف" count={cs.weak} total={cs.total} color="text-red-500" bgColor="bg-red-50" icon={AlertTriangle} />
          <ClassificationCard label="مقبول" count={cs.acceptable} total={cs.total} color="text-yellow-500" bgColor="bg-yellow-50" icon={ThumbsUp} />
          <ClassificationCard label="جيد" count={cs.good} total={cs.total} color="text-blue-500" bgColor="bg-blue-50" icon={Star} />
          <ClassificationCard label="قوي" count={cs.strong} total={cs.total} color="text-green-500" bgColor="bg-green-50" icon={Crown} />
        </div>
        <div className="mt-2 text-[10px] text-el-on-surface-variant text-center">
          المعادلة: Σ(الدرجة × الوزن) × (إجمالي الأصوات ÷ 50) | الأوزان حسب المواصفة المرجعية
        </div>
      </div>

      {/* ═══ القسم الثاني: الأبعاد التسعة ومتوسطاتها ═══ */}
      {dims && (
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-el-on-surface mb-3 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-purple-500" />
            الأبعاد التقييمية التسعة ومتوسطات المفاتيح
          </h3>
          <div className="space-y-0.5">
            <DimensionBar label="مستوى الولاء" weight={20} avg={dims.loyalty} icon={Heart} color="text-red-500" />
            <DimensionBar label="مستوى التأثير" weight={20} avg={dims.influence} icon={Zap} color="text-orange-500" />
            <DimensionBar label="القدرة على التحشيد" weight={15} avg={dims.mobilization} icon={Users} color="text-blue-500" />
            <DimensionBar label="حماية الأصوات" weight={15} avg={dims.protection} icon={Shield} color="text-indigo-500" />
            <DimensionBar label="أسباب الدعم" weight={10} avg={dims.support} icon={ThumbsUp} color="text-green-500" />
            <DimensionBar label="الاحتياجات" weight={5} avg={dims.needs} icon={AlertTriangle} color="text-amber-500" />
            <DimensionBar label="ملاحظات سياسية" weight={5} avg={dims.political} icon={MessageSquare} color="text-cyan-500" />
            <DimensionBar label="ملاحظات تنظيمية" weight={5} avg={dims.organizational} icon={Target} color="text-teal-500" />
            <DimensionBar label="ملاحظات عامة" weight={5} avg={dims.general} icon={Eye} color="text-slate-500" />
          </div>
        </div>
      )}

      {/* ═══ القسم الثالث: أعلى المفاتيح تأثيراً ═══ */}
      {topKeys.length > 0 && (
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg overflow-hidden">
          <div className="bg-el-surface-container px-4 py-2 border-b border-el-outline-variant">
            <h3 className="text-[13px] font-bold text-el-on-surface flex items-center gap-1.5">
              <Medal className="w-4 h-4 text-amber-500" />
              أعلى المفاتيح من حيث القوة النهائية
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-[11px]">
              <thead className="bg-el-surface-container text-[10px] text-el-on-surface-variant">
                <tr>
                  <th className="px-2 py-1.5 font-normal">#</th>
                  <th className="px-2 py-1.5 font-normal">الاسم</th>
                  <th className="px-2 py-1.5 text-center font-normal">التصنيف</th>
                  <th className="px-2 py-1.5 text-center font-normal">القوة النهائية</th>
                  <th className="px-2 py-1.5 text-center font-normal">أصوات صافية</th>
                  <th className="px-2 py-1.5 text-center font-normal">ولاء</th>
                  <th className="px-2 py-1.5 text-center font-normal">تأثير</th>
                  <th className="px-2 py-1.5 text-center font-normal">تحشيد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-el-outline-variant/20">
                {topKeys.map((k: any, idx: number) => {
                  const clsColor =
                    k.classification === 'قوي' ? 'bg-green-100 text-green-700' :
                    k.classification === 'جيد' ? 'bg-blue-100 text-blue-700' :
                    k.classification === 'مقبول' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700';
                  return (
                    <tr key={k.id} className="hover:bg-el-surface-container-low/30">
                      <td className="px-2 py-1.5 text-el-on-surface-variant font-mono">{idx + 1}</td>
                      <td className="px-2 py-1.5 font-semibold text-el-primary">{k.name}</td>
                      <td className="px-2 py-1.5 text-center">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${clsColor}`}>{k.classification}</span>
                      </td>
                      <td className="px-2 py-1.5 text-center font-mono font-bold text-el-primary">{k.weightedScore}</td>
                      <td className="px-2 py-1.5 text-center font-mono">{k.netVotes}</td>
                      <td className="px-2 py-1.5 text-center font-mono">{'★'.repeat(k.loyaltyLevel)}{'☆'.repeat(5 - k.loyaltyLevel)}</td>
                      <td className="px-2 py-1.5 text-center font-mono">{'★'.repeat(k.influenceLevel)}{'☆'.repeat(5 - k.influenceLevel)}</td>
                      <td className="px-2 py-1.5 text-center font-mono">{'★'.repeat(k.mobilizationAbility)}{'☆'.repeat(5 - k.mobilizationAbility)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ القسم الرابع: التصويت العشائري ═══ */}
      <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg overflow-hidden">
        <div className="bg-el-surface-container px-4 py-2 border-b border-el-outline-variant">
          <h3 className="text-[13px] font-bold text-el-on-surface flex items-center gap-1.5">
            <Users className="w-4 h-4 text-amber-500" />
            أداء التصويت العشائري الفعلي في محافظة ذي قار
          </h3>
        </div>
        {(d.tribalVoting || []).length === 0 ? (
          <div className="p-6 text-center text-[12px] text-el-on-surface-variant/50">
            يرجى إضافة العشائر وتعيين المفاتيح الاجتماعية والناخبين لها في صفحة "إدارة العشائر" لتفعيل هذا التقرير.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-[12px]">
              <thead className="bg-el-surface-container text-[10px] text-el-on-surface-variant">
                <tr>
                  <th className="px-3 py-2 font-normal">العشيرة</th>
                  <th className="px-3 py-2 text-center font-normal">النفوذ والتأثير</th>
                  <th className="px-3 py-2 text-center font-normal">المفاتيح المنسوبة</th>
                  <th className="px-3 py-2 text-center font-normal">الناخبون المنسوبون</th>
                  <th className="px-3 py-2 text-center font-normal">كفاءة الأصوات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-el-outline-variant/30">
                {(d.tribalVoting || []).map((item: any) => (
                  <tr key={item.tribe} className="hover:bg-el-surface-container-low/40">
                    <td className="px-3 py-2 font-semibold text-el-primary">{item.tribe}</td>
                    <td className="px-3 py-2 text-center">
                      <span className="text-amber-600">{'★'.repeat(item.influence)}{'☆'.repeat(5 - item.influence)}</span>
                    </td>
                    <td className="px-3 py-2 text-center font-mono">{item.keyCount}</td>
                    <td className="px-3 py-2 text-center font-mono">{item.voterCount}</td>
                    <td className="px-3 py-2 text-center font-mono font-bold text-green-600">{item.efficiency}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ═══ القسم الخامس: العشائر حسب الولاء ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-green-50/50 border border-green-200 rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-green-800 mb-2 flex items-center gap-1.5">
            🟢 العشائر الأكثر دعماً (كفاءة ≥ 50%)
          </h3>
          {(d.topSupportingTribes || []).length === 0 ? (
            <p className="text-[11px] text-green-800/60 italic">لا توجد بيانات عشائر داعمة.</p>
          ) : (
            (d.topSupportingTribes || []).map((t: any) => (
              <div key={t.tribe} className="flex justify-between text-[12px] font-semibold text-green-800 mb-1">
                <span>{t.tribe}</span>
                <span className="font-mono">{t.netVotes} صوت صافي</span>
              </div>
            ))
          )}
        </div>
        <div className="bg-yellow-50/50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-yellow-800 mb-2 flex items-center gap-1.5">
            🟡 العشائر المحايدة (فرص التحشيد والزيارة)
          </h3>
          {(d.neutralTribes || []).length === 0 ? (
            <p className="text-[11px] text-yellow-800/60 italic">لا توجد عشائر محايدة مسجلة.</p>
          ) : (
            (d.neutralTribes || []).map((t: any) => (
              <div key={t.tribe} className="flex justify-between text-[12px] font-semibold text-yellow-800 mb-1">
                <span>{t.tribe}</span>
                <span className="font-mono">{t.neutralPercentage}% أصوات معلقة</span>
              </div>
            ))
          )}
        </div>
        <div className="bg-red-50/50 border border-red-200 rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-red-800 mb-2 flex items-center gap-1.5">
            🔴 العشائر المنافسة والمؤثرة بالخصوم
          </h3>
          {(d.competingTribes || []).length === 0 ? (
            <p className="text-[11px] text-red-800/60 italic">لم تسجل عشائر تميل للخصوم.</p>
          ) : (
            (d.competingTribes || []).map((t: any) => (
              <div key={t.tribe} className="flex justify-between text-[12px] font-semibold text-red-800 mb-1">
                <span>{t.tribe}</span>
                <span className="font-mono">مستوى النفوذ: {t.influence}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ═══ القسم السادس: النفوذ الوظيفي ═══ */}
      {(d.professionalInfluence || []).length > 0 && (
        <div className="bg-el-surface-container-lowest border border-el-outline-variant rounded-lg p-4">
          <h3 className="text-[13px] font-bold text-el-on-surface mb-2 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-purple-500" />
            مؤشر النفوذ الوظيفي — ترتيب المهن حسب التأثير
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {(d.professionalInfluence || []).slice(0, 9).map((p: any) => (
              <div key={p.profession} className="flex items-center justify-between bg-el-surface-container rounded px-3 py-1.5 text-[11px]">
                <span className="text-el-on-surface font-medium">{p.profession}</span>
                <span className="font-mono text-purple-600">{p.influenceScore}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
