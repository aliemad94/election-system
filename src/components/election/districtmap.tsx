'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// إصلاح أيقونات Leaflet الافتراضية مع Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// GeoJSON مبسط لحدود أقضية محافظة ذي قار (إحداثيات تقريبية)
const DHI_QAR_DISTRICTS = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", properties: { name: "الناصرية", voters: 350000, turnout: 48 }, geometry: { type: "Polygon", coordinates: [[[46.2, 31.0], [46.4, 31.0], [46.4, 31.3], [46.2, 31.3], [46.2, 31.0]]] } },
    { type: "Feature", properties: { name: "الشطرة", voters: 180000, turnout: 51 }, geometry: { type: "Polygon", coordinates: [[[46.1, 31.3], [46.3, 31.3], [46.3, 31.6], [46.1, 31.6], [46.1, 31.3]]] } },
    { type: "Feature", properties: { name: "سوق الشيوخ", voters: 120000, turnout: 45 }, geometry: { type: "Polygon", coordinates: [[[46.4, 30.8], [46.6, 30.8], [46.6, 31.0], [46.4, 31.0], [46.4, 30.8]]] } },
    { type: "Feature", properties: { name: "الرفاعي", voters: 95000, turnout: 52 }, geometry: { type: "Polygon", coordinates: [[[46.0, 31.5], [46.2, 31.5], [46.2, 31.8], [46.0, 31.8], [46.0, 31.5]]] } },
    { type: "Feature", properties: { name: "قلعة سكر", voters: 82000, turnout: 46 }, geometry: { type: "Polygon", coordinates: [[[45.9, 31.7], [46.1, 31.7], [46.1, 31.9], [45.9, 31.9], [45.9, 31.7]]] } },
    { type: "Feature", properties: { name: "الغراف", voters: 65000, turnout: 43 }, geometry: { type: "Polygon", coordinates: [[[46.3, 31.4], [46.5, 31.4], [46.5, 31.7], [46.3, 31.7], [46.3, 31.4]]] } },
    { type: "Feature", properties: { name: "البطحاء", voters: 35000, turnout: 40 }, geometry: { type: "Polygon", coordinates: [[[45.8, 31.0], [46.0, 31.0], [46.0, 31.2], [45.8, 31.2], [45.8, 31.0]]] } },
    { type: "Feature", properties: { name: "الدواية", voters: 29000, turnout: 44 }, geometry: { type: "Polygon", coordinates: [[[46.5, 31.1], [46.7, 31.1], [46.7, 31.3], [46.5, 31.3], [46.5, 31.1]]] } },
    { type: "Feature", properties: { name: "الجبايش", voters: 22000, turnout: 42 }, geometry: { type: "Polygon", coordinates: [[[46.7, 30.9], [46.9, 30.9], [46.9, 31.1], [46.7, 31.1], [46.7, 30.9]]] } },
    { type: "Feature", properties: { name: "الإصلاح", voters: 18000, turnout: 41 }, geometry: { type: "Polygon", coordinates: [[[46.0, 31.3], [46.2, 31.3], [46.2, 31.5], [46.0, 31.5], [46.0, 31.3]]] } },
    { type: "Feature", properties: { name: "الفهود", voters: 16000, turnout: 41 }, geometry: { type: "Polygon", coordinates: [[[46.3, 30.8], [46.5, 30.8], [46.5, 31.0], [46.3, 31.0], [46.3, 30.8]]] } },
    { type: "Feature", properties: { name: "النصر", voters: 14000, turnout: 42 }, geometry: { type: "Polygon", coordinates: [[[46.2, 31.3], [46.4, 31.3], [46.4, 31.4], [46.2, 31.4], [46.2, 31.3]]] } },
    { type: "Feature", properties: { name: "سيد دخيل", voters: 12000, turnout: 40 }, geometry: { type: "Polygon", coordinates: [[[46.0, 31.0], [46.1, 31.0], [46.1, 31.2], [46.0, 31.2], [46.0, 31.0]]] } },
    { type: "Feature", properties: { name: "العكيكة", voters: 11000, turnout: 39 }, geometry: { type: "Polygon", coordinates: [[[46.1, 31.7], [46.3, 31.7], [46.3, 31.8], [46.1, 31.8], [46.1, 31.7]]] } },
    { type: "Feature", properties: { name: "الطار", voters: 10000, turnout: 40 }, geometry: { type: "Polygon", coordinates: [[[46.3, 31.7], [46.5, 31.7], [46.5, 31.8], [46.3, 31.8], [46.3, 31.7]]] } },
    { type: "Feature", properties: { name: "الكرادي", voters: 9000, turnout: 38 }, geometry: { type: "Polygon", coordinates: [[[45.9, 31.8], [46.1, 31.8], [46.1, 31.9], [45.9, 31.9], [45.9, 31.8]]] } },
    { type: "Feature", properties: { name: "أور", voters: 9000, turnout: 41 }, geometry: { type: "Polygon", coordinates: [[[46.5, 30.9], [46.7, 30.9], [46.7, 31.0], [46.5, 31.0], [46.5, 30.9]]] } },
    { type: "Feature", properties: { name: "الدغارة", voters: 8500, turnout: 40 }, geometry: { type: "Polygon", coordinates: [[[46.4, 31.5], [46.6, 31.5], [46.6, 31.6], [46.4, 31.6], [46.4, 31.5]]] } },
    { type: "Feature", properties: { name: "الفجر", voters: 8000, turnout: 40 }, geometry: { type: "Polygon", coordinates: [[[46.0, 31.5], [46.2, 31.5], [46.2, 31.6], [46.0, 31.6], [46.0, 31.5]]] } },
    { type: "Feature", properties: { name: "كرمة بني سعيد", voters: 7500, turnout: 39 }, geometry: { type: "Polygon", coordinates: [[[46.2, 31.8], [46.4, 31.8], [46.4, 31.9], [46.2, 31.9], [46.2, 31.8]]] } },
    { type: "Feature", properties: { name: "الغدير", voters: 7000, turnout: 39 }, geometry: { type: "Polygon", coordinates: [[[46.1, 31.0], [46.2, 31.0], [46.2, 31.1], [46.1, 31.1], [46.1, 31.0]]] } },
  ],
};

const DISTRICT_COLORS: Record<string, string> = {
  "الناصرية": "#1e3a5f",
  "الشطرة": "#2d6a4f",
  "سوق الشيوخ": "#7b2d8b",
  "الرفاعي": "#c44536",
  "قلعة سكر": "#e07a5f",
  "الغراف": "#3d5a80",
  "البطحاء": "#b5651d",
};

// تثبيت الخريطة على ذي قار
function MapBounds({ districts }: { districts: any[] }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds([[30.7, 45.7], [32.0, 47.1]], { padding: [20, 20] });
  }, [map]);
  return null;
}

function getColor(name: string): string {
  return DISTRICT_COLORS[name] || `hsl(${(name.charCodeAt(0) || 0) * 7 % 360}, 50%, 55%)`;
}

interface DistrictMapProps {
  onDistrictClick?: (name: string) => void;
  districtData?: Array<{ district: string; registeredVoters: number; actualVoters: number }>;
  height?: number;
}

export default function DistrictMap({ onDistrictClick, districtData, height = 300 }: DistrictMapProps) {
  const dataMap = new Map((districtData || []).map(d => [d.district, d]));

  const districtStyle = (feature: any) => {
    const name = feature?.properties?.name || '';
    const d = dataMap.get(name);
    const color = getColor(name);
    return {
      fillColor: color,
      weight: 1.5,
      opacity: 1,
      color: '#ffffff',
      fillOpacity: d ? 0.7 : 0.4,
    };
  };

  const onEachDistrict = (feature: any, layer: L.Layer) => {
    const name = feature.properties.name;
    const d = dataMap.get(name);
    const turnout = d ? Math.round((d.actualVoters / d.registeredVoters) * 100) : 0;

    layer.bindTooltip(
      `<div style="text-align:right;font-family:sans-serif;font-size:12px">
        <b>${name}</b><br/>
        ${d ? `الناخبين: ${d.registeredVoters.toLocaleString()}<br/>نسبة المشاركة: ${turnout}%` : 'لا توجد بيانات'}
      </div>`,
      { direction: 'top', sticky: true, offset: [0, -5] }
    );

    layer.on({ click: () => onDistrictClick?.(name) });
  };

  return (
    <div style={{ height, borderRadius: 8, overflow: 'hidden' }}>
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
        <MapBounds districts={DHI_QAR_DISTRICTS.features} />
        <GeoJSON
          data={DHI_QAR_DISTRICTS as any}
          style={districtStyle}
          onEachFeature={onEachDistrict}
        />
      </MapContainer>
    </div>
  );
}
