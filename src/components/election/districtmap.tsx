'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icons issues in Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

// GeoJSON boundaries of Dhi Qar districts
const DHI_QAR_DISTRICTS = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", properties: { name: "الناصرية" }, geometry: { type: "Polygon", coordinates: [[[46.2, 31.0], [46.4, 31.0], [46.4, 31.3], [46.2, 31.3], [46.2, 31.0]]] } },
    { type: "Feature", properties: { name: "الشطرة" }, geometry: { type: "Polygon", coordinates: [[[46.1, 31.3], [46.3, 31.3], [46.3, 31.6], [46.1, 31.6], [46.1, 31.3]]] } },
    { type: "Feature", properties: { name: "سوق الشيوخ" }, geometry: { type: "Polygon", coordinates: [[[46.4, 30.8], [46.6, 30.8], [46.6, 31.0], [46.4, 31.0], [46.4, 30.8]]] } },
    { type: "Feature", properties: { name: "الرفاعي" }, geometry: { type: "Polygon", coordinates: [[[46.0, 31.5], [46.2, 31.5], [46.2, 31.8], [46.0, 31.8], [46.0, 31.5]]] } },
    { type: "Feature", properties: { name: "قلعة سكر" }, geometry: { type: "Polygon", coordinates: [[[45.9, 31.7], [46.1, 31.7], [46.1, 31.9], [45.9, 31.9], [45.9, 31.7]]] } },
    { type: "Feature", properties: { name: "الغراف" }, geometry: { type: "Polygon", coordinates: [[[46.3, 31.4], [46.5, 31.4], [46.5, 31.7], [46.3, 31.7], [46.3, 31.4]]] } },
    { type: "Feature", properties: { name: "البطحاء" }, geometry: { type: "Polygon", coordinates: [[[45.8, 31.0], [46.0, 31.0], [46.0, 31.2], [45.8, 31.2], [45.8, 31.0]]] } },
    { type: "Feature", properties: { name: "الدواية" }, geometry: { type: "Polygon", coordinates: [[[46.5, 31.1], [46.7, 31.1], [46.7, 31.3], [46.5, 31.3], [46.5, 31.1]]] } },
    { type: "Feature", properties: { name: "الجبايش" }, geometry: { type: "Polygon", coordinates: [[[46.7, 30.9], [46.9, 30.9], [46.9, 31.1], [46.7, 31.1], [46.7, 30.9]]] } },
    { type: "Feature", properties: { name: "الإصلاح" }, geometry: { type: "Polygon", coordinates: [[[46.0, 31.3], [46.2, 31.3], [46.2, 31.5], [46.0, 31.5], [46.0, 31.3]]] } },
    { type: "Feature", properties: { name: "الفهود" }, geometry: { type: "Polygon", coordinates: [[[46.3, 30.8], [46.5, 30.8], [46.5, 31.0], [46.3, 31.0], [46.3, 30.8]]] } },
    { type: "Feature", properties: { name: "النصر" }, geometry: { type: "Polygon", coordinates: [[[46.2, 31.3], [46.4, 31.3], [46.4, 31.4], [46.2, 31.4], [46.2, 31.3]]] } },
    { type: "Feature", properties: { name: "سيد دخيل" }, geometry: { type: "Polygon", coordinates: [[[46.0, 31.0], [46.1, 31.0], [46.1, 31.2], [46.0, 31.2], [46.0, 31.0]]] } },
  ],
};

function MapBounds() {
  const map = useMap();
  useEffect(() => {
    map.fitBounds([[30.7, 45.7], [32.0, 47.1]], { padding: [10, 10] });
  }, [map]);
  return null;
}

function getOverlayColor(value: number, mode: 'support' | 'keys' | 'turnout'): string {
  if (mode === 'support') {
    if (value < 35) return '#ef4444'; // Red (Low)
    if (value < 55) return '#f59e0b'; // Amber (Swing)
    return '#10b981'; // Green (Strong)
  } else if (mode === 'keys') {
    if (value === 0) return '#1e293b';
    if (value < 2) return '#fed7aa'; // Light orange
    if (value < 5) return '#f97316'; // Orange
    return '#ea580c'; // Dark orange
  } else {
    // Turnout
    if (value < 30) return '#fda4af'; // light red
    if (value < 45) return '#fed7aa'; // light orange
    if (value < 60) return '#a7f3d0'; // light green
    return '#10b981'; // dark green
  }
}

interface DistrictMapProps {
  onDistrictClick?: (name: string) => void;
  districtData?: Array<{
    district: string;
    registeredVoters?: number;
    actualVoters?: number;
    keyCount?: number;
    netVotes?: number;
    strength?: number;
  }>;
  height?: number;
}

export default function DistrictMap({ onDistrictClick, districtData, height = 350 }: DistrictMapProps) {
  const [overlayMode, setOverlayMode] = useState<'support' | 'keys' | 'turnout'>('support');
  const dataMap = new Map((districtData || []).map(d => [d.district, d]));

  const districtStyle = (feature: any) => {
    const name = feature?.properties?.name || '';
    const d = dataMap.get(name);
    let value = 0;
    if (d) {
      if (overlayMode === 'support') {
        value = d.strength ?? 0;
      } else if (overlayMode === 'keys') {
        value = d.keyCount ?? 0;
      } else if (overlayMode === 'turnout') {
        const registered = d.registeredVoters || 1;
        const actual = d.actualVoters ?? 0;
        value = Math.round((actual / registered) * 100);
      }
    }
    const color = getOverlayColor(value, overlayMode);
    return {
      fillColor: color,
      weight: 1.5,
      opacity: 1,
      color: 'var(--el-line)',
      fillOpacity: d ? 0.75 : 0.15,
    };
  };

  const onEachDistrict = (feature: any, layer: L.Layer) => {
    const name = feature.properties.name;
    const d = dataMap.get(name);
    const turnout = d && d.registeredVoters ? Math.round(((d.actualVoters || 0) / d.registeredVoters) * 100) : 0;
    
    const content = `
      <div style="text-align:right;font-family:IBM Plex Sans Arabic, sans-serif;font-size:12px;color:#1e293b;padding:6px;direction:rtl;" dir="rtl">
        <b style="font-size:14px;color:#0f172a;display:block;margin-bottom:4px;border-bottom:1px solid #e2e8f0;padding-bottom:2px;">قضاء ${name}</b>
        ${d ? `
          <span style="display:block;margin-top:2px;">الناخبون المسجلون: <b>${d.registeredVoters?.toLocaleString() || 0}</b></span>
          <span style="display:block;margin-top:2px;">الأصوات الصافية: <b style="color:#0f3b7d">${d.netVotes?.toLocaleString() || 0}</b></span>
          <span style="display:block;margin-top:2px;">نسبة القوة/التأييد: <b style="color:#10b981">${d.strength || 0}%</b></span>
          <span style="display:block;margin-top:2px;">المفاتيح النشطة: <b>${d.keyCount || 0} مفتاح</b></span>
          <span style="display:block;margin-top:2px;">نسبة المشاركة: <b>${turnout}%</b></span>
        ` : '<span style="color:#64748b;">لا توجد بيانات تفصيلية حالياً</span>'}
      </div>
    `;

    layer.bindTooltip(content, { direction: 'top', sticky: true, offset: [0, -5] });
    layer.on({
      click: () => onDistrictClick?.(name),
      mouseover: (e) => {
        const lyr = e.target;
        lyr.setStyle({ fillOpacity: 0.9, weight: 2.5 });
      },
      mouseout: (e) => {
        const lyr = e.target;
        lyr.setStyle({ fillOpacity: 0.75, weight: 1.5 });
      }
    });
  };

  return (
    <div className="relative w-full rounded-lg border border-[var(--el-line)] bg-[var(--el-surface-container)] overflow-hidden flex flex-col" style={{ height }}>
      {/* Map Control Tabs */}
      <div className="absolute top-2.5 right-2.5 z-[1000] flex gap-1 bg-[var(--el-surface)] border border-[var(--el-line)] p-1 rounded-md shadow-lg">
        <button
          onClick={() => setOverlayMode('support')}
          className={`px-2.5 py-1 text-[10px] sm:text-xs font-bold rounded transition-colors cursor-pointer ${overlayMode === 'support' ? 'bg-[var(--el-primary)] text-white' : 'text-[var(--el-muted)] hover:bg-[var(--el-surface-container)]'}`}
        >
          كثافة التأييد
        </button>
        <button
          onClick={() => setOverlayMode('keys')}
          className={`px-2.5 py-1 text-[10px] sm:text-xs font-bold rounded transition-colors cursor-pointer ${overlayMode === 'keys' ? 'bg-[var(--el-primary)] text-white' : 'text-[var(--el-muted)] hover:bg-[var(--el-surface-container)]'}`}
        >
          المفاتيح النشطة
        </button>
        <button
          onClick={() => setOverlayMode('turnout')}
          className={`px-2.5 py-1 text-[10px] sm:text-xs font-bold rounded transition-colors cursor-pointer ${overlayMode === 'turnout' ? 'bg-[var(--el-primary)] text-white' : 'text-[var(--el-muted)] hover:bg-[var(--el-surface-container)]'}`}
        >
          نسبة المشاركة
        </button>
      </div>

      {/* Floating Legend */}
      <div className="absolute bottom-2.5 right-2.5 z-[1000] bg-[var(--el-surface)] border border-[var(--el-line)] p-2 rounded-md shadow-lg text-[10px] sm:text-[11px] text-[var(--el-text)] space-y-1 w-32 sm:w-36">
        <div className="font-bold text-center border-b border-[var(--el-line)] pb-1 mb-1.5 text-[10.5px]">دليل الخريطة</div>
        {overlayMode === 'support' && (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#10b981]" /> قوي (≥ 55%)</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#f59e0b]" /> متأرجح (35-54%)</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#ef4444]" /> ضعيف (&lt; 35%)</div>
          </div>
        )}
        {overlayMode === 'keys' && (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#ea580c]" /> كشافة نشطة جداً (5+)</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#f97316]" /> نشاط متوسط (2-4)</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#fed7aa]" /> نشاط محدود (1)</div>
          </div>
        )}
        {overlayMode === 'turnout' && (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#10b981]" /> مرتفعة (≥ 60%)</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#a7f3d0]" /> متوسطة (45-59%)</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#fda4af]" /> منخفضة (&lt; 30%)</div>
          </div>
        )}
      </div>

      {/* Leaflet Map */}
      <div className="flex-grow w-full z-10">
        <MapContainer
          center={[31.05, 46.25]}
          zoom={9}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapBounds />
          <GeoJSON
            data={DHI_QAR_DISTRICTS as any}
            style={districtStyle}
            onEachFeature={onEachDistrict}
          />
        </MapContainer>
      </div>
    </div>
  );
}
