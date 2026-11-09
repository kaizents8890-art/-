import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Hospital } from '../types';
import { getCoordinatesForRegion } from '../data/hospitalsData';
import { Maximize2, Minimize2, Navigation, ZoomIn, ZoomOut, MapPin, X } from 'lucide-react';

interface InteractiveHospitalMapProps {
  hospitals: Hospital[];
  userRegion: string;
  selectedHospital: Hospital | null;
  onSelectHospital: (hospital: Hospital) => void;
  onOpenDetail?: (hospital: Hospital) => void;
}

// 대한민국 경계 영역 (해외 지역 이동 및 확대/축소 제한)
const SOUTH_KOREA_BOUNDS: L.LatLngBoundsExpression = [
  [33.0, 124.0], // 서남단 (마라도, 백령도 서남방)
  [38.9, 132.0], // 동북단 (고성, 독도 동북방)
];

export const InteractiveHospitalMap: React.FC<InteractiveHospitalMapProps> = ({
  hospitals,
  userRegion,
  selectedHospital,
  onSelectHospital,
  onOpenDetail,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const modalMapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const modalMapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const modalMarkersLayerRef = useRef<L.LayerGroup | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const userCenter = getCoordinatesForRegion(userRegion);

  // Helper to create HTML DivIcons
  const createHospitalIcon = (isEmergency: boolean, isSelected: boolean) => {
    const bgColor = isEmergency ? '#e11d48' : '#ea580c'; // rose-600 or orange-600
    const ringColor = isSelected ? '#3b82f6' : 'white';
    const scale = isSelected ? 'scale-125' : 'hover:scale-110';
    return L.divIcon({
      className: 'custom-hospital-marker',
      html: `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 9999px;
          background-color: ${bgColor};
          color: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          border: 3px solid ${ringColor};
          cursor: pointer;
          font-size: 15px;
          transition: transform 0.15s ease-in-out;
        " class="${scale}">
          <span>${isEmergency ? '🚨' : '🏥'}</span>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
      popupAnchor: [0, -20],
    });
  };

  const createUserIcon = () => {
    return L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div style="position: relative; width: 28px; height: 28px;">
          <div style="
            position: absolute;
            inset: 0;
            border-radius: 9999px;
            background-color: #f97316;
            opacity: 0.35;
            animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>
          <div style="
            position: relative;
            width: 28px;
            height: 28px;
            border-radius: 9999px;
            background-color: #ea580c;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
          ">
            🐾
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  };

  // Populate markers onto a specific map
  const populateMarkers = (map: L.Map, layerGroup: L.LayerGroup) => {
    layerGroup.clearLayers();

    // 1. User marker
    const userMarker = L.marker([userCenter.lat, userCenter.lng], {
      icon: createUserIcon(),
      zIndexOffset: 100,
    }).bindPopup(`
      <div style="font-family: inherit; font-size: 12px; line-height: 1.4; padding: 4px;">
        <p style="font-weight: 700; color: #c2410c; margin-bottom: 2px;">📍 내 거주 위치</p>
        <p style="color: #44403c; font-weight: 500;">${userRegion}</p>
      </div>
    `);
    layerGroup.addLayer(userMarker);

    // 2. Hospital markers
    hospitals.forEach((h) => {
      if (!h.lat || !h.lng) return;
      const isSelected = selectedHospital?.id === h.id;
      const marker = L.marker([h.lat, h.lng], {
        icon: createHospitalIcon(h.isEmergency24h, isSelected),
      });

      const popupContent = document.createElement('div');
      popupContent.style.fontFamily = 'inherit';
      popupContent.style.padding = '4px';
      popupContent.style.minWidth = '180px';
      popupContent.innerHTML = `
        <div style="margin-bottom: 4px;">
          <span style="display: inline-block; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; ${
            h.isEmergency24h
              ? 'background-color: #ffe4e6; color: #be123c;'
              : 'background-color: #ffedd5; color: #c2410c;'
          }">
            ${h.isEmergency24h ? '24시 응급' : '추천 제휴'}
          </span>
          <span style="font-size: 11px; font-weight: 700; color: #ea580c; float: right;">
            ${h.distanceKm}km
          </span>
        </div>
        <h4 style="font-weight: 700; font-size: 13px; color: #1c1917; margin: 4px 0 2px 0;">
          ${h.name}
        </h4>
        <p style="font-size: 11px; color: #78716c; margin-bottom: 6px;">
          ${h.address}
        </p>
        <p style="font-size: 10px; color: #0284c7; background-color: #f0f9ff; padding: 3px 6px; border-radius: 4px; margin-bottom: 8px;">
          ⏰ ${h.openingHours}
        </p>
        <button id="popup-select-btn-${h.id}" style="
          width: 100%;
          background-color: #f97316;
          color: white;
          font-weight: 600;
          font-size: 11px;
          padding: 6px 10px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
        ">
          병원 상세 및 예약 확인
        </button>
      `;

      popupContent
        .querySelector(`#popup-select-btn-${h.id}`)
        ?.addEventListener('click', () => {
          onSelectHospital(h);
          if (onOpenDetail) onOpenDetail(h);
        });

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        onSelectHospital(h);
        if (onOpenDetail) onOpenDetail(h);
      });

      layerGroup.addLayer(marker);
    });
  };

  // Initialize main map (대한민국 영역 내 이동 제한 및 최소/최대 줌 설정)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userCenter.lat, userCenter.lng],
        zoom: 14,
        minZoom: 6,
        maxZoom: 18,
        maxBounds: SOUTH_KOREA_BOUNDS,
        maxBoundsViscosity: 1.0,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = layerGroup;
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([userCenter.lat, userCenter.lng], 14);
    }

    if (markersLayerRef.current && mapInstanceRef.current) {
      populateMarkers(mapInstanceRef.current, markersLayerRef.current);
    }
  }, [userRegion, hospitals, selectedHospital]);

  // Handle selected hospital pan
  useEffect(() => {
    if (selectedHospital && selectedHospital.lat && selectedHospital.lng) {
      mapInstanceRef.current?.flyTo(
        [selectedHospital.lat, selectedHospital.lng],
        15,
        { duration: 0.8 }
      );
      modalMapInstanceRef.current?.flyTo(
        [selectedHospital.lat, selectedHospital.lng],
        15,
        { duration: 0.8 }
      );
    }
  }, [selectedHospital]);

  // Initialize expanded modal map (대한민국 영역 내 이동 제한)
  useEffect(() => {
    if (isModalOpen && modalMapContainerRef.current) {
      setTimeout(() => {
        if (!modalMapInstanceRef.current && modalMapContainerRef.current) {
          const initialCenter: [number, number] =
            selectedHospital?.lat && selectedHospital?.lng
              ? [selectedHospital.lat, selectedHospital.lng]
              : [userCenter.lat, userCenter.lng];

          const modalMap = L.map(modalMapContainerRef.current, {
            center: initialCenter,
            zoom: 14,
            minZoom: 6,
            maxZoom: 18,
            maxBounds: SOUTH_KOREA_BOUNDS,
            maxBoundsViscosity: 1.0,
            zoomControl: false,
          });

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19,
          }).addTo(modalMap);

          const modalLayerGroup = L.layerGroup().addTo(modalMap);
          modalMarkersLayerRef.current = modalLayerGroup;
          modalMapInstanceRef.current = modalMap;
        }

        if (modalMapInstanceRef.current && modalMarkersLayerRef.current) {
          modalMapInstanceRef.current.invalidateSize();
          populateMarkers(modalMapInstanceRef.current, modalMarkersLayerRef.current);
        }
      }, 100);
    }
  }, [isModalOpen, hospitals, userRegion]);

  const handleCenterUser = () => {
    mapInstanceRef.current?.flyTo([userCenter.lat, userCenter.lng], 14);
    modalMapInstanceRef.current?.flyTo([userCenter.lat, userCenter.lng], 14);
  };

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
    modalMapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
    modalMapInstanceRef.current?.zoomOut();
  };

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-xs border border-stone-200 bg-white">
      {/* Top Header Bar */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex items-center justify-between pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-md border border-stone-100 flex items-center gap-2 pointer-events-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-bold text-stone-800 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-orange-600" />
            내 거주지역: {userRegion}
          </span>
          <span className="text-[11px] text-stone-500 border-l border-stone-200 pl-2">
            주변 병원 {hospitals.length}곳 탐색됨
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            onClick={() => setIsModalOpen(true)}
            title="지도 크게보기"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/95 hover:bg-orange-50 text-stone-700 hover:text-orange-600 font-semibold text-xs shadow-md border border-stone-100 transition-all cursor-pointer active:scale-95"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>지도 확대</span>
          </button>
        </div>
      </div>

      {/* Main Map Container */}
      <div
        ref={mapContainerRef}
        className="w-full h-64 md:h-72 z-0 cursor-grab active:cursor-grabbing"
      />

      {/* Floating Bottom Navigation / Zoom Controls */}
      <div className="absolute bottom-3 right-3 z-[400] flex flex-col gap-1.5">
        <button
          onClick={handleCenterUser}
          title="내 위치로 이동"
          className="w-8 h-8 rounded-xl bg-white shadow-md border border-stone-200 text-stone-700 hover:text-orange-600 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Navigation className="w-4 h-4 text-orange-600" />
        </button>
        <div className="bg-white rounded-xl shadow-md border border-stone-200 flex flex-col overflow-hidden">
          <button
            onClick={handleZoomIn}
            title="확대"
            className="w-8 h-8 flex items-center justify-center text-stone-700 hover:bg-stone-50 border-b border-stone-100 transition-colors cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            title="축소"
            className="w-8 h-8 flex items-center justify-center text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Hint Banner */}
      <div className="absolute bottom-3 left-3 z-[400] pointer-events-none">
        <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-xl shadow-xs border border-stone-200 text-[11px] text-stone-600 font-medium">
          💡 마우스 드래그로 이동하고 마커를 클릭하여 병원 정보를 확인하세요
        </div>
      </div>

      {/* Fullscreen / Expanded Map Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-5xl h-[85vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-stone-200">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">
                    {userRegion} 주변 동물병원 상세 지도
                  </h3>
                  <p className="text-xs text-stone-500">
                    마우스로 자유롭게 이동 및 줌하여 원하는 병원을 확인하세요
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-600 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Map Body */}
            <div className="flex-1 relative">
              <div
                ref={modalMapContainerRef}
                className="w-full h-full cursor-grab active:cursor-grabbing"
              />

              {/* Floating control buttons in Modal */}
              <div className="absolute bottom-4 right-4 z-[400] flex flex-col gap-1.5">
                <button
                  onClick={handleCenterUser}
                  title="내 위치로 이동"
                  className="w-9 h-9 rounded-xl bg-white shadow-lg border border-stone-200 text-stone-700 hover:text-orange-600 flex items-center justify-center cursor-pointer"
                >
                  <Navigation className="w-4 h-4 text-orange-600" />
                </button>
                <div className="bg-white rounded-xl shadow-lg border border-stone-200 flex flex-col overflow-hidden">
                  <button
                    onClick={handleZoomIn}
                    className="w-9 h-9 flex items-center justify-center text-stone-700 hover:bg-stone-50 border-b border-stone-100 cursor-pointer"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleZoomOut}
                    className="w-9 h-9 flex items-center justify-center text-stone-700 hover:bg-stone-50 cursor-pointer"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Hospital quick selection chips in Modal */}
              <div className="absolute top-3 left-3 right-3 z-[400] flex gap-2 overflow-x-auto pb-1 scrollbar-none pointer-events-auto">
                {hospitals.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => {
                      onSelectHospital(h);
                      if (h.lat && h.lng) {
                        modalMapInstanceRef.current?.flyTo([h.lat, h.lng], 16);
                      }
                    }}
                    className={`shrink-0 px-3 py-1.5 rounded-2xl text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 cursor-pointer ${
                      selectedHospital?.id === h.id
                        ? 'bg-orange-600 text-white'
                        : 'bg-white/95 text-stone-800 hover:bg-stone-50 border border-stone-200'
                    }`}
                  >
                    <span>{h.isEmergency24h ? '🚨' : '🏥'}</span>
                    <span>{h.name}</span>
                    <span className="opacity-80 text-[10px]">{h.distanceKm}km</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600">
              <span className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-orange-600"></span> 일반 병원
                <span className="inline-block w-3 h-3 rounded-full bg-rose-600 ml-2"></span> 24시 응급센터
                <span className="inline-block w-3 h-3 rounded-full bg-amber-500 ml-2"></span> 내 거주지역
              </span>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-medium cursor-pointer transition-colors"
              >
                지도 닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
