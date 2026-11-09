import React, { useState } from 'react';
import {
  MapPin,
  PhoneCall,
  Navigation,
  Star,
  ShieldAlert,
  Clock,
  Heart,
  Search,
  CheckCircle,
  MessageSquare,
  Car,
  Footprints,
  Info,
  X
} from 'lucide-react';
import { Hospital, UserProfile } from '../types';
import { InteractiveHospitalMap } from './InteractiveHospitalMap';

interface HospitalViewProps {
  hospitals: Hospital[];
  user: UserProfile;
  initialEmergencyMode?: boolean;
  onCallHospital: (hospital: Hospital) => void;
  onOpenNavigation: (hospital: Hospital) => void;
  onAddReview: (hospitalId: string, reviewText: string, rating: number) => void;
}

export const HospitalView: React.FC<HospitalViewProps> = ({
  hospitals,
  user,
  initialEmergencyMode = false,
  onCallHospital,
  onOpenNavigation,
  onAddReview,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'emergency'>(
    initialEmergencyMode ? 'emergency' : 'all'
  );
  const [sortBy, setSortBy] = useState<'distance' | 'rating'>('distance');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [detailModalHospital, setDetailModalHospital] = useState<Hospital | null>(null);

  // Review modal
  const [isAddingReview, setIsAddingReview] = useState(false);
  const [reviewHospital, setReviewHospital] = useState<Hospital | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');

  // Route guidance modal
  const [routeHospital, setRouteHospital] = useState<Hospital | null>(null);

  // Call confirmation modal
  const [callingHospital, setCallingHospital] = useState<Hospital | null>(null);

  const displayedHospitals = hospitals
    .filter((h) => {
      const matchEmergency = filterMode === 'emergency' ? h.isEmergency24h : true;
      const matchSearch =
        searchQuery === '' ||
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.departments.some((d) => d.toLowerCase().includes(searchQuery.toLowerCase())) ||
        h.address.toLowerCase().includes(searchQuery.toLowerCase());
      return matchEmergency && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
      return b.rating - a.rating;
    });

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewHospital || !reviewContent.trim()) return;
    onAddReview(reviewHospital.id, reviewContent.trim(), reviewRating);
    setIsAddingReview(false);
    setReviewContent('');
    setReviewRating(5);
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-6">
      {/* Sub Tabs matching IA: 주변 동물병원 / 응급 동물병원 */}
      <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-2xl">
        <button
          onClick={() => setFilterMode('all')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            filterMode === 'all'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <MapPin className="w-3.5 h-3.5 text-amber-600" />
          <span>내 주변 동물병원</span>
        </button>
        <button
          onClick={() => setFilterMode('emergency')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            filterMode === 'emergency'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-rose-700 hover:bg-rose-50'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>24시 응급 동물병원</span>
        </button>
      </div>

      {/* Emergency Mode Banner when active */}
      {filterMode === 'emergency' && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-xs text-rose-950">
            <h3 className="font-bold">현재 위치({user.guardianRegion}) 기준 24시 응급센터 검색</h3>
            <p className="text-rose-800 mt-0.5 leading-relaxed">
              야간 응급 진료, 중환자실(ICU), 응급 수술이 가능한 병원만 우선 정렬됩니다. 내원 전 반드시 바로 전화를 걸어 병원에 환견의 상태를 사전 브리핑하세요.
            </p>
          </div>
        </div>
      )}

      {/* Search and Sort Toolbar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="병원명, 정형외과, 야간응급, 주소 검색..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-xl text-xs">
          <button
            onClick={() => setSortBy('distance')}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
              sortBy === 'distance' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
            }`}
          >
            거리순
          </button>
          <button
            onClick={() => setSortBy('rating')}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
              sortBy === 'rating' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
            }`}
          >
            평점순
          </button>
        </div>
      </div>

      {/* Interactive Real Map with Drag, Zoom, and Fullscreen Modal */}
      <InteractiveHospitalMap
        hospitals={displayedHospitals}
        userRegion={user.guardianRegion || '서울 마포구'}
        selectedHospital={selectedHospital}
        onSelectHospital={(h) => setSelectedHospital(h)}
        onOpenDetail={(h) => {
          setSelectedHospital(h);
          setDetailModalHospital(h);
        }}
      />

      {/* Hospital List Cards */}
      <div className="space-y-3">
        {displayedHospitals.map((hospital) => {
          const isSelected = selectedHospital?.id === hospital.id;
          return (
            <div
              key={hospital.id}
              className={`rounded-3xl p-5 transition-all space-y-3 border-2 ${
                isSelected
                  ? 'border-orange-500 bg-orange-50/20 ring-2 ring-orange-500/20 shadow-md'
                  : 'bg-white border-stone-100 hover:border-orange-200 shadow-xs'
              }`}
            >
              {/* Header: Name, Distance, Emergency Tag */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedHospital(hospital);
                        setDetailModalHospital(hospital);
                      }}
                      className="text-base font-bold text-stone-900 hover:text-orange-600 transition-colors flex items-center gap-2 text-left cursor-pointer group"
                    >
                      <span className="group-hover:underline underline-offset-2">{hospital.name}</span>
                      <span className="text-[11px] font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-lg">
                        상세정보
                      </span>
                    </button>
                    {hospital.isEmergency24h && (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                        24시 응급
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-stone-400" />
                    <span>{hospital.address}</span>
                    <span className="font-semibold text-amber-700">({hospital.distanceKm}km)</span>
                  </p>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl shadow-2xs shrink-0">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-bold text-amber-900">{hospital.rating}</span>
                  <span className="text-[10px] text-stone-400">({hospital.reviewCount})</span>
                </div>
              </div>

              {/* Operating Hours & Point Discount */}
              <div className="text-xs space-y-1 text-stone-600 bg-stone-50/80 p-3 rounded-2xl">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>진료시간: <strong>{hospital.openingHours}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-800 font-semibold">
                  <Heart className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{hospital.pointDiscountRate}</span>
                </div>
              </div>

              {/* Departments & Facilities Chips */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-medium text-stone-500">진료과목 및 시설</div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {hospital.departments.map((dept) => (
                    <span
                      key={dept}
                      className="text-[11px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded-lg font-medium"
                    >
                      {dept}
                    </span>
                  ))}
                  {hospital.facilities.map((fac) => (
                    <span
                      key={fac}
                      className="text-[11px] bg-white border border-stone-200 text-stone-500 px-2 py-0.5 rounded-lg"
                    >
                      {fac}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons: Phone Call & Navigation & Detail Modal */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-100">
                <button
                  onClick={() => setCallingHospital(hospital)}
                  className={`py-2.5 px-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-colors shadow-xs cursor-pointer ${
                    hospital.isEmergency24h
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-stone-900 hover:bg-stone-800 text-white'
                  }`}
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>전화 연결</span>
                </button>

                <button
                  onClick={() => setRouteHospital(hospital)}
                  className="py-2.5 px-2 bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5 text-amber-600" />
                  <span>길찾기</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedHospital(hospital);
                    setDetailModalHospital(hospital);
                  }}
                  className="py-2.5 px-2 bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-colors border border-orange-200 cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5 text-orange-600" />
                  <span>상세정보</span>
                </button>
              </div>

            {/* Reviews Section Toggle */}
            <div className="pt-1 flex items-center justify-between text-xs">
              <button
                onClick={() => setSelectedHospital(selectedHospital?.id === hospital.id ? null : hospital)}
                className="text-stone-500 hover:text-stone-900 flex items-center gap-1 underline underline-offset-2"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>이용자 리뷰 ({hospital.reviews?.length || 0}개)</span>
              </button>

              <button
                onClick={() => {
                  setReviewHospital(hospital);
                  setIsAddingReview(true);
                }}
                className="text-amber-700 hover:text-amber-900 font-semibold text-[11px]"
              >
                + 영수증 인증 리뷰 작성
              </button>
            </div>

            {/* Reviews expanded inside card */}
            {selectedHospital?.id === hospital.id && (
              <div className="mt-2 pt-3 border-t border-stone-100 space-y-2 animate-fadeIn">
                {hospital.reviews && hospital.reviews.length > 0 ? (
                  hospital.reviews.map((rv) => (
                    <div key={rv.id} className="p-3 bg-stone-50 rounded-2xl text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-stone-900">{rv.author}</span>
                          <span className="text-[10px] text-stone-400">({rv.petBreed})</span>
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-1 rounded">
                            {rv.visitedFor}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {'★'.repeat(rv.rating)}
                        </div>
                      </div>
                      <p className="text-stone-700 leading-relaxed">{rv.content}</p>
                      <div className="text-[10px] text-stone-400">{rv.date}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-stone-400 text-center py-2">등록된 리뷰가 없습니다.</p>
                )}
              </div>
            )}
          </div>
        );
      })}
      </div>

      {/* Dedicated Hospital Detail Window Modal (Requirement 4) */}
      {detailModalHospital && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xl shadow-2xl border border-stone-200 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header: Name, Close, 24h tag */}
            <div className="flex items-start justify-between border-b border-stone-100 pb-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-black text-stone-900">{detailModalHospital.name}</h3>
                  {detailModalHospital.isEmergency24h && (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-md">
                      🚨 24시 응급센터
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  <span>{detailModalHospital.address}</span>
                  <span className="font-bold text-orange-600">({detailModalHospital.distanceKm}km)</span>
                </p>
              </div>

              <button
                onClick={() => setDetailModalHospital(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Switcher: other nearby hospitals */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-stone-400 block">다른 주변 추천 병원 바로보기:</span>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {displayedHospitals.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => {
                      setSelectedHospital(h);
                      setDetailModalHospital(h);
                    }}
                    className={`shrink-0 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      detailModalHospital.id === h.id
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {h.isEmergency24h ? '🚨 ' : ''}{h.name.split(' ')[1] || h.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating & Review summary */}
            <div className="flex items-center justify-between p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span className="text-base font-extrabold text-stone-900">{detailModalHospital.rating}점</span>
                <span className="text-xs text-stone-500 font-medium">({detailModalHospital.reviewCount}개 리뷰)</span>
              </div>
              <span className="text-xs font-bold text-amber-800 bg-amber-100/70 px-2.5 py-1 rounded-xl">
                모으개 공식 제휴 병원
              </span>
            </div>

            {/* 1. Operating Hours */}
            <div className="p-3.5 bg-stone-50 rounded-2xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
                <Clock className="w-4 h-4 text-orange-600" />
                <span>진료시간 안내</span>
              </div>
              <p className="text-xs text-stone-700 pl-5.5 leading-relaxed font-medium">
                {detailModalHospital.openingHours}
              </p>
            </div>

            {/* 2. Departments & Facilities */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-stone-800">전문 진료 항목 및 시설</div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {detailModalHospital.departments.map((dept) => (
                    <span
                      key={dept}
                      className="text-xs bg-orange-50 text-orange-800 border border-orange-200 px-2.5 py-1 rounded-xl font-semibold"
                    >
                      {dept}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {detailModalHospital.facilities.map((fac) => (
                    <span
                      key={fac}
                      className="text-xs bg-stone-100 text-stone-600 px-2.5 py-1 rounded-xl font-medium"
                    >
                      ✓ {fac}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Mogegae Point Benefits */}
            <div className="p-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl shadow-sm space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-extrabold">
                <Heart className="w-4 h-4 fill-white" />
                <span>모으개 포인트 사용 가능 여부 및 특별 제휴 혜택</span>
              </div>
              <p className="text-xs text-white/95 leading-relaxed font-semibold">
                {detailModalHospital.pointDiscountRate}
              </p>
              <div className="pt-1 flex items-center gap-2 text-[11px] text-white/90">
                <span>• 현장 바우처 100% 결제 가능</span>
                <span>• 결제 금액의 10% 추가 적립</span>
              </div>
            </div>

            {/* 4. Action Buttons: Phone & Navigation */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100">
              <button
                onClick={() => {
                  setCallingHospital(detailModalHospital);
                }}
                className={`py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer ${
                  detailModalHospital.isEmergency24h
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-stone-900 hover:bg-stone-800 text-white'
                }`}
              >
                <PhoneCall className="w-4 h-4" />
                <span>바로 전화 연결</span>
              </button>

              <button
                onClick={() => {
                  setRouteHospital(detailModalHospital);
                }}
                className="py-3 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <Navigation className="w-4 h-4" />
                <span>길찾기·이동 안내</span>
              </button>
            </div>

            {/* 5. User Reviews inside Detail Modal */}
            <div className="pt-2 space-y-2 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900">
                  보호자 실제 진료 후기 ({detailModalHospital.reviews?.length || 0}개)
                </span>
                <button
                  onClick={() => {
                    setReviewHospital(detailModalHospital);
                    setIsAddingReview(true);
                  }}
                  className="text-xs text-orange-600 hover:text-orange-700 font-bold cursor-pointer"
                >
                  + 후기 작성 (+200P)
                </button>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {detailModalHospital.reviews && detailModalHospital.reviews.length > 0 ? (
                  detailModalHospital.reviews.map((rv) => (
                    <div key={rv.id} className="p-3 bg-stone-50 rounded-2xl text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-stone-900">{rv.author}</span>
                          <span className="text-[10px] text-stone-400">({rv.petBreed})</span>
                          <span className="text-[10px] bg-orange-100 text-orange-800 px-1.5 py-0.2 rounded font-semibold">
                            {rv.visitedFor}
                          </span>
                        </div>
                        <div className="text-amber-500 font-bold">
                          {'★'.repeat(rv.rating)}
                        </div>
                      </div>
                      <p className="text-stone-700 leading-relaxed">{rv.content}</p>
                      <span className="text-[10px] text-stone-400 block">{rv.date}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-stone-400 text-center py-2">등록된 후기가 없습니다.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Immediate Phone Call Modal (IA 바로 전화 연결) */}
      {callingHospital && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-stone-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-2xl">
              📞
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">{callingHospital.name}</h3>
              <p className="text-xs text-stone-500 mt-1">병원 직통 번호: {callingHospital.phone}</p>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 text-xs text-rose-950 text-left space-y-1">
              <div className="font-semibold flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-rose-600" />
                모으개 안심 사전 통화 안내
              </div>
              <p className="text-[11px] text-rose-800">
                병원에 통화가 연결되면 <strong>환견 품종({user.petBreed}), 나이({user.petAge}세), 현재 주증상</strong>을 먼저 말씀하시면 ICU 및 수술실을 즉시 세팅해 드립니다.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setCallingHospital(null)}
                className="py-2.5 border border-stone-200 text-stone-600 text-xs font-semibold rounded-xl hover:bg-stone-50"
              >
                닫기
              </button>
              <a
                href={`tel:${callingHospital.phone}`}
                onClick={() => {
                  onCallHospital(callingHospital);
                  setCallingHospital(null);
                }}
                className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 shadow-md shadow-rose-600/20"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>통화 연결</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Modal (IA 길찾기·이동 안내) */}
      {routeHospital && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                  최단 이동 경로
                </span>
                <h3 className="text-base font-bold text-stone-900 mt-1">{routeHospital.name}</h3>
                <p className="text-xs text-stone-500">{routeHospital.address}</p>
              </div>
              <button
                onClick={() => setRouteHospital(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                닫기
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 text-center">
                <Car className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                <div className="text-xs font-bold text-stone-800">차량 / 택시</div>
                <div className="text-lg font-extrabold text-stone-900 mt-0.5">
                  약 {Math.max(2, Math.round(routeHospital.distanceKm * 4))}분
                </div>
                <div className="text-[10px] text-stone-400">예상 택시비 약 4,800원</div>
              </div>

              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 text-center">
                <Footprints className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <div className="text-xs font-bold text-stone-800">도보 이동</div>
                <div className="text-lg font-extrabold text-stone-900 mt-0.5">
                  약 {Math.round(routeHospital.distanceKm * 14)}분
                </div>
                <div className="text-[10px] text-stone-400">거리: {routeHospital.distanceKm} km</div>
              </div>
            </div>

            <div className="bg-amber-50/70 border border-amber-200 p-3 rounded-2xl text-xs text-amber-950 space-y-1">
              <div className="font-semibold">이동 중 주의 수칙</div>
              <ul className="list-disc list-inside text-[11px] text-amber-900/90 space-y-0.5">
                <li>슬개골이나 관절 부상 시 딱딱한 보드나 두꺼운 담요로 몸을 평평하게 지지해 주세요.</li>
                <li>차량 이동 시 에어컨/히터를 적정 온도(22~24℃)로 맞춰 호흡 안정을 유도하세요.</li>
              </ul>
            </div>

            <button
              onClick={() => {
                onOpenNavigation(routeHospital);
                setRouteHospital(null);
              }}
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Navigation className="w-4 h-4 text-amber-400" />
              <span>실시간 내비게이션 안내 시작</span>
            </button>
          </div>
        </div>
      )}

      {/* Review Write Modal */}
      {isAddingReview && reviewHospital && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-stone-900">영수증 인증 리뷰 작성</h3>
              <button
                onClick={() => setIsAddingReview(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                취소
              </button>
            </div>

            <div className="text-xs text-stone-500">
              병원명: <strong className="text-stone-800">{reviewHospital.name}</strong>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">별점 평가</label>
                <div className="flex items-center gap-1 text-2xl text-amber-400 cursor-pointer">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="hover:scale-110 transition-transform"
                    >
                      {star <= reviewRating ? '★' : '☆'}
                    </button>
                  ))}
                  <span className="text-xs font-bold text-stone-700 ml-2">{reviewRating}점</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">상세 진료 후기</label>
                <textarea
                  required
                  rows={4}
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  placeholder="의료진의 친절도, 과잉진료 여부, 모으개 포인트 할인 혜택 적용 경험을 솔직하게 남겨주세요..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingReview(false)}
                  className="px-4 py-2 border border-stone-200 text-stone-600 text-xs font-medium rounded-xl hover:bg-stone-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                >
                  리뷰 등록 (+200P)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
