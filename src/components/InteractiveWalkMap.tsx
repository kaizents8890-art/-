import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { UserProfile, AiWalkRecommendation, WalkTarget, WalkRecord } from '../types';
import { getCoordinatesForRegion } from '../data/hospitalsData';
import {
  Navigation,
  MapPin,
  Clock,
  Flame,
  Footprints,
  Coins,
  ShieldCheck,
  Pause,
  Play,
  Square,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  CheckCircle2,
  Zap,
  Radio,
  X,
  Gauge
} from 'lucide-react';

interface InteractiveWalkMapProps {
  user: UserProfile;
  aiRecommendation: AiWalkRecommendation;
  walkTarget: WalkTarget;
  dailyEarnedPoints: number;
  isWalking: boolean;
  onFinishWalk: (earnedPoints: number, distanceKm: number, minutes: number, record?: WalkRecord) => void;
  onCancelWalk: () => void;
}

// 대한민국 경계 영역 엄격 제한 (해외 이동 방지)
const SOUTH_KOREA_BOUNDS: L.LatLngBoundsExpression = [
  [33.0, 124.0], // 서남단
  [38.9, 132.0], // 동북단
];

export const InteractiveWalkMap: React.FC<InteractiveWalkMapProps> = ({
  user,
  aiRecommendation,
  walkTarget,
  dailyEarnedPoints,
  isWalking,
  onFinishWalk,
  onCancelWalk,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const recommendedPolylineRef = useRef<L.Polyline | null>(null);
  const walkedPolylineRef = useRef<L.Polyline | null>(null);
  const currentMarkerRef = useRef<L.Marker | null>(null);

  // Initial user center coordinates based on registered region
  const userCenter = useMemo(() => {
    return getCoordinatesForRegion(user.guardianRegion);
  }, [user.guardianRegion]);

  // GPS Permission State
  const [gpsPermissionStatus, setGpsPermissionStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [useSimulationMovement, setUseSimulationMovement] = useState(true);

  // Simulation test modes: 'normal' (3.8 km/h), 'abnormal_speed' (35.0 km/h vehicle), 'signal_lost'
  const [walkMode, setWalkMode] = useState<'normal' | 'abnormal_speed' | 'signal_lost'>('normal');
  const [showHoldModal, setShowHoldModal] = useState(false);

  // Real-time walking metrics
  const [isPaused, setIsPaused] = useState(false);
  const [walkSeconds, setWalkSeconds] = useState(0);
  const [walkDistanceKm, setWalkDistanceKm] = useState(0.04);
  const [walkSteps, setWalkSteps] = useState(48);
  const [walkCalories, setWalkCalories] = useState(2.1);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [hasReachedLimit, setHasReachedLimit] = useState(false);

  // Calculated current speed km/h
  const currentSpeed = useMemo(() => {
    if (isPaused) return 0.0;
    if (walkMode === 'signal_lost') return 0.0;
    if (walkMode === 'abnormal_speed') return 35.4;
    return 3.8;
  }, [isPaused, walkMode]);

  // Coordinates array of actual walk
  const [walkedCoords, setWalkedCoords] = useState<Array<[number, number]>>([]);
  const [currentPosition, setCurrentPosition] = useState<[number, number]>([userCenter.lat, userCenter.lng]);

  // Recommended Route Generation (Personalized to pet's age and health conditions)
  const recommendedRoute = useMemo(() => {
    const lat = userCenter.lat;
    const lng = userCenter.lng;
    const isSenior = user.petAge >= 7;
    const hasJointIssue =
      user.hasCondition === '있음' &&
      (user.conditionCategories.includes('관절·근골격') || user.petBreed.includes('푸들') || user.petBreed.includes('말티즈'));

    let title = '반려견 맞춤 데일리 둘레길 산책 코스';
    let targetDistKm = 2.0;
    let estimatedMins = 30;
    let description = '신선한 공기를 마시며 평지 위주로 편안하게 걸을 수 있는 추천 산책로입니다.';

    if (hasJointIssue) {
      title = '슬개골 안심 평지 우레탄 & 잔디 코스';
      targetDistKm = 1.6;
      estimatedMins = 25;
      description = '관절 충격을 최소화하기 위해 계단과 경사로를 배제한 폭신한 평지 산책로를 우선 추천합니다.';
    } else if (isSenior) {
      title = '시니어 안심 그늘 쉼터 코스';
      targetDistKm = 1.2;
      estimatedMins = 20;
      description = '노령견의 호흡과 심박 안정을 위해 벤치 쉼터가 많은 그늘진 완보 산책로입니다.';
    } else {
      title = '활력 충전 근린공원 순환 코스';
      targetDistKm = 2.4;
      estimatedMins = 35;
      description = '다양한 냄새를 맡으며 스트레스를 해소할 수 있는 풍부한 노즈워크 스팟 산책로입니다.';
    }

    const delta = 0.0035; // ~350m radius
    const waypoints: Array<[number, number]> = [
      [lat, lng],
      [lat + delta * 0.6, lng + delta * 0.8],
      [lat + delta * 1.1, lng + delta * 0.4],
      [lat + delta * 1.2, lng - delta * 0.3],
      [lat + delta * 0.7, lng - delta * 0.9],
      [lat - delta * 0.2, lng - delta * 0.8],
      [lat - delta * 0.5, lng - delta * 0.2],
      [lat, lng],
    ];

    return {
      title,
      targetDistKm,
      estimatedMins,
      description,
      waypoints,
    };
  }, [userCenter, user.petAge, user.hasCondition, user.conditionCategories, user.petBreed]);

  // Turn-by-turn guidance based on completion percentage
  const currentNavGuidance = useMemo(() => {
    const progress = Math.min(100, Math.round((walkDistanceKm / recommendedRoute.targetDistKm) * 100));
    if (progress < 20) {
      return {
        direction: '직진',
        instruction: '150m 앞 관절 친화 잔디 둘레길 진입',
        detail: '초기 5분간 가벼운 워밍업 보행을 유지해 주세요.',
      };
    } else if (progress < 45) {
      return {
        direction: '우회전',
        instruction: '180m 앞 평지 산책로 우측 방향 회전',
        detail: '슬개골 보호를 위해 계단 대신 완만한 경사로를 이용하세요.',
      };
    } else if (progress < 70) {
      return {
        direction: '직진',
        instruction: '350m 앞 수변 공원길 완보 구간 (노즈워크 권장)',
        detail: '충분한 냄새 맡기 활동으로 반려견 스트레스를 해소해 주세요.',
      };
    } else if (progress < 90) {
      return {
        direction: '좌회전',
        instruction: '200m 앞 그늘 쉼터 벤치 구간 (수분 섭취 권장)',
        detail: '산책 20분 경과 시 휴대용 물병으로 수분을 공급해 주세요.',
      };
    } else {
      return {
        direction: '완주 부근',
        instruction: '출발지 복귀 코스 (쿨다운 서행 보행)',
        detail: '목표 달성 완료! 서서히 보폭을 늦추며 산책을 마무리하세요.',
      };
    }
  }, [walkDistanceKm, recommendedRoute.targetDistKm]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const startPos: [number, number] = [userCenter.lat, userCenter.lng];

    const map = L.map(mapContainerRef.current, {
      center: startPos,
      zoom: 16,
      minZoom: 6,
      maxZoom: 18,
      maxBounds: SOUTH_KOREA_BOUNDS,
      maxBoundsViscosity: 1.0,
      zoomControl: false,
    });

    // Clean OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors | MOGEGAE GPS Collar',
      maxZoom: 18,
    }).addTo(map);

    // Draw Recommended Route
    const recLine = L.polyline(recommendedRoute.waypoints, {
      color: '#f59e0b',
      weight: 6,
      opacity: 0.8,
      dashArray: '8, 8',
      lineCap: 'round',
    }).addTo(map);
    recommendedPolylineRef.current = recLine;

    // Draw Walked Route (Solid Emerald gradient)
    const walkedLine = L.polyline([[userCenter.lat, userCenter.lng]], {
      color: '#10b981',
      weight: 6,
      opacity: 0.95,
      lineCap: 'round',
    }).addTo(map);
    walkedPolylineRef.current = walkedLine;

    // Dog Icon Marker with GPS badge
    const dogIcon = L.divIcon({
      className: 'custom-dog-gps-marker',
      html: `
        <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 44px; height: 44px; background: rgba(245, 158, 11, 0.35); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 36px; height: 36px; background: #ffffff; border: 3px solid #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.25); font-size: 18px; z-index: 10;">
            🐕
          </div>
          <div style="position: absolute; bottom: -2px; right: -2px; background: #10b981; color: #fff; font-size: 9px; font-weight: 900; padding: 1px 4px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); z-index: 12;">
            GPS
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    const marker = L.marker(startPos, { icon: dogIcon }).addTo(map);
    currentMarkerRef.current = marker;

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [userCenter, recommendedRoute.waypoints]);

  // Real-time walking loop
  useEffect(() => {
    let interval: any = null;

    if (isWalking && !isPaused) {
      interval = setInterval(() => {
        setWalkSeconds((s) => s + 1);

        // Distance delta according to mode
        const distDelta =
          walkMode === 'signal_lost'
            ? 0
            : walkMode === 'abnormal_speed'
            ? 0.01 // very fast ~36 km/h
            : 0.0016; // ~4.0 km/h gentle walk

        setWalkDistanceKm((prev) => {
          const dist = Number((prev + distDelta).toFixed(3));
          setWalkSteps((st) => (walkMode === 'signal_lost' ? st : st + (walkMode === 'abnormal_speed' ? 12 : 2)));
          setWalkCalories((c) => (walkMode === 'signal_lost' ? c : Number((c + 0.08).toFixed(1))));

          // Calculate points: 15P per 100m, capped by dailyMaxPointLimit
          if (walkMode === 'normal') {
            const rawPts = Math.floor(((dist * 1000) / 100) * aiRecommendation.pointsPer100m);
            const allowedToday = Math.max(0, aiRecommendation.dailyMaxPointLimit - dailyEarnedPoints);
            const finalPts = Math.min(rawPts, allowedToday);
            if (rawPts >= allowedToday && allowedToday > 0) {
              setHasReachedLimit(true);
            }
            setEarnedPoints(finalPts);
          } else {
            // Point hold simulation: no points increment while abnormal
          }

          return dist;
        });

        // Simulation coordinate step
        if (useSimulationMovement && mapInstanceRef.current && walkMode !== 'signal_lost') {
          const waypoints = recommendedRoute.waypoints;
          setWalkSeconds((sec) => {
            const totalSteps = walkMode === 'abnormal_speed' ? 30 : 120;
            const progressRatio = (sec % totalSteps) / totalSteps;
            const segmentIdx = Math.floor(progressRatio * (waypoints.length - 1));
            const nextIdx = Math.min(waypoints.length - 1, segmentIdx + 1);
            const segmentProgress = progressRatio * (waypoints.length - 1) - segmentIdx;

            const p1 = waypoints[segmentIdx];
            const p2 = waypoints[nextIdx];

            const currentLat = p1[0] + (p2[0] - p1[0]) * segmentProgress;
            const currentLng = p1[1] + (p2[1] - p1[1]) * segmentProgress;
            const nextCoord: [number, number] = [currentLat, currentLng];

            setCurrentPosition(nextCoord);
            setWalkedCoords((prev) => {
              const updated = [...prev, nextCoord];
              if (walkedPolylineRef.current) {
                walkedPolylineRef.current.setLatLngs(updated);
              }
              return updated;
            });

            if (currentMarkerRef.current) {
              currentMarkerRef.current.setLatLng(nextCoord);
            }

            if (sec % 3 === 0) {
              mapInstanceRef.current?.panTo(nextCoord, { animate: true, duration: 1 });
            }

            return sec;
          });
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [
    isWalking,
    isPaused,
    useSimulationMovement,
    walkMode,
    aiRecommendation,
    dailyEarnedPoints,
    recommendedRoute.waypoints,
  ]);

  // Format Elapsed Time MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  // Complete Walk Handler with Abnormal Check
  const handleFinishAttempt = () => {
    // If abnormal speed (> 20 km/h) or signal lost, trigger the hold modal
    if (walkMode === 'abnormal_speed' || walkMode === 'signal_lost') {
      setShowHoldModal(true);
      return;
    }

    executeFinishWithPoints(earnedPoints);
  };

  const executeFinishWithPoints = (finalGrantedPoints: number) => {
    const minutes = Math.max(1, Math.round(walkSeconds / 60));
    const now = new Date();
    const dateStr = `${now.getFullYear()}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now
      .getDate()
      .toString()
      .padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

    const pathPoints = walkedCoords.map((c, i) => {
      const minLat = Math.min(...walkedCoords.map((coord) => coord[0]));
      const maxLat = Math.max(...walkedCoords.map((coord) => coord[0])) || minLat + 0.001;
      const minLng = Math.min(...walkedCoords.map((coord) => coord[1]));
      const maxLng = Math.max(...walkedCoords.map((coord) => coord[1])) || minLng + 0.001;

      const x = Math.min(95, Math.max(5, Math.round(((c[1] - minLng) / (maxLng - minLng)) * 80 + 10)));
      const y = Math.min(95, Math.max(5, Math.round(((c[0] - minLat) / (maxLat - minLat)) * 80 + 10)));
      return { x, y, timeSec: i * 5 };
    });

    const isAbnormal = walkMode !== 'normal';

    const newRecord: WalkRecord = {
      id: `walk_${Date.now()}`,
      date: dateStr,
      courseName: recommendedRoute.title,
      distanceKm: Number(walkDistanceKm.toFixed(2)),
      durationMinutes: minutes,
      steps: walkSteps,
      calories: Math.round(walkCalories),
      earnedPoints: finalGrantedPoints,
      pathPoints,
      geoPath: walkedCoords.map((c) => ({ lat: c[0], lng: c[1] })),
      dogAccompaniedVerified: !isAbnormal,
      paceNote: isAbnormal
        ? '비정상 이동 감지 (포인트 지급 보류)'
        : `${user.petBreed} 관절 건강 맞춤 평지 산책 (안심 GPS 목걸이 인증)`,
      memo: isAbnormal
        ? '차량 탑승 의심(시속 20km/h 초과) 또는 신호 두절로 인해 포인트 미적립'
        : `모으개 스마트 GPS 목걸이 실시간 동행 인증 완료 (기기 ID: ${user.gpsCollarDeviceId || 'MOGE-GPS-9482'})`,
    };

    setShowHoldModal(false);
    onFinishWalk(finalGrantedPoints, Number(walkDistanceKm.toFixed(2)), minutes, newRecord);
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-xl border-2 border-amber-300 bg-stone-900 flex flex-col h-[650px] sm:h-[720px] animate-fadeIn">
      {/* ========================================================
          TOP NAVIGATION INSTRUCTION HUD
          ======================================================== */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-col gap-2">
        {/* Primary Turn Instruction Card */}
        <div className="bg-stone-900/90 backdrop-blur-md text-white rounded-2xl p-3.5 sm:p-4 shadow-2xl border border-stone-700/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
              <Navigation className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded">
                  {currentNavGuidance.direction}
                </span>
                <span className="text-xs text-stone-300 truncate max-w-[180px] sm:max-w-none">
                  {user.guardianRegion} 맞춤 코스
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-extrabold text-white mt-0.5 leading-snug">
                {currentNavGuidance.instruction}
              </h4>
            </div>
          </div>

          {/* GPS Collar Status Badge */}
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold shrink-0 border ${
                walkMode === 'signal_lost'
                  ? 'bg-rose-500/20 border-rose-400/40 text-rose-300 animate-pulse'
                  : walkMode === 'abnormal_speed'
                  ? 'bg-amber-500/20 border-amber-400/40 text-amber-300'
                  : 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>
                {walkMode === 'signal_lost'
                  ? 'GPS 신호 두절'
                  : walkMode === 'abnormal_speed'
                  ? '고속 이동 감지'
                  : `GPS 목걸이 연동 (${user.gpsCollarDeviceId || 'MOGE-GPS-9482'})`}
              </span>
            </div>
          </div>
        </div>

        {/* Course Target & Simulation Mode Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-stone-900/85 backdrop-blur-md text-stone-200 border border-stone-700 flex items-center gap-2 shadow-md">
            <span className="font-bold text-amber-400">속도:</span>
            <span className="font-mono font-black text-white">{currentSpeed} km/h</span>
            <span className="text-stone-400 hidden sm:inline">|</span>
            <span className="text-stone-300 hidden sm:inline">정상 보행 범위 (20km/h 이하)</span>
          </div>

          {/* Test Simulation Controls */}
          <div className="flex items-center gap-1.5 bg-stone-900/90 backdrop-blur-md p-1 rounded-xl border border-stone-700 shadow-md">
            <span className="text-[10px] text-stone-400 font-bold px-1.5">테스트 모드:</span>
            <button
              type="button"
              onClick={() => setWalkMode('normal')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                walkMode === 'normal'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              정상 산책
            </button>
            <button
              type="button"
              onClick={() => setWalkMode('abnormal_speed')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                walkMode === 'abnormal_speed'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
              title="차량 탑승 등 시속 20km/h 초과 감지"
            >
              차량 탑승(35km/h)
            </button>
            <button
              type="button"
              onClick={() => setWalkMode('signal_lost')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                walkMode === 'signal_lost'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
              title="GPS 신호 끊김 시뮬레이션"
            >
              신호 끊김
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          LEAFLET INTERACTIVE MAP CONTAINER
          ======================================================== */}
      <div ref={mapContainerRef} className="w-full flex-1 z-0 relative" />

      {/* Map Floating Controls */}
      <div className="absolute right-4 top-36 z-20 flex flex-col gap-1.5">
        <button
          onClick={() => mapInstanceRef.current?.zoomIn()}
          className="w-10 h-10 rounded-xl bg-white hover:bg-stone-50 text-stone-800 shadow-lg flex items-center justify-center font-bold transition-all cursor-pointer border border-stone-200"
          title="지도 확대"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => mapInstanceRef.current?.zoomOut()}
          className="w-10 h-10 rounded-xl bg-white hover:bg-stone-50 text-stone-800 shadow-lg flex items-center justify-center font-bold transition-all cursor-pointer border border-stone-200"
          title="지도 축소"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setView(currentPosition, 16, { animate: true });
            }
          }}
          className="w-10 h-10 rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-lg flex items-center justify-center font-bold transition-all cursor-pointer"
          title="내 위치로 지도 중심 이동"
        >
          <MapPin className="w-4 h-4" />
        </button>
      </div>

      {/* ========================================================
          BOTTOM HUD: METRICS, GOAL PROGRESS, ACTIONS
          ======================================================== */}
      <div className="z-20 bg-stone-900/95 backdrop-blur-md text-white p-4 sm:p-5 border-t border-stone-800 space-y-4">
        {/* Real-time Metrics Grid */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2 sm:p-3 bg-stone-800/80 rounded-2xl border border-stone-700/60">
            <div className="text-[10px] text-stone-400 font-medium">산책 시간</div>
            <div className="text-base sm:text-xl font-black text-white tabular-nums mt-0.5">
              {formatTime(walkSeconds)}
            </div>
            <div className="text-[10px] text-stone-500">
              {isPaused ? '일시정지' : '실시간 트래킹'}
            </div>
          </div>

          <div className="p-2 sm:p-3 bg-stone-800/80 rounded-2xl border border-stone-700/60">
            <div className="text-[10px] text-stone-400 font-medium">이동 거리</div>
            <div className="text-base sm:text-xl font-black text-amber-400 tabular-nums mt-0.5">
              {walkDistanceKm.toFixed(2)} <span className="text-[10px] font-bold text-stone-300">km</span>
            </div>
            <div className="text-[10px] text-amber-500/80 font-semibold">
              목표 {recommendedRoute.targetDistKm}km
            </div>
          </div>

          <div className="p-2 sm:p-3 bg-stone-800/80 rounded-2xl border border-stone-700/60">
            <div className="text-[10px] text-stone-400 font-medium">걸음수 & 소모</div>
            <div className="text-base sm:text-xl font-black text-white tabular-nums mt-0.5">
              {walkSteps.toLocaleString()} <span className="text-[10px] font-bold text-stone-400">보</span>
            </div>
            <div className="text-[10px] text-stone-400">{walkCalories} kcal</div>
          </div>

          <div className="p-2 sm:p-3 bg-stone-800/80 rounded-2xl border border-stone-700/60">
            <div className="text-[10px] text-stone-400 font-medium">적립 포인트</div>
            <div className="text-base sm:text-xl font-black text-amber-400 tabular-nums mt-0.5">
              +{earnedPoints} <span className="text-[10px] font-bold text-white">P</span>
            </div>
            <div className="text-[10px] text-stone-400">100m당 15P</div>
          </div>
        </div>

        {/* Progress Bar towards recommended route target */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span>추천 산책 목표 달성률</span>
            <span className="font-bold text-amber-400 tabular-nums">
              {Math.min(100, Math.round((walkDistanceKm / recommendedRoute.targetDistKm) * 100))}%
            </span>
          </div>
          <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-amber-500 to-emerald-400 transition-all duration-300"
              style={{
                width: `${Math.min(100, Math.round((walkDistanceKm / recommendedRoute.targetDistKm) * 100))}%`,
              }}
            />
          </div>
        </div>

        {/* Limit Warning Notice */}
        {hasReachedLimit && (
          <div className="p-2.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-xs text-amber-300 text-center">
            오늘의 산책 미션 일일 적립 한도({aiRecommendation.dailyMaxPointLimit}P)에 도달했습니다. 건강 산책 기록은 계속 저장됩니다. (출석체크 포인트와 독립 관리)
          </div>
        )}

        {/* Bottom Actions: Pause, Resume, Finish */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => setIsPaused((prev) => !prev)}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isPaused
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
            }`}
          >
            {isPaused ? (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>산책 재개</span>
              </>
            ) : (
              <>
                <Pause className="w-4 h-4" />
                <span>일시정지</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleFinishAttempt}
            className="flex-2 py-3 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs sm:text-sm font-black rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>산책 종료 및 기록 저장 ({earnedPoints}P 수령)</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          MODAL: 포인트 지급 보류 안내 (비정상 이동 or 신호 두절 감지)
          ======================================================== */}
      {showHoldModal && (
        <div className="absolute inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-6 text-center text-white animate-fadeIn">
          <div className="bg-stone-900 border-2 border-rose-500/60 rounded-3xl p-6 max-w-md shadow-2xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-2xl font-bold">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-rose-500/30 text-rose-300 text-[11px] font-black border border-rose-500/50">
                {walkMode === 'signal_lost' ? 'GPS 신호 단절 감지' : '비정상 이동 속도 감지 (35km/h)'}
              </div>
              <h3 className="text-lg font-black text-white">포인트 지급 보류 안내</h3>
              <p className="text-xs text-stone-300 leading-relaxed pt-1">
                모으개 안심 GPS 목걸이 모니터링 시스템에서 
                {walkMode === 'signal_lost' ? (
                  <> <strong>GPS 신호 끊김 현상</strong>이 감지되어 실제 반려견과의 안전 동행 여부가 확인되지 않았습니다.</>
                ) : (
                  <> 반려견 보행 속도 한계(시속 20km/h)를 현저히 초과한 <strong>차량 탑승 또는 고속 이동</strong>이 감지되었습니다.</>
                )}
              </p>
            </div>

            <div className="p-3.5 bg-stone-800/90 rounded-2xl text-left text-xs text-stone-300 space-y-1.5 border border-stone-700">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>공정 적립 보호 정책 안내</span>
              </div>
              <p className="text-[11px] text-stone-400 leading-snug">
                · 이번 산책의 이동 경로와 운동 기록은 건강 관리 목적으로 안전하게 보관되지만, <strong>리워드 포인트는 0P로 처리(지급 보류)</strong>됩니다.
              </p>
              <p className="text-[11px] text-stone-400 leading-snug">
                · 올바른 포인트 적립을 위해 반려견과 함께 도보로 안전하게 산책해 주시기 바랍니다.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowHoldModal(false);
                  setWalkMode('normal');
                }}
                className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-xl cursor-pointer"
              >
                정상 보행으로 산책 계속
              </button>
              <button
                type="button"
                onClick={() => executeFinishWithPoints(0)}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl shadow-xs cursor-pointer"
              >
                포인트 미지급으로 종료
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
