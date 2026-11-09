import React from 'react';
import { CheckCircle2, ChevronRight, Sparkles, MapPin, Footprints, ShieldAlert, Award, ShieldCheck, X } from 'lucide-react';

interface TaskGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTask: (taskId: number) => void;
  activeTaskId?: number;
}

export const coreTasks = [
  {
    id: 1,
    title: '과업 1. 맞춤 회원가입 & 반려견 건강정보 등록',
    tag: '온보딩',
    description: 'IA 필수 7대 항목(거주지역, 나이, 동거인, 견종, 나이, 지병, 정기검진)을 입력하고 맞춤 프로필 생성 및 축하 포인트 2,000P 획득',
    actionText: '회원가입/수정 화면 열기',
    icon: '📝',
  },
  {
    id: 2,
    title: '과업 2. 일일 출석체크 & AI 맞춤 산책 미션 수행',
    tag: '미션 & 리워드',
    description: '7일 연속 출석 스탬프 찍기(+150P) 및 슬개골 탈구 맞춤 35분 평지 산책 트래커 가동 (일일 500P 한도 확인)',
    actionText: '산책 & 출석체크 가기',
    icon: '🦮',
  },
  {
    id: 3,
    title: '과업 3. 긴급상황 가이드 확인 및 24시 응급병원 연결',
    tag: '응급의료 연계',
    description: '이물/초콜릿 섭취 금기사항 숙지 후, 0.4km 인근 24시 응급 동물병원 즉시 전화 연결 및 길찾기·이동 안내 확인',
    actionText: '응급 가이드 & 병원 가기',
    icon: '🚨',
  },
  {
    id: 4,
    title: '과업 4. 포인트로 진료비 바우처 교환 & 검진기록 확인',
    tag: '의료비 혜택',
    description: '모은 포인트로 제휴 병원 진료비 30,000원권 교환하고, 2024년 가을 종합검진 소견서와 의료비 절감액 확인',
    actionText: '마이페이지 혜택 가기',
    icon: '🩺',
  },
  {
    id: 5,
    title: '과업 5. 관리자 콘솔에서 회원 및 포인트 정산 점검',
    tag: '관리자 시스템',
    description: 'IA 관리자 대시보드에서 산책 미션 달성률(78%), 병원비 전환율, 지병별 회원 목록 및 부정수급 모니터링 확인',
    actionText: '관리자 콘솔 가기',
    icon: '⚡',
  },
];

export const TaskGuideModal: React.FC<TaskGuideModalProps> = ({
  isOpen,
  onClose,
  onSelectTask,
  activeTaskId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl border border-stone-200 p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📋</span>
            <div>
              <h3 className="text-base font-bold text-stone-900">모으개 서비스 핵심 과업 가이드</h3>
              <p className="text-xs text-stone-500">정보구조도(IA)에 기반한 5대 핵심 사용자 흐름</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 leading-relaxed">
          💡 각 과업 카드의 <strong>[바로 체험하기]</strong>를 클릭하시면 해당 화면으로 즉시 이동하여 실제 인터랙션(버튼 클릭, 상태 변화, 포인트 적립/차감)을 직접 확인하실 수 있습니다.
        </div>

        <div className="space-y-3">
          {coreTasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-2xl border transition-all ${
                activeTaskId === task.id
                  ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-400/20'
                  : 'bg-stone-50/70 border-stone-200 hover:border-amber-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{task.icon}</span>
                  <div>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded">
                      {task.tag}
                    </span>
                    <h4 className="text-sm font-bold text-stone-900 mt-1">{task.title}</h4>
                  </div>
                </div>
              </div>

              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                {task.description}
              </p>

              <div className="pt-3 mt-2 border-t border-stone-200/60 flex justify-end">
                <button
                  onClick={() => {
                    onSelectTask(task.id);
                    onClose();
                  }}
                  className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1 transition-all shadow-xs"
                >
                  <span>{task.actionText}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
