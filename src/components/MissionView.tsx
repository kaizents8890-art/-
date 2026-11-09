import React, { useState, useEffect } from 'react';
import {
  CalendarCheck2,
  Footprints,
  Sparkles,
  Play,
  Pause,
  Square,
  AlertCircle,
  Trophy,
  Sliders,
  CheckCircle2,
  Navigation,
  Flame,
  Clock,
  ShieldCheck,
  MapPin,
  History,
  Map as MapIcon,
  ChevronRight,
  X,
  Share2,
  Award,
  Radio,
  ShoppingBag,
  Link2
} from 'lucide-react';
import { AttendanceDay, WalkTarget, AiWalkRecommendation, UserProfile, WalkRecord, WalkPathPoint } from '../types';
import { triggerConfetti } from '../utils/confetti';
import { InteractiveWalkMap } from './InteractiveWalkMap';

interface MissionViewProps {
  user: UserProfile;
  attendanceDays: AttendanceDay[];
  walkTarget: WalkTarget;
  aiRecommendation: AiWalkRecommendation;
  dailyEarnedPoints: number;
  walkRecords: WalkRecord[];
  activeSubTab?: 'attendance' | 'walking';
  onCheckAttendance: () => void;
  onUpdateWalkTarget: (times: number, distance: number) => void;
  onFinishWalk: (earnedPoints: number, distanceKm: number, minutes: number, record?: WalkRecord) => void;
  onOpenGpsCollarModal?: () => void;
  onNavigateToShopCollar?: () => void;
}

export const MissionView: React.FC<MissionViewProps> = ({
  user,
  attendanceDays,
  walkTarget,
  aiRecommendation,
  dailyEarnedPoints,
  walkRecords,
  activeSubTab = 'walking',
  onCheckAttendance,
  onUpdateWalkTarget,
  onFinishWalk,
  onOpenGpsCollarModal,
  onNavigateToShopCollar,
}) => {
  const [subTab, setSubTab] = useState<'walking' | 'attendance' | 'history'>('walking');
  const [showCollarAlert, setShowCollarAlert] = useState(false);

  // Weekly Target Edit Modal
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [tempGoalTimes, setTempGoalTimes] = useState(walkTarget.weeklyGoalTimes);
  const [tempGoalDistance, setTempGoalDistance] = useState(walkTarget.weeklyGoalDistance);

  // Live Walking Simulation State
  const [isWalking, setIsWalking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [walkSeconds, setWalkSeconds] = useState(0);
  const [walkDistance, setWalkDistance] = useState(0); // km
  const [walkSteps, setWalkSteps] = useState(0);
  const [walkCalories, setWalkCalories] = useState(0);
  const [walkEarnedPoints, setWalkEarnedPoints] = useState(0);
  const [hasReachedCapNotice, setHasReachedCapNotice] = useState(false);
  const [currentPathPoints, setCurrentPathPoints] = useState<WalkPathPoint[]>([
    { x: 14, y: 76, timeSec: 0 },
  ]);

  // Modals for Walk Route Inspection
  const [completedWalkSummary, setCompletedWalkSummary] = useState<WalkRecord | null>(null);
  const [inspectedWalkRecord, setInspectedWalkRecord] = useState<WalkRecord | null>(null);

  // Walking timer effect
  useEffect(() => {
    let interval: any = null;
    if (isWalking && !isPaused) {
      interval = setInterval(() => {
        setWalkSeconds((s) => s + 1);

        // Simulating realistic movement (~4.0 km/h gentle pace)
        setWalkDistance((prevDist) => {
          const newDist = Number((prevDist + 0.0022).toFixed(3));
          return newDist;
        });

        setWalkSteps((s) => s + 2);
        setWalkCalories((c) => Number((c + 0.08).toFixed(1)));

        // Periodically append GPS coordinate simulation
        setCurrentPathPoints((prev) => {
          if (prev.length < 12) {
            const last = prev[prev.length - 1];
            const nextX = Math.min(92, last.x + Math.floor(Math.random() * 8) + 4);
            const nextY = Math.max(18, Math.min(82, last.y + (Math.random() > 0.5 ? 6 : -6)));
            return [...prev, { x: nextX, y: nextY, timeSec: prev.length * 120 }];
          }
          return prev;
        });

        // Calculate points: 15P per 100m, capped by dailyMaxPointLimit
        setWalkDistance((currentDist) => {
          const rawPoints = Math.floor(((currentDist * 1000) / 100) * aiRecommendation.pointsPer100m);
          const allowedToday = Math.max(0, aiRecommendation.dailyMaxPointLimit - dailyEarnedPoints);
          const finalPoints = Math.min(rawPoints, allowedToday);

          if (rawPoints >= allowedToday && allowedToday > 0) {
            setHasReachedCapNotice(true);
          }
          setWalkEarnedPoints(finalPoints);
          return currentDist;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWalking, isPaused, aiRecommendation, dailyEarnedPoints]);

  const handleStartWalk = () => {
    setIsWalking(true);
    setIsPaused(false);
    setWalkSeconds(0);
    setWalkDistance(0.01);
    setWalkSteps(18);
    setWalkCalories(1.2);
    setWalkEarnedPoints(0);
    setHasReachedCapNotice(false);
    setCurrentPathPoints([
      { x: 14, y: 76, timeSec: 0 },
      { x: 22, y: 64, timeSec: 120 },
      { x: 36, y: 52, timeSec: 240 },
    ]);
  };

  const handleCompleteWalk = () => {
    const minutes = Math.max(1, Math.round(walkSeconds / 60));
    const finalDist = Number(Math.max(0.1, walkDistance).toFixed(2));
    const now = new Date();
    const dateStr = `${now.getFullYear()}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now
      .getDate()
      .toString()
      .padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

    // Ensure route path has complete start and finish
    const finalPoints: WalkPathPoint[] =
      currentPathPoints.length >= 4
        ? currentPathPoints
        : [
            { x: 14, y: 76, timeSec: 0 },
            { x: 28, y: 58, timeSec: 300 },
            { x: 48, y: 68, timeSec: 600 },
            { x: 68, y: 40, timeSec: 900 },
            { x: 88, y: 32, timeSec: 1200 },
          ];

    const newRecord: WalkRecord = {
      id: `walk_${Date.now()}`,
      date: dateStr,
      courseName: '연남 경의선 숲길 평지 산책로',
      distanceKm: finalDist,
      durationMinutes: minutes,
      steps: Math.max(walkSteps, Math.round(finalDist * 1400)),
      calories: Math.max(walkCalories, Math.round(finalDist * 65)),
      earnedPoints: walkEarnedPoints || Math.min(aiRecommendation.dailyMaxPointLimit, Math.floor(finalDist * 150)),
      paceNote: '완만한 평지 / 관절 친화 우레탄길',
      pathPoints: finalPoints,
      memo: `${user.petName}의 컨디션 양호. 무리 없이 가벼운 평지 산책 완주.`,
    };

    onFinishWalk(newRecord.earnedPoints, finalDist, minutes, newRecord);
    setIsWalking(false);
    setIsPaused(false);
    setCompletedWalkSummary(newRecord);
    triggerConfetti();
  };

  const todayAttendance = attendanceDays.find((d) => d.isToday);
  const weeklyTimesPercent = Math.min(100, Math.round((walkTarget.currentWeekTimes / walkTarget.weeklyGoalTimes) * 100));
  const weeklyDistPercent = Math.min(100, Math.round((walkTarget.currentWeekDistance / walkTarget.weeklyGoalDistance) * 100));
  const dailyPointsRemaining = Math.max(0, aiRecommendation.dailyMaxPointLimit - dailyEarnedPoints);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // SVG Path Generator from Points
  const buildSvgPath = (points: WalkPathPoint[]) => {
    if (!points || points.length === 0) return '';
    return points.reduce((acc, pt, idx) => {
      if (idx === 0) return `M ${pt.x * 4} ${pt.y * 2.2}`;
      return `${acc} L ${pt.x * 4} ${pt.y * 2.2}`;
    }, '');
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-6">
      {/* Sub-navigation matching IA: 산책 미션 / 이전 산책 기록 및 지도 / 출석체크 */}
      <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-2xl">
        <button
          onClick={() => setSubTab('walking')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            subTab === 'walking'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Footprints className="w-3.5 h-3.5" />
          <span>산책 미션 & 트래킹</span>
        </button>
        <button
          onClick={() => setSubTab('history')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            subTab === 'history'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>산책 기록 보관함 ({walkRecords.length})</span>
        </button>
        <button
          onClick={() => setSubTab('attendance')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            subTab === 'attendance'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <CalendarCheck2 className="w-3.5 h-3.5" />
          <span>출석체크</span>
          {!todayAttendance?.isChecked && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
          )}
        </button>
      </div>

      {/* =========================================
          SUB-TAB 1: 산책 미션 & 실시간 트래킹
          ========================================= */}
      {subTab === 'walking' && (
        <div className="space-y-4">
          {/* Active Live Walk Session Mode with Leaflet & Real-time GPS Navigation */}
          {isWalking ? (
            <InteractiveWalkMap
              user={user}
              aiRecommendation={aiRecommendation}
              walkTarget={walkTarget}
              dailyEarnedPoints={dailyEarnedPoints}
              isWalking={isWalking}
              onFinishWalk={(earnedPoints, dist, mins, record) => {
                setIsWalking(false);
                setIsPaused(false);
                onFinishWalk(earnedPoints, dist, mins, record);
                if (record) {
                  setCompletedWalkSummary(record);
                }
                triggerConfetti();
              }}
              onCancelWalk={() => {
                setIsWalking(false);
                setIsPaused(false);
              }}
            />
          ) : (
            /* Standby Walk Hub */
            <>
              {/* IA: AI 맞춤 산책 포인트 설정 */}
              <div className="bg-white rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-stone-900">AI 맞춤 산책 포인트 설정</h3>
                      <p className="text-[11px] text-stone-500">반려동물 건강정보 반영 & 맞춤 산책량 추천</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">
                    맞춤 분석 완료
                  </span>
                </div>

                {/* Health Condition Reflection Banner */}
                <div className="bg-stone-50 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-800">
                    <span className="flex items-center gap-1 text-amber-800">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      {user.petName}의 건강 프로필 반영
                    </span>
                    <span className="text-stone-500">{user.petBreed} · {user.petAge}세</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    현재 <strong>{user.petCondition}</strong> 관리 중이므로 무리한 등산이나 계단을 피하고 평지 위주의 가벼운 산책을 권장합니다.
                  </p>
                </div>

                {/* Recommended Target Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-amber-50/60 rounded-2xl p-3.5">
                    <div className="flex items-center gap-1.5 text-xs text-amber-800 font-medium">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>일일 권장 산책 시간</span>
                    </div>
                    <div className="text-xl font-bold text-amber-950 mt-1 tabular-nums">
                      {aiRecommendation.recommendedDailyMinutes}
                      <span className="text-xs font-normal text-stone-600 ml-1">분</span>
                    </div>
                    <div className="text-[11px] text-amber-700/80 mt-0.5">
                      권장 거리: 약 {aiRecommendation.recommendedDailyKm}km
                    </div>
                  </div>

                  <div className="bg-emerald-50/60 rounded-2xl p-3.5">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-medium">
                      <Flame className="w-3.5 h-3.5 text-emerald-600" />
                      <span>산책 포인트 적립 규칙</span>
                    </div>
                    <div className="text-xl font-bold text-emerald-950 mt-1 tabular-nums">
                      15
                      <span className="text-xs font-normal text-stone-600 ml-1">P / 100m</span>
                    </div>
                    <div className="text-[11px] text-emerald-700/80 mt-0.5">
                      안전 권장 페이스 적용
                    </div>
                  </div>
                </div>

                {/* Daily Cap Info */}
                <div className="p-3.5 rounded-2xl bg-stone-50 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-800 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      산책 미션 일일 적립량 ({dailyEarnedPoints} / {aiRecommendation.dailyMaxPointLimit}P)
                    </span>
                    <span className="text-stone-500 font-mono text-[11px]">
                      잔여 {dailyPointsRemaining}P
                    </span>
                  </div>

                  <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (dailyEarnedPoints / aiRecommendation.dailyMaxPointLimit) * 100)}%`,
                      }}
                    />
                  </div>

                  <p className="text-[11px] text-stone-500">
                    * 산책을 통해 획득한 포인트만 산책 미션 한도에 반영됩니다. (출석체크 포인트는 독립 지급)
                  </p>
                </div>

                {/* GPS Collar Connection State Banner */}
                {user.gpsCollarConnected ? (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-between text-xs text-emerald-900">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-bold">GPS 목걸이 정상 연동 중</span>
                        <span className="text-emerald-700 ml-1.5 font-mono text-[11px]">
                          ({user.gpsCollarDeviceId || 'MOGE-GPS-9482'} · 배터리 {user.gpsCollarBattery ?? 94}%)
                        </span>
                      </div>
                    </div>
                    {onOpenGpsCollarModal && (
                      <button
                        type="button"
                        onClick={onOpenGpsCollarModal}
                        className="text-[11px] text-emerald-800 hover:text-emerald-950 font-bold underline cursor-pointer"
                      >
                        기기 관리
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-400/80 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                        <Radio className="w-5 h-5 animate-pulse" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs sm:text-sm font-black text-stone-900">
                          GPS 산책 목걸이 연결이 필요합니다
                        </h4>
                        <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                          모으개는 부정 적립을 방지하고 실제 반려견과의 안전 동행을 확인하기 위해, <strong>공식 스마트 GPS 목걸이가 연동된 상태에서만 산책 미션 시작 및 포인트 적립을 허용</strong>합니다.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      {onOpenGpsCollarModal && (
                        <button
                          type="button"
                          onClick={onOpenGpsCollarModal}
                          className="flex-1 py-2.5 px-3 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Link2 className="w-3.5 h-3.5" />
                          <span>GPS 목걸이 등록 / 연동하기</span>
                        </button>
                      )}
                      {onNavigateToShopCollar && (
                        <button
                          type="button"
                          onClick={onNavigateToShopCollar}
                          className="flex-1 py-2.5 px-3 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
                          <span>SHOP에서 목걸이 보기</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Primary Start Walk CTA */}
                {user.gpsCollarConnected ? (
                  <button
                    onClick={handleStartWalk}
                    className="w-full py-4 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white text-white" />
                    <span>{user.petName}와(과) 맞춤 산책 시작하기</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (onOpenGpsCollarModal) {
                        onOpenGpsCollarModal();
                      } else {
                        setShowCollarAlert(true);
                      }
                    }}
                    className="w-full py-4 bg-stone-200 hover:bg-amber-100 text-stone-700 hover:text-amber-900 font-bold rounded-2xl transition-all border border-dashed border-stone-400 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Radio className="w-4 h-4 text-amber-600" />
                    <span>GPS 산책 목걸이 연결 필요 (미연결 상태)</span>
                  </button>
                )}
              </div>

              {/* Weekly Target Box */}
              <div className="bg-white rounded-3xl p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <h3 className="text-sm font-bold text-stone-900">주간 산책 목표</h3>
                  </div>
                  <button
                    onClick={() => setIsEditingTarget(true)}
                    className="text-xs text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1"
                  >
                    <Sliders className="w-3 h-3" />
                    목표 설정
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-stone-600">주간 산책 횟수 달성</span>
                      <span className="font-bold text-stone-900 tabular-nums">
                        {walkTarget.currentWeekTimes}회 / {walkTarget.weeklyGoalTimes}회 ({weeklyTimesPercent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${weeklyTimesPercent}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-stone-600">주간 누적 산책 거리</span>
                      <span className="font-bold text-stone-900 tabular-nums">
                        {walkTarget.currentWeekDistance.toFixed(1)}km / {walkTarget.weeklyGoalDistance.toFixed(1)}km ({weeklyDistPercent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${weeklyDistPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* =========================================
          SUB-TAB 2: 산책 기록 보관함 & 지도 다시보기 (Requirement 5)
          ========================================= */}
      {subTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-900">완료된 산책 경로 및 히스토리</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                과거의 산책 경로 지도와 거리, 소요 시간, 보호자 메모를 언제든 다시 열람할 수 있습니다.
              </p>
            </div>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
              총 {walkRecords.length}회 완주
            </span>
          </div>

          <div className="space-y-3">
            {walkRecords.map((record) => (
              <div
                key={record.id}
                className="bg-white rounded-3xl p-5 border border-stone-200 hover:border-amber-300 transition-all shadow-xs flex flex-col md:flex-row items-stretch justify-between gap-4"
              >
                {/* Mini SVG Route Thumbnail */}
                <div
                  onClick={() => setInspectedWalkRecord(record)}
                  className="w-full md:w-36 h-28 bg-stone-900 rounded-2xl relative overflow-hidden cursor-pointer group shrink-0 border border-stone-800"
                >
                  <svg className="w-full h-full opacity-80" viewBox="0 0 400 220" preserveAspectRatio="none">
                    <path d="M 0,160 Q 150,130 400,180 L 400,220 L 0,220 Z" fill="#14532d" opacity="0.4" />
                    <path
                      d={buildSvgPath(record.pathPoints)}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="6"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <span className="text-[11px] font-bold text-white bg-black/60 px-2 py-1 rounded-md backdrop-blur-xs flex items-center gap-1">
                      <MapIcon className="w-3 h-3 text-amber-400" />
                      지도 보기
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-stone-400 font-medium">{record.date}</span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {record.paceNote}
                        </span>
                      </div>
                      <span className="text-xs font-black text-amber-600 tabular-nums">
                        +{record.earnedPoints} P 적립
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-stone-900 mt-1">{record.courseName}</h4>

                    {/* Stats pills */}
                    <div className="flex items-center gap-3 text-xs text-stone-600 mt-2 font-medium">
                      <span>거리: <strong className="text-stone-900">{record.distanceKm} km</strong></span>
                      <span>·</span>
                      <span>시간: <strong className="text-stone-900">{record.durationMinutes} 분</strong></span>
                      <span>·</span>
                      <span>걸음수: <strong className="text-stone-900">{record.steps.toLocaleString()} 보</strong></span>
                      <span>·</span>
                      <span>열량: <strong className="text-stone-900">{record.calories} kcal</strong></span>
                    </div>

                    {record.memo && (
                      <p className="text-xs text-amber-900/90 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/80 mt-2">
                        💬 <strong>보호자 메모:</strong> {record.memo}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setInspectedWalkRecord(record)}
                      className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs transition-all"
                    >
                      <span>실제 산책 경로 지도 확인</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================
          SUB-TAB 3: 출석체크 (Attendance Check)
          ========================================= */}
      {subTab === 'attendance' && (
        <div className="bg-white rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-900">7일 연속 출석체크</h3>
              <p className="text-xs text-stone-500 mt-0.5">매일 100P 적립 + 7일차 보너스 150P 지급!</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl">
                7일차 특별 보너스
              </span>
            </div>
          </div>

          {/* Streak Stamp Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 pt-2">
            {attendanceDays.map((day) => (
              <div
                key={day.dayNumber}
                className={`flex flex-col items-center justify-between p-2.5 rounded-2xl border text-center transition-all ${
                  day.isChecked
                    ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
                    : day.isToday
                    ? 'bg-stone-50 border-amber-400 ring-2 ring-amber-400/20 text-stone-900'
                    : 'bg-stone-50/60 border-stone-200 text-stone-400'
                }`}
              >
                <span className="text-[10px] font-medium">{day.dateStr.split(' ')[0]}</span>

                <div className="my-2">
                  {day.isChecked ? (
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      🐾
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full border border-dashed border-stone-300 flex items-center justify-center text-xs text-stone-400 font-semibold">
                      {day.dayNumber}일
                    </div>
                  )}
                </div>

                <span className="text-[10px] font-semibold tabular-nums">
                  +{day.rewardPoints}P
                </span>
              </div>
            ))}
          </div>

          {/* Today Attendance Trigger Button */}
          <div className="pt-2">
            {todayAttendance?.isChecked ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  오늘 출석체크 완료 (+150P 적립 완료)
                </div>
                <p className="text-xs text-emerald-700">
                  내일도 잊지 말고 출석하여 의료비 포인트를 모아보세요!
                </p>
              </div>
            ) : (
              <button
                onClick={() => {
                  onCheckAttendance();
                  triggerConfetti();
                }}
                className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl transition-all shadow-md shadow-amber-500/20 active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <span>오늘 출석체크하고 +150P 받기</span>
                <span>🐾</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* =========================================
          MODAL: 산책 완료 직후 실제 산책 경로 지도 & 통계 (Requirement 5)
          ========================================= */}
      {completedWalkSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-stone-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  🎉 산책 완주 성공!
                </span>
                <h3 className="text-lg font-bold text-stone-900 mt-1">
                  {user.petName}와(과)의 실제 산책 경로 기록
                </h3>
                <p className="text-xs text-stone-500">{completedWalkSummary.date} · {completedWalkSummary.courseName}</p>
              </div>
              <button
                onClick={() => setCompletedWalkSummary(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Large Interactive SVG Route Map */}
            <div className="relative h-60 bg-stone-900 rounded-2xl overflow-hidden border border-stone-800 p-4">
              <svg className="w-full h-full" viewBox="0 0 400 220" preserveAspectRatio="none">
                {/* Park greenery */}
                <path d="M 0,160 Q 150,130 400,180 L 400,220 L 0,220 Z" fill="#14532d" opacity="0.45" />
                <path d="M 0,30 Q 200,60 400,20 L 400,0 L 0,0 Z" fill="#14532d" opacity="0.35" />
                {/* Stream / Trail reference */}
                <path d="M 0,110 Q 180,80 400,130" fill="none" stroke="#0284c7" strokeWidth="12" opacity="0.25" />
                {/* Trajectory */}
                <path
                  d={buildSvgPath(completedWalkSummary.pathPoints)}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              {/* Start Pin */}
              <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg"
                style={{
                  left: `${completedWalkSummary.pathPoints[0]?.x || 14}%`,
                  top: `${completedWalkSummary.pathPoints[0]?.y || 76}%`,
                }}
              >
                <MapPin className="w-3 h-3" />
                <span>출발</span>
              </div>

              {/* Finish Pin */}
              <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 flex items-center gap-1 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg"
                style={{
                  left: `${completedWalkSummary.pathPoints[completedWalkSummary.pathPoints.length - 1]?.x || 88}%`,
                  top: `${completedWalkSummary.pathPoints[completedWalkSummary.pathPoints.length - 1]?.y || 32}%`,
                }}
              >
                <Award className="w-3 h-3" />
                <span>도착 (완주)</span>
              </div>

              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-stone-300 bg-stone-900/80 px-3 py-1.5 rounded-xl backdrop-blur-xs border border-stone-700">
                <span>📍 실제 측정된 GPS 보행 궤적</span>
                <span className="text-emerald-400 font-semibold">{completedWalkSummary.paceNote}</span>
              </div>
            </div>

            {/* Core Metrics */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                <span className="text-[11px] text-stone-400 font-medium">산책 거리</span>
                <div className="text-base font-extrabold text-stone-900 mt-0.5 tabular-nums">
                  {completedWalkSummary.distanceKm} <span className="text-xs font-normal">km</span>
                </div>
              </div>
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                <span className="text-[11px] text-stone-400 font-medium">소요 시간</span>
                <div className="text-base font-extrabold text-stone-900 mt-0.5 tabular-nums">
                  {completedWalkSummary.durationMinutes} <span className="text-xs font-normal">분</span>
                </div>
              </div>
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
                <span className="text-[11px] text-stone-400 font-medium">총 걸음 수</span>
                <div className="text-base font-extrabold text-stone-900 mt-0.5 tabular-nums">
                  {completedWalkSummary.steps.toLocaleString()}
                </div>
              </div>
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
                <span className="text-[11px] text-amber-800 font-semibold">적립 포인트</span>
                <div className="text-base font-extrabold text-amber-600 mt-0.5 tabular-nums">
                  +{completedWalkSummary.earnedPoints} <span className="text-xs font-normal">P</span>
                </div>
              </div>
            </div>

            {/* Pet Health Note */}
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>관절 보호 케어 완료</span>
              </div>
              <p className="leading-relaxed text-emerald-800 text-[11px]">
                {completedWalkSummary.memo} 적립된 {completedWalkSummary.earnedPoints}P는 마이페이지 의료비 목표로 자동 누적되었습니다.
              </p>
            </div>

            <button
              onClick={() => setCompletedWalkSummary(null)}
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
            >
              확인 및 닫기
            </button>
          </div>
        </div>
      )}

      {/* =========================================
          MODAL: 이전 산책 기록 상세 지도 열람 (Re-inspect Historical Walk)
          ========================================= */}
      {inspectedWalkRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-stone-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  산책 기록 상세 지도
                </span>
                <h3 className="text-base font-bold text-stone-900 mt-1">{inspectedWalkRecord.courseName}</h3>
                <p className="text-xs text-stone-400">{inspectedWalkRecord.date}</p>
              </div>
              <button
                onClick={() => setInspectedWalkRecord(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* SVG Map Canvas */}
            <div className="relative h-60 bg-stone-900 rounded-2xl overflow-hidden border border-stone-800 p-4">
              <svg className="w-full h-full" viewBox="0 0 400 220" preserveAspectRatio="none">
                <path d="M 0,160 Q 150,130 400,180 L 400,220 L 0,220 Z" fill="#14532d" opacity="0.45" />
                <path d="M 0,30 Q 200,60 400,20 L 400,0 L 0,0 Z" fill="#14532d" opacity="0.35" />
                <path d="M 0,110 Q 180,80 400,130" fill="none" stroke="#0284c7" strokeWidth="12" opacity="0.25" />
                <path
                  d={buildSvgPath(inspectedWalkRecord.pathPoints)}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              {/* Start & End */}
              <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg"
                style={{
                  left: `${inspectedWalkRecord.pathPoints[0]?.x || 15}%`,
                  top: `${inspectedWalkRecord.pathPoints[0]?.y || 80}%`,
                }}
              >
                <MapPin className="w-3 h-3" />
                <span>출발</span>
              </div>

              <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 flex items-center gap-1 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg"
                style={{
                  left: `${inspectedWalkRecord.pathPoints[inspectedWalkRecord.pathPoints.length - 1]?.x || 88}%`,
                  top: `${inspectedWalkRecord.pathPoints[inspectedWalkRecord.pathPoints.length - 1]?.y || 40}%`,
                }}
              >
                <Award className="w-3 h-3" />
                <span>도착</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-3 bg-stone-50 rounded-2xl">
                <span className="text-stone-400">거리</span>
                <div className="text-sm font-bold text-stone-900 mt-0.5">{inspectedWalkRecord.distanceKm} km</div>
              </div>
              <div className="p-3 bg-stone-50 rounded-2xl">
                <span className="text-stone-400">시간</span>
                <div className="text-sm font-bold text-stone-900 mt-0.5">{inspectedWalkRecord.durationMinutes} 분</div>
              </div>
              <div className="p-3 bg-stone-50 rounded-2xl">
                <span className="text-stone-400">걸음</span>
                <div className="text-sm font-bold text-stone-900 mt-0.5">{inspectedWalkRecord.steps.toLocaleString()} 보</div>
              </div>
              <div className="p-3 bg-amber-50 rounded-2xl">
                <span className="text-amber-800">적립 포인트</span>
                <div className="text-sm font-bold text-amber-600 mt-0.5">+{inspectedWalkRecord.earnedPoints} P</div>
              </div>
            </div>

            {inspectedWalkRecord.memo && (
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-700 space-y-1">
                <span className="font-bold text-stone-900">보호자 산책 일지 / 메모</span>
                <p className="leading-relaxed">{inspectedWalkRecord.memo}</p>
              </div>
            )}

            <button
              onClick={() => setInspectedWalkRecord(null)}
              className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* Target Setting Modal */}
      {isEditingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl border border-stone-200 space-y-4">
            <h3 className="text-sm font-bold text-stone-900">주간 산책 목표 설정</h3>
            <p className="text-xs text-stone-500">
              {user.petName}의 컨디션에 맞게 주간 횟수와 목표 거리를 조정해 주세요.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  주간 산책 횟수: <strong>{tempGoalTimes}회</strong>
                </label>
                <input
                  type="range"
                  min="2"
                  max="14"
                  value={tempGoalTimes}
                  onChange={(e) => setTempGoalTimes(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">
                  주간 목표 거리: <strong>{tempGoalDistance} km</strong>
                </label>
                <input
                  type="range"
                  min="5"
                  max="35"
                  step="0.5"
                  value={tempGoalDistance}
                  onChange={(e) => setTempGoalDistance(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsEditingTarget(false)}
                className="px-3.5 py-2 text-xs text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                취소
              </button>
              <button
                onClick={() => {
                  onUpdateWalkTarget(tempGoalTimes, tempGoalDistance);
                  setIsEditingTarget(false);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl"
              >
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
