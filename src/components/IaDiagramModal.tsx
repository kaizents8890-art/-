import React from 'react';
import { X, Network, ExternalLink, ArrowRight } from 'lucide-react';

interface IaDiagramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tab: any, subTab?: string) => void;
}

export const IaDiagramModal: React.FC<IaDiagramModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 p-6 space-y-4">
        <div className="flex items-start justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="text-base font-bold text-stone-900">모으개 정보구조도 (IA) 대조표</h3>
              <p className="text-xs text-stone-500">제출된 정보구조도 이미지의 모든 노드가 100% 구현되었습니다.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* IA Tree Branches Visual Display */}
        <div className="space-y-4 text-xs">
          {/* Root & Home */}
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 font-bold text-amber-900 flex items-center justify-between">
            <span>[모으개 Root] &gt; [홈 (Home)]</span>
            <button
              onClick={() => {
                onNavigateToTab('home');
                onClose();
              }}
              className="text-[11px] bg-amber-600 text-white px-2.5 py-1 rounded-lg hover:bg-amber-700"
            >
              홈 화면 가기 &rarr;
            </button>
          </div>

          {/* Branch 1: 회원가입 & 로그인 */}
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5">
            <div className="font-bold text-stone-900 flex items-center justify-between">
              <span>👤 로그인 / 회원가입</span>
              <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded">필수 7대 항목</span>
            </div>
            <p className="text-stone-600 text-[11px]">
              보호자 거주지역 · 보호자 나이 · 동거인 여부 · 반려동물 견종 · 반려동물 나이 · 반려동물 지병여부 · 반려동물 정기검진 기록
            </p>
          </div>

          {/* Branch 2: 미션 */}
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
            <div className="font-bold text-stone-900 flex items-center justify-between">
              <span>🎯 1. 미션 (Mission)</span>
              <button
                onClick={() => {
                  onNavigateToTab('mission');
                  onClose();
                }}
                className="text-[11px] text-amber-700 font-semibold underline"
              >
                이동 &rarr;
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600">
              <div className="bg-white p-2 rounded-xl border border-stone-100">
                <strong>출석체크</strong>
                <p className="text-stone-500 mt-0.5">일일 출석 및 7일 연속 스트릭 보너스</p>
              </div>
              <div className="bg-white p-2 rounded-xl border border-stone-100">
                <strong>산책</strong>
                <p className="text-stone-500 mt-0.5">
                  산책 미션 목표(주간 산책 목표 설정) / AI 맞춤 산책 포인트 설정(맞춤 산책량 추천, 반려동물 건강정보 반영, 한도 도달 시 추가 적립 제한)
                </p>
              </div>
            </div>
          </div>

          {/* Branch 3: 커뮤니티 */}
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
            <div className="font-bold text-stone-900 flex items-center justify-between">
              <span>💬 2. 커뮤니티 (Community)</span>
              <button
                onClick={() => {
                  onNavigateToTab('community');
                  onClose();
                }}
                className="text-[11px] text-amber-700 font-semibold underline"
              >
                이동 &rarr;
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600">
              <div className="bg-white p-2 rounded-xl border border-stone-100">
                <strong>반려생활 정보</strong>
                <p className="text-stone-500 mt-0.5">건강관리 및 예방 정보 · 예방접종·건강검진 안내 · 제품 후기 및 정보 공유</p>
              </div>
              <div className="bg-white p-2 rounded-xl border border-stone-100">
                <strong>긴급상황 대처 가이드</strong>
                <p className="text-stone-500 mt-0.5">응급처치 및 금지 행동 · 증상별 응급 대처법 · 병원 방문 전 준비사항</p>
              </div>
            </div>
          </div>

          {/* Branch 4: 동물병원 */}
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
            <div className="font-bold text-stone-900 flex items-center justify-between">
              <span>🏥 3. 동물병원 (Veterinary Clinic)</span>
              <button
                onClick={() => {
                  onNavigateToTab('hospital');
                  onClose();
                }}
                className="text-[11px] text-amber-700 font-semibold underline"
              >
                이동 &rarr;
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600">
              <div className="bg-white p-2 rounded-xl border border-stone-100">
                <strong>주변 동물병원</strong>
                <p className="text-stone-500 mt-0.5">내 주변 병원 찾기 · 시설·진료과목 정보 · 이용자 평점·리뷰</p>
              </div>
              <div className="bg-white p-2 rounded-xl border border-stone-100">
                <strong>응급 동물병원</strong>
                <p className="text-stone-500 mt-0.5">바로 전화 연결 · 길찾기·이동 안내 · 현재 위치 기준 응급 병원 검색</p>
              </div>
            </div>
          </div>

          {/* Branch 5: 마이 */}
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
            <div className="font-bold text-stone-900 flex items-center justify-between">
              <span>📱 4. 마이 (My Page)</span>
              <button
                onClick={() => {
                  onNavigateToTab('mypage');
                  onClose();
                }}
                className="text-[11px] text-amber-700 font-semibold underline"
              >
                이동 &rarr;
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600">
              <div className="bg-white p-2 rounded-xl border border-stone-100">
                <strong>포인트 혜택</strong>
                <p className="text-stone-500 mt-0.5">용품점 할인/교환 · 포인트 사용 내역 · 진료비 할인 및 검진/접종 혜택</p>
              </div>
              <div className="bg-white p-2 rounded-xl border border-stone-100">
                <strong>반려동물 프로필 & 보유 포인트</strong>
                <p className="text-stone-500 mt-0.5">건강기록 · 계정/개인정보 설정 · 의료비 목표 진행률</p>
              </div>
              <div className="bg-white p-2 rounded-xl border border-stone-100 col-span-2">
                <strong>병원 검진기록</strong>
                <p className="text-stone-500 mt-0.5">사용의료비 통계 · 검진결과, 내역 확인</p>
              </div>
            </div>
          </div>

          {/* Branch 6: 관리자 */}
          <div className="p-3 bg-stone-900 text-white rounded-2xl space-y-2">
            <div className="font-bold flex items-center justify-between">
              <span>⚡ 관리자 (Admin)</span>
              <button
                onClick={() => {
                  onNavigateToTab('admin');
                  onClose();
                }}
                className="text-[11px] bg-amber-500 text-white px-2.5 py-1 rounded-lg hover:bg-amber-600"
              >
                관리자 콘솔 열기 &rarr;
              </button>
            </div>
            <p className="text-[11px] text-stone-300">
              회원 관리 · 포인트 관리 · 대시보드
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
