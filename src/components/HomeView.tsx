import React, { useState } from 'react';
import {
  ChevronRight,
  ArrowRight,
  Footprints,
  HeartPulse,
  X,
  ShieldCheck,
  CalendarCheck2
} from 'lucide-react';
import { UserProfile, AttendanceDay, MedicalGoal, Hospital } from '../types';

interface HomeViewProps {
  user: UserProfile;
  attendanceDays: AttendanceDay[];
  points: number;
  dailyEarnedPoints: number;
  dailyMaxLimit: number;
  medicalGoals: MedicalGoal[];
  nearbyEmergencyHospital: Hospital;
  onNavigate: (tab: 'home' | 'mission' | 'shop' | 'community' | 'hospital' | 'mypage', subTab?: string) => void;
  onCheckAttendance: () => void;
  onStartWalk: () => void;
  onSelectPrimaryGoal?: (goalId: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  user,
  attendanceDays,
  points,
  dailyEarnedPoints,
  dailyMaxLimit,
  medicalGoals,
  nearbyEmergencyHospital,
  onNavigate,
  onCheckAttendance,
  onStartWalk,
  onSelectPrimaryGoal,
}) => {
  // Guide Modal State for "모으개가 처음이신가요?"
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  // Active primary medical goal
  const activeGoal = medicalGoals.find((g) => g.isPrimary) || medicalGoals[0];
  const goalPercent = activeGoal
    ? Math.min(100, Math.round((activeGoal.currentAmount / activeGoal.targetAmount) * 100))
    : 42;

  const todayAttendance = attendanceDays.find((d) => d.isToday);

  return (
    <div className="space-y-6 animate-fadeIn pb-10 max-w-5xl mx-auto">
      {/* ========================================================
          1. HERO SECTION (최상단 메인 섹션)
          Two-column grid: Left illustration & Right title + features + CTAs
          ======================================================== */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-100 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left: Walking Illustration (Balanced size) */}
          <div className="md:col-span-5 flex justify-center md:justify-start">
            <div className="w-full max-w-[280px] sm:max-w-[310px] aspect-square rounded-3xl overflow-hidden border border-amber-100/70 shadow-xs bg-amber-50/20">
              <img
                src="/assets/brand/hero_walk_park.png"
                alt="반려견과 함께 걷는 산책"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right: Headlines, 3 Mini-Highlights, 2 CTA Buttons */}
          <div className="md:col-span-7 space-y-5">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-stone-900 tracking-tight leading-tight">
                함께 걷는 오늘,<br />
                <span className="text-amber-500 inline-flex items-center gap-1.5">
                  모이는 내일
                  <span className="text-xl sm:text-2xl inline-block -rotate-6">✨</span>
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 mt-2 sm:mt-3 leading-relaxed">
                매일의 산책과 작은 돌봄이<br />
                우리 아이의 건강한 미래를 위한 포인트가 됩니다.
              </p>
            </div>

            {/* 3 Mini Feature Highlights with vertical dividers */}
            <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-6 py-2 border-y border-stone-100/80">
              {/* Feature 1: 산책 리워드 */}
              <div className="flex-1 sm:flex-initial sm:w-24 flex flex-col items-center text-center">
                <div className="w-11 h-11 rounded-full bg-[#FFF3E6] border border-amber-200/60 flex items-center justify-center text-amber-600 shadow-2xs mb-1.5">
                  <Footprints className="w-5 h-5 text-amber-500" />
                </div>
                <span className="text-xs font-bold text-stone-800 whitespace-nowrap">산책 리워드</span>
              </div>

              <div className="w-px h-8 bg-stone-200/80" />

              {/* Feature 2: 건강 관리 */}
              <div className="flex-1 sm:flex-initial sm:w-24 flex flex-col items-center text-center">
                <div className="w-11 h-11 rounded-full bg-[#FFEAE6] border border-rose-200/60 flex items-center justify-center text-rose-500 shadow-2xs mb-1.5">
                  <HeartPulse className="w-5 h-5 text-rose-500" />
                </div>
                <span className="text-xs font-bold text-stone-800 whitespace-nowrap">건강 관리</span>
              </div>

              <div className="w-px h-8 bg-stone-200/80" />

              {/* Feature 3: 의료비 준비 (포인트 아이콘 적용) */}
              <div className="flex-1 sm:flex-initial sm:w-24 flex flex-col items-center text-center">
                <div className="w-11 h-11 rounded-full bg-[#FFF6DB] border border-amber-200/60 flex items-center justify-center shadow-2xs mb-1.5 p-2">
                  <img
                    src="/assets/brand/point_coin.png"
                    alt="의료비 준비 포인트"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-xs font-bold text-stone-800 whitespace-nowrap">의료비 준비</span>
              </div>
            </div>

            {/* 2 Action CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
              <button
                onClick={onStartWalk}
                className="flex-1 py-3 px-5 bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>지금 시작하기</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsGuideModalOpen(true)}
                className="flex-1 py-3 px-5 bg-white hover:bg-stone-50 active:scale-[0.99] border border-stone-200 text-stone-700 font-bold text-xs sm:text-sm rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>모으개가 처음이신가요?</span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. WELCOME POINT BANNER (환영 포인트 띠 배너)
          ======================================================== */}
      <div
        onClick={() => onNavigate('mypage', 'benefits')}
        className="w-full bg-[#FFF9F3] hover:bg-[#FFF4E8] border border-amber-200/80 rounded-2xl py-3 px-4 sm:px-6 flex items-center justify-between text-xs sm:text-sm font-bold text-stone-800 transition-all cursor-pointer shadow-2xs group"
        title="포인트 내역 확인하기"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-lg shrink-0">📢</span>
          <span className="truncate">
            지금 회원가입하고 <strong className="text-amber-600 font-black">2,000P 환영 포인트</strong>를 받아보세요!
          </span>
        </div>
        <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
      </div>

      {/* ========================================================
          3. 2-COLUMN HIGHLIGHTS GRID (주요 핵심 카드 2분할)
          Left: 모으개 GPS 산책 목걸이 / Right: 우리 아이 의료비 목표
          ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Card: 모으개 GPS 산책 목걸이 (실제 사진 적용) */}
        <div className="bg-[#FFF8F2] border border-orange-100/90 rounded-3xl p-6 shadow-xs relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-all min-h-[180px]">
          <div className="relative z-10 max-w-[210px] sm:max-w-[230px]">
            <h3 className="text-base sm:text-lg font-black text-stone-900 tracking-tight leading-snug">
              모으개<br />GPS 산책 목걸이
            </h3>
            <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
              산책 기록부터 위치 확인까지!<br />
              더 안전하고 특별한 산책을 시작하세요.
            </p>
            <button
              onClick={() => onNavigate('shop')}
              className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1 w-fit cursor-pointer"
            >
              <span>모으개 SHOP 바로가기</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Visual GPS Collar Photo (전달받은 공식 사진 적용) */}
          <div className="absolute right-2 bottom-1 w-36 h-28 sm:w-40 sm:h-32 pointer-events-none flex items-center justify-center p-1">
            <img
              src="/assets/brand/gps_collar_photo.png"
              alt="모으개 스마트 GPS 산책 목걸이"
              className="w-full h-full object-contain filter drop-shadow-sm"
            />
          </div>
        </div>

        {/* Right Card: 우리 아이 의료비 목표 (건강관리 체크리스트 아이콘 적용) */}
        <div
          onClick={() => onNavigate('mypage', 'points')}
          className="bg-[#F4FAF5] border border-emerald-100 rounded-3xl p-6 shadow-xs relative overflow-hidden flex flex-col justify-between cursor-pointer group hover:shadow-md transition-all min-h-[180px]"
          title="목표 관리 페이지로 이동"
        >
          <div className="relative z-10">
            <div className="max-w-[210px] sm:max-w-[230px]">
              <h3 className="text-base sm:text-lg font-black text-stone-900 tracking-tight leading-snug">
                우리 아이<br />의료비 목표
              </h3>
              <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                예상치 못한 병원비도<br />
                미리, 차근차근 준비해요.
              </p>
            </div>

            {/* Health Checklist Icon (전달받은 아이콘 적용) */}
            <div className="absolute right-4 top-4 w-18 h-18 pointer-events-none">
              <img
                src="/assets/brand/icon_health_checklist.png"
                alt="건강관리 체크리스트"
                className="w-full h-full object-contain filter drop-shadow-xs"
              />
            </div>
          </div>

          {/* Inner Goal Progress Bar Card */}
          <div className="relative z-10 bg-white rounded-2xl p-3.5 shadow-2xs border border-stone-100 mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-stone-800">
                <span className="text-sm">🐾</span>
                <span>의료비 목표 ({activeGoal?.title || '정기 건강검진'})</span>
              </div>
              <div className="font-black text-stone-900 tabular-nums">
                <span>{activeGoal?.targetAmount.toLocaleString()}P</span>
                <span className="text-amber-600 ml-1.5 font-bold">{goalPercent}%</span>
              </div>
            </div>
            {/* Progress Bar Track */}
            <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-700"
                style={{ width: `${goalPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          4. 3-COLUMN SERVICE SHORTCUTS GRID (3열 주요 서비스)
          산책 미션 / 동물병원 / 커뮤니티 (전달받은 전용 아이콘 적용)
          ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: 산책 미션 */}
        <div
          onClick={() => onNavigate('mission')}
          className="bg-[#FFFBF5] hover:bg-[#FFF6EA] border border-orange-100/80 rounded-3xl p-5 shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-16 h-12 mb-2 flex items-center">
              <img
                src="/assets/brand/icon_walk_mission_map.png"
                alt="산책 미션"
                className="w-full h-full object-contain"
              />
            </div>
            <h4 className="text-sm font-bold text-stone-900 group-hover:text-amber-700 transition-colors">
              산책 미션
            </h4>
            <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
              함께 걸을수록<br />차곡차곡 쌓이는 포인트
            </p>
          </div>
          <div className="pt-3 flex items-center justify-between text-[11px] text-amber-700 font-semibold border-t border-orange-100/40 mt-3">
            <span>오늘 적립 {dailyEarnedPoints}/{dailyMaxLimit}P</span>
            <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

        {/* Card 2: 동물병원 */}
        <div
          onClick={() => onNavigate('hospital')}
          className="bg-[#FFFBF5] hover:bg-[#FFF6EA] border border-orange-100/80 rounded-3xl p-5 shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-16 h-12 mb-2 flex items-center">
              <img
                src="/assets/brand/icon_hospital_building.png"
                alt="동물병원"
                className="w-full h-full object-contain"
              />
            </div>
            <h4 className="text-sm font-bold text-stone-900 group-hover:text-amber-700 transition-colors">
              동물병원
            </h4>
            <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
              우리 아이에게 가까운<br />동물병원을 찾아보세요
            </p>
          </div>
          <div className="pt-3 flex items-center justify-between text-[11px] text-amber-700 font-semibold border-t border-orange-100/40 mt-3">
            <span className="truncate max-w-[160px]">24시: {nearbyEmergencyHospital.name.slice(0, 10)}...</span>
            <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>
        </div>

        {/* Card 3: 커뮤니티 */}
        <div
          onClick={() => onNavigate('community')}
          className="bg-[#FFFBF5] hover:bg-[#FFF6EA] border border-orange-100/80 rounded-3xl p-5 shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-16 h-12 mb-2 flex items-center">
              <img
                src="/assets/brand/icon_community_speech.png"
                alt="커뮤니티"
                className="w-full h-full object-contain"
              />
            </div>
            <h4 className="text-sm font-bold text-stone-900 group-hover:text-amber-700 transition-colors">
              커뮤니티
            </h4>
            <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
              반려인들과 정보도 나누고<br />일상도 함께해요
            </p>
          </div>
          <div className="pt-3 flex items-center justify-between text-[11px] text-amber-700 font-semibold border-t border-orange-100/40 mt-3">
            <span>응급 대처 가이드</span>
            <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </div>

      {/* ========================================================
          5. "이런 서비스도 있어요!" 4-COLUMN FEATURE GRID (4열 주요 서비스)
          SHOP / 산책 경로 / 건강 기록 / 레벨·배지 (전달받은 전용 아이콘 적용)
          ======================================================== */}
      <div className="space-y-4 pt-3">
        <div className="text-center">
          <span className="px-3.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200/60 inline-block mb-1.5">
            모으개 주요 서비스
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-stone-900 flex items-center justify-center gap-1.5">
            <span className="text-amber-500">✨</span> 이런 서비스도 있어요!
          </h3>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Service 1: 모으개 SHOP */}
          <div
            onClick={() => onNavigate('shop')}
            className="bg-[#FFFBF5] hover:bg-[#FFF6EA] border border-orange-100/80 rounded-3xl p-5 shadow-xs transition-all cursor-pointer group flex flex-col justify-between text-center"
          >
            <div className="space-y-2">
              <div className="w-14 h-14 mx-auto flex items-center justify-center">
                <img
                  src="/assets/brand/icon_shop_bag.png"
                  alt="모으개 SHOP"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900 group-hover:text-amber-700 transition-colors">
                  모으개 SHOP
                </h4>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  산책부터 일상까지<br />필요한 반려동물 용품
                </p>
              </div>
            </div>
            <div className="pt-3 flex justify-center text-stone-400 group-hover:text-amber-600 transition-colors">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Service 2: 산책 경로 기록 */}
          <div
            onClick={() => onNavigate('mypage', 'walks')}
            className="bg-[#FFFBF5] hover:bg-[#FFF6EA] border border-orange-100/80 rounded-3xl p-5 shadow-xs transition-all cursor-pointer group flex flex-col justify-between text-center"
          >
            <div className="space-y-2">
              <div className="w-14 h-14 mx-auto flex items-center justify-center">
                <img
                  src="/assets/brand/icon_route_tablet.png"
                  alt="산책 경로 기록"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900 group-hover:text-amber-700 transition-colors">
                  산책 경로 기록
                </h4>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  GPS로 우리 아이의<br />산책 경로를 한눈에!
                </p>
              </div>
            </div>
            <div className="pt-3 flex justify-center text-stone-400 group-hover:text-amber-600 transition-colors">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Service 3: 건강 기록 관리 */}
          <div
            onClick={() => onNavigate('mypage', 'records')}
            className="bg-[#FFFBF5] hover:bg-[#FFF6EA] border border-orange-100/80 rounded-3xl p-5 shadow-xs transition-all cursor-pointer group flex flex-col justify-between text-center"
          >
            <div className="space-y-2">
              <div className="w-14 h-14 mx-auto flex items-center justify-center">
                <img
                  src="/assets/brand/icon_health_checklist.png"
                  alt="건강 기록 관리"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900 group-hover:text-amber-700 transition-colors">
                  건강 기록 관리
                </h4>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  예방접종, 정기검진 등<br />건강 정보를 간편하게
                </p>
              </div>
            </div>
            <div className="pt-3 flex justify-center text-stone-400 group-hover:text-amber-600 transition-colors">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Service 4: 레벨 · 배지 */}
          <div
            onClick={() => onNavigate('mypage', 'profile')}
            className="bg-[#FFFBF5] hover:bg-[#FFF6EA] border border-orange-100/80 rounded-3xl p-5 shadow-xs transition-all cursor-pointer group flex flex-col justify-between text-center"
          >
            <div className="space-y-2">
              <div className="w-14 h-14 mx-auto flex items-center justify-center">
                <img
                  src="/assets/brand/icon_badge_medal.png"
                  alt="레벨 · 배지"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900 group-hover:text-amber-700 transition-colors">
                  레벨 · 배지
                </h4>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  참여할수록 올라가는<br />레벨과 특별한 배지
                </p>
              </div>
            </div>
            <div className="pt-3 flex justify-center text-stone-400 group-hover:text-amber-600 transition-colors">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          6. BOTTOM SECTION: HEADER & PURE PANORAMIC ILLUSTRATION
          Requirement 4: 전달한 사람과 강아지가 함께 산책하는 일러스트를 홈페이지 하단에 적용.
          일러스트 위에 불필요한 문구나 버튼을 추가하지 마세요.
          투명 배경을 유지하고 흰색 배경과 자연스럽게 어우러지도록 해주세요.
          ======================================================== */}
      <div className="space-y-4 pt-4">
        {/* Banner Texts and Action Placed Cleanly Above Illustration */}
        <div className="text-center space-y-2">
          <h3 className="text-xl sm:text-2xl font-black text-stone-900 leading-snug">
            작은 실천이 모여 <span className="text-amber-500">큰 사랑</span>이 됩니다.
          </h3>
          <p className="text-xs sm:text-sm text-stone-600">
            오늘도 우리 아이와 함께 걷고, 건강한 내일을 모아 보세요.
          </p>
          <div className="pt-1">
            <button
              onClick={onStartWalk}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>지금, 모으개와 시작하기</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Clean, Untouched, High-Res Panoramic Illustration (No overlay text/buttons, pristine transparent aesthetic) */}
        <div className="w-full max-w-4xl mx-auto flex justify-center px-2">
          <img
            src="/assets/brand/bottom_sunset_panoramic.png"
            alt="모으개 반려견과 산책하는 일러스트"
            className="w-full h-auto max-h-[320px] object-contain select-none pointer-events-none"
          />
        </div>
      </div>

      {/* ========================================================
          7. "모으개가 처음이신가요?" SERVICE INTRODUCTION MODAL
          ======================================================== */}
      {isGuideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl space-y-5 border border-stone-100 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <img src="/assets/brand/logo_symbol.jpg" alt="모으개" className="w-6 h-6 rounded-lg object-contain" />
                <h3 className="text-base font-bold text-stone-900">모으개(MOGEGAE) 서비스 소개</h3>
              </div>
              <button
                onClick={() => setIsGuideModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-stone-700">
              <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200/50 space-y-1">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <Footprints className="w-4 h-4 text-amber-600" />
                  1. 걸음마다 쌓이는 산책 리워드
                </div>
                <p className="text-stone-600 leading-relaxed">
                  반려견과 매일 산책하며 미션을 달성하면 하루 최대 500P가 적립됩니다. 스마트 GPS 목걸이 연동 시 안전 위치 확인과 보너스 인증을 받을 수 있습니다.
                </p>
              </div>

              <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200/50 space-y-1">
                <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <img src="/assets/brand/point_coin.png" alt="포인트" className="w-4 h-4 object-contain" />
                  2. 우리 아이 평생 의료비 목표 저축
                </div>
                <p className="text-stone-600 leading-relaxed">
                  적립한 포인트를 정기 건강검진, 예방접종, 응급 수술비 등 원하는 목적별 목표에 차곡차곡 모아 안전하게 대비하세요.
                </p>
              </div>

              <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200/50 space-y-1">
                <div className="font-bold text-blue-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  3. 제휴 동물병원 EMR 전산 즉시 할인
                </div>
                <p className="text-stone-600 leading-relaxed">
                  전국 모으개 제휴 동물병원 및 브랜드 매장에서 바우처 코드를 제시하면 진료비와 용품을 현장에서 바로 할인받을 수 있습니다.
                </p>
              </div>

              <div className="p-3.5 bg-orange-50/70 rounded-2xl border border-orange-200/50 space-y-1">
                <div className="font-bold text-orange-900 flex items-center gap-1.5">
                  <CalendarCheck2 className="w-4 h-4 text-orange-600" />
                  4. 매일 출석체크 150P & 신규 회원 2,000P
                </div>
                <p className="text-stone-600 leading-relaxed">
                  매일 접속 시 독립적인 150P 출석체크 보너스가 지급되며, 신규 가입 시 2,000P 축하금이 즉시 지급됩니다.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => setIsGuideModalOpen(false)}
                className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-2xl cursor-pointer"
              >
                닫기
              </button>
              <button
                onClick={() => {
                  setIsGuideModalOpen(false);
                  onStartWalk();
                }}
                className="flex-2 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-2xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>지금 산책 시작하기</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
