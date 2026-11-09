import React, { useState } from 'react';
import { X, Check, ShieldCheck, HeartPulse } from 'lucide-react';
import { UserProfile } from '../types';
import { triggerConfetti } from '../utils/confetti';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUpdateUser: (newUser: UserProfile) => void;
  onAddPoints: (amount: number, reason: string) => void;
  initialMode?: 'login' | 'signup' | 'edit';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  onAddPoints,
  initialMode = 'signup',
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'edit'>(initialMode);
  
  // Signup / Edit Form State strictly matching IA requirements
  const [guardianName, setGuardianName] = useState(currentUser.guardianName);
  const [guardianRegion, setGuardianRegion] = useState(currentUser.guardianRegion);
  const [guardianAge, setGuardianAge] = useState(currentUser.guardianAge);
  const [hasCohabitant, setHasCohabitant] = useState(currentUser.hasCohabitant);
  const [petName, setPetName] = useState(currentUser.petName);
  const [petBreed, setPetBreed] = useState(currentUser.petBreed);
  const [petAge, setPetAge] = useState(currentUser.petAge);
  const [petWeight, setPetWeight] = useState(currentUser.petWeight);
  const [petCondition, setPetCondition] = useState(currentUser.petCondition || '');
  const [regularCheckupRecord, setRegularCheckupRecord] = useState(currentUser.regularCheckupRecord || '');

  if (!isOpen) return null;

  const handleRegisterOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...currentUser,
      guardianName: guardianName.trim() || '보호자',
      guardianRegion: guardianRegion.trim() || '서울특별시 마포구 연남동',
      guardianAge: Number(guardianAge) || 28,
      hasCohabitant: Boolean(hasCohabitant),
      petName: petName.trim() || '멍멍이',
      petBreed: petBreed.trim() || '토이푸들',
      petAge: Number(petAge) || 3,
      petWeight: Number(petWeight) || 3.5,
      petCondition: petCondition.trim() || '특이 질환 없음',
      regularCheckupRecord: regularCheckupRecord.trim() || '최근 1년 이내 정기검진 미기록',
    };

    onUpdateUser(updated);
    if (mode === 'signup') {
      onAddPoints(2000, '신규 반려가족 맞춤 가입 축하 포인트');
      triggerConfetti();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-stone-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐾</span>
            <h2 className="text-lg font-bold text-stone-900">
              {mode === 'login' ? '모으개 로그인' : mode === 'signup' ? '모으개 맞춤 회원가입' : '보호자 & 반려견 정보 수정'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {mode === 'login' ? (
            <div className="space-y-4">
              <p className="text-xs text-stone-500">
                현재 프로토타입 체험 계정(<span className="font-semibold text-amber-700">김민서 & 초코</span>)으로 로그인되어 있습니다. 다른 반려가족 정보로 테스트하려면 신규 회원가입을 진행해 보세요!
              </p>

              <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 space-y-2">
                <div className="flex items-center justify-between font-semibold">
                  <span>현재 활성 프로필</span>
                  <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">기본 설정됨</span>
                </div>
                <div className="text-stone-600 space-y-1">
                  <div>보호자: {currentUser.guardianName} ({currentUser.guardianAge}세, {currentUser.guardianRegion})</div>
                  <div>반려견: {currentUser.petName} ({currentUser.petBreed}, {currentUser.petAge}세)</div>
                  <div>지병: {currentUser.petCondition}</div>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-all shadow-sm shadow-amber-500/20 active:scale-[0.99]"
                >
                  새로운 반려가족 정보로 회원가입하기
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 border border-stone-200 text-stone-700 font-medium rounded-xl hover:bg-stone-50 transition-colors"
                >
                  기존 계정으로 계속 사용하기
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegisterOrUpdate} className="space-y-5">
              {mode === 'signup' && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900">
                    <span className="font-semibold">IA 회원가입 필수 7대 항목</span>
                    <p className="text-amber-700 mt-0.5">
                      보호자 및 반려견의 건강 상태를 정확히 입력하시면 AI 맞춤 산책량 추천과 병원비 목표 플랜이 자동 세팅됩니다. 가입 시 <strong>+2,000P</strong>가 즉시 적립됩니다!
                    </p>
                  </div>
                </div>
              )}

              {/* SECTION 1: 보호자 정보 */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-stone-800 tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  보호자 기본 정보 (IA 연계)
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">보호자 이름</label>
                    <input
                      type="text"
                      required
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                      placeholder="김민서"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">보호자 나이 (만 나이)</label>
                    <input
                      type="number"
                      required
                      min={14}
                      max={99}
                      value={guardianAge}
                      onChange={(e) => setGuardianAge(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                      placeholder="29"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">보호자 거주지역</label>
                  <input
                    type="text"
                    required
                    value={guardianRegion}
                    onChange={(e) => setGuardianRegion(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    placeholder="예: 서울특별시 마포구 연남동"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">인근 동물병원 및 24시 응급센터 검색 기준으로 활용됩니다.</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1.5">동거인 여부</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setHasCohabitant(true)}
                      className={`py-2 px-3 text-xs font-medium rounded-xl border text-center transition-all ${
                        hasCohabitant
                          ? 'border-amber-500 bg-amber-50/80 text-amber-900 font-semibold shadow-xs'
                          : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      동거인 있음 (가족/룸메이트)
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasCohabitant(false)}
                      className={`py-2 px-3 text-xs font-medium rounded-xl border text-center transition-all ${
                        !hasCohabitant
                          ? 'border-amber-500 bg-amber-50/80 text-amber-900 font-semibold shadow-xs'
                          : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      1인 가구 (혼자 양육)
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION 2: 반려동물 정보 */}
              <div className="space-y-3 pt-2 border-t border-stone-100">
                <h3 className="text-xs font-bold text-stone-800 tracking-wider flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                  반려동물 건강 & 맞춤 정보 (IA 연계)
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">반려동물 이름</label>
                    <input
                      type="text"
                      required
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                      placeholder="초코"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">반려동물 견종</label>
                    <input
                      type="text"
                      required
                      value={petBreed}
                      onChange={(e) => setPetBreed(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                      placeholder="예: 토이푸들, 말티즈 등"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">반려동물 나이 (세)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={25}
                      value={petAge}
                      onChange={(e) => setPetAge(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                      placeholder="4"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">체중 (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={petWeight}
                      onChange={(e) => setPetWeight(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                      placeholder="3.8"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">반려동물 지병여부</label>
                  <input
                    type="text"
                    required
                    value={petCondition}
                    onChange={(e) => setPetCondition(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    placeholder="예: 슬개골 탈구 2기, 식이 알레르기, 없음"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">AI 맞춤 산책량 계산 및 무리 방지 가이드에 실시간 반영됩니다.</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">반려동물 정기검진 기록</label>
                  <textarea
                    rows={2}
                    value={regularCheckupRecord}
                    onChange={(e) => setRegularCheckupRecord(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    placeholder="예: 2024년 10월 가을 종합건강검진 완료 (슬개골 관절 상태 양호)"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-between gap-3">
                {mode === 'signup' && (
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-xs text-stone-500 hover:text-stone-800 underline underline-offset-2"
                  >
                    이미 가입된 계정이 있으신가요?
                  </button>
                )}
                <button
                  type="submit"
                  className="ml-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-amber-500/20 active:scale-[0.98] flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  {mode === 'signup' ? '맞춤 가입 완료 (+2,000P)' : '정보 저장 완료'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
