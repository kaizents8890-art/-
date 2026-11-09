import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Wallet,
  Gift,
  User,
  CheckCircle2,
  TrendingUp,
  Sliders,
  History,
  ShieldCheck,
  Calendar,
  DollarSign,
  ChevronRight,
  ExternalLink,
  Edit3,
  Award,
  Sparkles,
  Camera,
  Plus,
  Building,
  Info,
  X,
  FileText,
  Clock,
  Heart,
  Target,
  Pill,
  Activity,
  AlertTriangle,
  Stethoscope,
  HeartPulse,
  Coins,
  Trash2,
  MapPin,
  Trophy,
  Filter,
  ArrowDownRight,
  ArrowUpRight,
  Navigation,
  Map as MapIcon
} from 'lucide-react';
import {
  UserProfile,
  MedicalGoal,
  PointTransaction,
  RewardItem,
  MedicalCheckupRecord,
  WalkRecord
} from '../types';
import { triggerConfetti } from '../utils/confetti';
import { SIDO_LIST, getSigunguList, parseRegion, formatRegion } from '../data/koreaDistricts';
import {
  PeriodFilterType,
  PERIOD_FILTER_LABELS,
  isDateInPeriod,
  parseRecordDate
} from '../utils/dateUtils';

interface MyPageViewProps {
  user: UserProfile;
  points: number;
  medicalGoals: MedicalGoal[];
  transactions: PointTransaction[];
  rewards: RewardItem[];
  medicalRecords: MedicalCheckupRecord[];
  walkRecords?: WalkRecord[];
  activeSubTab?: 'benefits' | 'points' | 'profile' | 'records' | 'walks';
  onUpdateUserProfile: (updated: Partial<UserProfile>) => void;
  onUpdateMedicalGoals: (goals: MedicalGoal[]) => void;
  onAddMedicalRecord: (record: MedicalCheckupRecord) => void;
  onUpdateMedicalRecord: (record: MedicalCheckupRecord) => void;
  onRedeemReward: (reward: RewardItem) => void;
  onDepositToGoal?: (goalId: string, amount: number) => void;
  onDeleteGoalWithRefund?: (goalId: string, refundAmount: number, title: string) => void;
}

const DISEASE_CATEGORIES = [
  '피부·알레르기',
  '소화기',
  '심장·순환기',
  '호흡기',
  '관절·근골격',
  '신장·비뇨기',
  '내분비·대사',
  '신경계',
  '안과·귀',
  '기타'
];

/**
 * 기간별 조회 공통 필터 바 (최근 1개월, 3개월, 6개월, 1년, 전체 기간, 직접 기간 설정)
 */
interface PeriodFilterBarProps {
  period: PeriodFilterType;
  onPeriodChange: (p: PeriodFilterType) => void;
  customStart: string;
  onCustomStartChange: (v: string) => void;
  customEnd: string;
  onCustomEndChange: (v: string) => void;
  countLabel?: string;
  count?: number;
}

const PeriodFilterBar: React.FC<PeriodFilterBarProps> = ({
  period,
  onPeriodChange,
  customStart,
  onCustomStartChange,
  customEnd,
  onCustomEndChange,
  countLabel = '조회 내역',
  count,
}) => {
  const filterOptions: PeriodFilterType[] = ['1month', '3months', '6months', '1year', 'all', 'custom'];

  return (
    <div className="bg-white rounded-2xl p-3 border border-stone-100 shadow-2xs space-y-2.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          {filterOptions.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onPeriodChange(opt)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                period === opt
                  ? 'bg-amber-500 text-white shadow-2xs font-bold'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-600'
              }`}
            >
              {PERIOD_FILTER_LABELS[opt]}
            </button>
          ))}
        </div>
        {count !== undefined && (
          <div className="text-[11px] text-stone-400 font-medium self-end sm:self-auto shrink-0">
            {countLabel} <strong className="text-amber-600 font-bold">{count}</strong>건
          </div>
        )}
      </div>

      {period === 'custom' && (
        <div className="pt-2.5 border-t border-stone-100 flex items-center gap-2 flex-wrap text-xs animate-fadeIn">
          <span className="text-stone-500 font-medium text-[11px]">직접 기간 설정:</span>
          <input
            type="date"
            value={customStart}
            onChange={(e) => onCustomStartChange(e.target.value)}
            className="px-2.5 py-1.5 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-medium"
            placeholder="시작일"
          />
          <span className="text-stone-400">~</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => onCustomEndChange(e.target.value)}
            className="px-2.5 py-1.5 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-medium"
            placeholder="종료일"
          />
          {(customStart || customEnd) && (
            <button
              type="button"
              onClick={() => {
                onCustomStartChange('');
                onCustomEndChange('');
              }}
              className="text-[11px] text-stone-400 hover:text-stone-700 underline cursor-pointer ml-1"
            >
              날짜 초기화
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export const MyPageView: React.FC<MyPageViewProps> = ({
  user,
  points,
  medicalGoals,
  transactions,
  rewards,
  medicalRecords,
  walkRecords = [],
  activeSubTab = 'profile',
  onUpdateUserProfile,
  onUpdateMedicalGoals,
  onAddMedicalRecord,
  onUpdateMedicalRecord,
  onRedeemReward,
  onDepositToGoal,
  onDeleteGoalWithRefund,
}) => {
  // SubTab: Profile is default!
  const [subTab, setSubTab] = useState<'profile' | 'records' | 'walks' | 'points' | 'benefits'>(activeSubTab);

  useEffect(() => {
    if (activeSubTab) {
      setSubTab(activeSubTab);
    }
  }, [activeSubTab]);

  // 기간별 조회 상태 - 검진 및 접종 기록
  const [recordsPeriod, setRecordsPeriod] = useState<PeriodFilterType>('all');
  const [recordsCustomStart, setRecordsCustomStart] = useState<string>('');
  const [recordsCustomEnd, setRecordsCustomEnd] = useState<string>('');

  // 기간별 조회 상태 - 산책 기록
  const [walksPeriod, setWalksPeriod] = useState<PeriodFilterType>('all');
  const [walksCustomStart, setWalksCustomStart] = useState<string>('');
  const [walksCustomEnd, setWalksCustomEnd] = useState<string>('');

  // 포인트 내역 - 종류(전체/적립/사용) 및 기간별 조회 상태
  const [txTypeFilter, setTxTypeFilter] = useState<'all' | 'earn' | 'use'>('all');
  const [txPeriod, setTxPeriod] = useState<PeriodFilterType>('all');
  const [txCustomStart, setTxCustomStart] = useState<string>('');
  const [txCustomEnd, setTxCustomEnd] = useState<string>('');

  // Photo & Profile Edit States
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isPhotoZoomOpen, setIsPhotoZoomOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedWalk, setSelectedWalk] = useState<WalkRecord | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editProfileForm, setEditProfileForm] = useState({
    petName: user.petName,
    petBreed: user.petBreed,
    petAge: user.petAge,
    petWeight: user.petWeight,
    petGender: user.petGender,
    neuteredStatus: user.neuteredStatus || (user.petIsNeutered ? '중성화 완료' : '중성화하지 않음'),
    hasCondition: user.hasCondition || (user.petCondition && user.petCondition !== '없음' ? '있음' : '없음'),
    conditionCategories: user.conditionCategories || (user.petCondition ? [user.petCondition] : []),
    conditionDetail: user.conditionDetail || '',
    medications: user.medications || '',
    healthNotes: user.healthNotes || '',
    regularCheckupRecord: user.regularCheckupRecord || '',
    guardianName: user.guardianName,
    guardianAge: user.guardianAge ? String(user.guardianAge) : '',
    guardianRegion: user.guardianRegion,
    cohabitantStatus: user.cohabitantStatus || (user.hasCohabitant ? '있음 (가족·동거인과 함께 돌봄)' : '없음 (혼자 돌봄)'),
  });

  const [editSido, setEditSido] = useState(() => parseRegion(user.guardianRegion).sido);
  const [editSigungu, setEditSigungu] = useState(() => parseRegion(user.guardianRegion).sigungu);

  // Sync form when user changes or modal opens
  const syncEditForm = () => {
    const parsed = parseRegion(user.guardianRegion);
    setEditSido(parsed.sido);
    setEditSigungu(parsed.sigungu);
    setEditProfileForm({
      petName: user.petName,
      petBreed: user.petBreed,
      petAge: user.petAge,
      petWeight: user.petWeight,
      petGender: user.petGender,
      neuteredStatus: user.neuteredStatus || (user.petIsNeutered ? '중성화 완료' : '중성화하지 않음'),
      hasCondition: user.hasCondition || (user.petCondition && user.petCondition !== '없음' ? '있음' : '없음'),
      conditionCategories: user.conditionCategories || (user.petCondition ? [user.petCondition] : []),
      conditionDetail: user.conditionDetail || '',
      medications: user.medications || '',
      healthNotes: user.healthNotes || '',
      regularCheckupRecord: user.regularCheckupRecord || '',
      guardianName: user.guardianName,
      guardianAge: user.guardianAge ? String(user.guardianAge) : '',
      guardianRegion: user.guardianRegion,
      cohabitantStatus: user.cohabitantStatus || (user.hasCohabitant ? '있음 (가족·동거인과 함께 돌봄)' : '없음 (혼자 돌봄)'),
    });
  };

  // Medical Goal Add / Edit State
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<MedicalGoal | null>(null);
  const [goalForm, setGoalForm] = useState({
    title: '',
    category: '정기검진' as MedicalGoal['category'],
    targetAmount: 200000,
    currentAmount: 0,
    description: '',
  });

  // Goal Deposit & Delete Modal States
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [selectedGoalForDeposit, setSelectedGoalForDeposit] = useState<MedicalGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState<number>(1000);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<MedicalGoal | null>(null);

  // Health Record Add / Edit State
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalCheckupRecord | null>(null);
  const [recordForm, setRecordForm] = useState({
    date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
    hospitalName: '24시 마포 센트럴 동물의료원',
    checkupType: '정기 종합건강검진',
    doctorOpinion: '',
    findingsStr: '',
    memo: '',
    totalCost: 180000,
    pointDiscountApplied: 30000,
    nextCheckupDate: '2025.04.15',
  });

  // Modals for details
  const [selectedRecord, setSelectedRecord] = useState<MedicalCheckupRecord | null>(null);
  const [detailRewardItem, setDetailRewardItem] = useState<RewardItem | null>(null);
  const [redeemedItem, setRedeemedItem] = useState<RewardItem | null>(null);

  // Photo Upload Handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onUpdateUserProfile({ profileImage: reader.result });
          setIsPhotoModalOpen(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPresetAvatar = (emoji: string) => {
    onUpdateUserProfile({ profileImage: emoji });
    setIsPhotoModalOpen(false);
  };

  // Toggle Category selection in Profile edit
  const toggleEditCategory = (cat: string) => {
    setEditProfileForm((prev) => {
      const exists = prev.conditionCategories.includes(cat);
      return {
        ...prev,
        conditionCategories: exists
          ? prev.conditionCategories.filter((c) => c !== cat)
          : [...prev.conditionCategories, cat],
      };
    });
  };

  // Profile Save Handler
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const isNeut = editProfileForm.neuteredStatus === '중성화 완료';
    const hasCohab = editProfileForm.cohabitantStatus.startsWith('있음');
    const petCond =
      editProfileForm.hasCondition === '있음'
        ? editProfileForm.conditionCategories.join(', ') || '있음'
        : editProfileForm.hasCondition === '없음'
        ? '없음'
        : '모름';

    onUpdateUserProfile({
      petName: editProfileForm.petName,
      petBreed: editProfileForm.petBreed,
      petAge: Number(editProfileForm.petAge) || 1,
      petWeight: Number(editProfileForm.petWeight) || 5,
      petGender: editProfileForm.petGender,
      petIsNeutered: isNeut,
      neuteredStatus: editProfileForm.neuteredStatus as '중성화 완료' | '중성화하지 않음' | '모름',
      hasCondition: editProfileForm.hasCondition as '있음' | '없음' | '모름',
      conditionCategories: editProfileForm.conditionCategories,
      conditionDetail: editProfileForm.conditionDetail,
      medications: editProfileForm.medications,
      healthNotes: editProfileForm.healthNotes,
      petCondition: petCond,
      regularCheckupRecord: editProfileForm.regularCheckupRecord,
      guardianName: editProfileForm.guardianName,
      guardianAge: editProfileForm.guardianAge ? Number(editProfileForm.guardianAge) : undefined,
      guardianRegion: editProfileForm.guardianRegion,
      hasCohabitant: hasCohab,
      cohabitantStatus: editProfileForm.cohabitantStatus as '있음 (가족·동거인과 함께 돌봄)' | '없음 (혼자 돌봄)',
    });
    setIsProfileModalOpen(false);
  };

  // Goal Save Handler (신규 목표는 무조건 0P로 시작, 수정 시에는 기존 적립액 유지)
  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalForm.title.trim()) return;

    if (editingGoal) {
      const updated = medicalGoals.map((g) =>
        g.id === editingGoal.id
          ? {
              ...g,
              title: goalForm.title.trim(),
              category: goalForm.category,
              targetAmount: Number(goalForm.targetAmount) || 100000,
              description: goalForm.description,
            }
          : g
      );
      onUpdateMedicalGoals(updated);
    } else {
      const newGoal: MedicalGoal = {
        id: `goal_${Date.now()}`,
        title: goalForm.title.trim(),
        category: goalForm.category,
        targetAmount: Number(goalForm.targetAmount) || 100000,
        currentAmount: 0, // Requirement 3: 신규 목표 시작 적립액은 0P 고정
        isPrimary: medicalGoals.length === 0,
        description: goalForm.description,
      };
      onUpdateMedicalGoals([...medicalGoals, newGoal]);
    }
    setIsGoalModalOpen(false);
  };

  // Goal Deposit Handler (보유 포인트 -> 목표 적립액)
  const handleConfirmDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalForDeposit) return;
    const amount = Number(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('적립할 포인트를 1P 이상 입력해 주세요.');
      return;
    }
    if (amount > points) {
      alert(`보유 포인트(${points.toLocaleString()}P)를 초과하여 적립할 수 없습니다.`);
      return;
    }

    if (onDepositToGoal) {
      onDepositToGoal(selectedGoalForDeposit.id, amount);
    }
    setIsDepositModalOpen(false);
  };

  // Goal Delete Handler (적립액 환급 처리 포함)
  const handleConfirmDeleteGoal = () => {
    if (!goalToDelete) return;
    if (onDeleteGoalWithRefund) {
      onDeleteGoalWithRefund(goalToDelete.id, goalToDelete.currentAmount, goalToDelete.title);
    } else {
      onUpdateMedicalGoals(medicalGoals.filter((g) => g.id !== goalToDelete.id));
    }
    setIsDeleteModalOpen(false);
    setGoalToDelete(null);
  };

  const handleSetPrimaryGoal = (goalId: string) => {
    const updated = medicalGoals.map((g) => ({
      ...g,
      isPrimary: g.id === goalId,
    }));
    onUpdateMedicalGoals(updated);
  };

  // Health Record Save Handler
  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const findings = recordForm.findingsStr
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const actualPaid = Math.max(
      0,
      Number(recordForm.totalCost) - Number(recordForm.pointDiscountApplied)
    );

    if (editingRecord) {
      const updated: MedicalCheckupRecord = {
        ...editingRecord,
        date: recordForm.date,
        hospitalName: recordForm.hospitalName,
        checkupType: recordForm.checkupType,
        doctorOpinion: recordForm.doctorOpinion || '소견 특이사항 없음',
        findings: findings.length > 0 ? findings : ['기본 검진 이상 없음'],
        memo: recordForm.memo,
        totalCost: Number(recordForm.totalCost),
        pointDiscountApplied: Number(recordForm.pointDiscountApplied),
        actualPaid,
        nextCheckupDate: recordForm.nextCheckupDate,
      };
      onUpdateMedicalRecord(updated);
    } else {
      const newRec: MedicalCheckupRecord = {
        id: `rec_${Date.now()}`,
        date: recordForm.date,
        hospitalName: recordForm.hospitalName,
        checkupType: recordForm.checkupType,
        doctorOpinion: recordForm.doctorOpinion || '소견 특이사항 없음',
        findings: findings.length > 0 ? findings : ['기본 검진 이상 없음'],
        memo: recordForm.memo,
        totalCost: Number(recordForm.totalCost),
        pointDiscountApplied: Number(recordForm.pointDiscountApplied),
        actualPaid,
        nextCheckupDate: recordForm.nextCheckupDate,
      };
      onAddMedicalRecord(newRec);
    }
    setIsRecordModalOpen(false);
  };

  // Redeem Reward Handler
  const handleRedeemClick = (reward: RewardItem) => {
    if (points < reward.requiredPoints) {
      alert(`포인트가 부족합니다. (필요: ${reward.requiredPoints.toLocaleString()}P / 현재: ${points.toLocaleString()}P)`);
      return;
    }
    onRedeemReward(reward);
    setRedeemedItem(reward);
    setDetailRewardItem(null);
    triggerConfetti();
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-6">
      {/* 5-Zone Sub Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1 p-1 bg-stone-100 rounded-2xl text-xs font-semibold">
        <button
          onClick={() => setSubTab('profile')}
          className={`py-2 px-1 text-center rounded-xl transition-all cursor-pointer ${
            subTab === 'profile'
              ? 'bg-white text-stone-900 shadow-xs font-bold'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          프로필 설정
        </button>
        <button
          onClick={() => setSubTab('records')}
          className={`py-2 px-1 text-center rounded-xl transition-all cursor-pointer ${
            subTab === 'records'
              ? 'bg-white text-stone-900 shadow-xs font-bold'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          검진·접종 기록
        </button>
        <button
          onClick={() => setSubTab('walks')}
          className={`py-2 px-1 text-center rounded-xl transition-all cursor-pointer ${
            subTab === 'walks'
              ? 'bg-white text-stone-900 shadow-xs font-bold'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          산책 기록
        </button>
        <button
          onClick={() => setSubTab('points')}
          className={`py-2 px-1 text-center rounded-xl transition-all cursor-pointer ${
            subTab === 'points'
              ? 'bg-white text-stone-900 shadow-xs font-bold'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          목표 관리
        </button>
        <button
          onClick={() => setSubTab('benefits')}
          className={`py-2 px-1 text-center rounded-xl transition-all cursor-pointer ${
            subTab === 'benefits'
              ? 'bg-white text-stone-900 shadow-xs font-bold'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          포인트 내역
        </button>
      </div>

      {/* ========================================================
          SUBTAB 1: 프로필 설정 (REQUIREMENT 4: 단일 '정보 수정' 버튼 & 사진 확대 지원)
          ======================================================== */}
      {subTab === 'profile' && (
        <div className="space-y-4">
          {/* Main Pet Profile Identity Card */}
          <div className="bg-white rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Photo with zoom lightbox click */}
                <div className="relative shrink-0">
                  <div
                    onClick={() => setIsPhotoZoomOpen(true)}
                    className="w-20 h-20 rounded-3xl bg-amber-500 text-white flex items-center justify-center text-4xl shadow-md overflow-hidden border-2 border-white ring-2 ring-amber-100 cursor-pointer hover:opacity-95 transition-all group/avatar relative"
                    title="사진 크게 보기 (클릭하여 확대)"
                  >
                    {user.profileImage && user.profileImage.startsWith('data:image') ? (
                      <img src={user.profileImage} alt={user.petName} className="w-full h-full object-cover group-hover/avatar:scale-105 transition-transform" />
                    ) : (
                      <span className="group-hover/avatar:scale-110 transition-transform">{user.profileImage || '🐶'}</span>
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                      확대
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-black text-stone-900">{user.petName}</h3>
                    <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full">
                      {user.petBreed}
                    </span>
                    <span className="text-xs bg-stone-100 text-stone-700 font-medium px-2 py-0.5 rounded-full">
                      {user.petGender}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    {user.petAge}세 · 체중 {user.petWeight}kg · {user.neuteredStatus || (user.petIsNeutered ? '중성화 완료' : '중성화하지 않음')}
                  </p>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    등록 보호자: <strong className="text-stone-700">{user.guardianName}</strong> ({user.guardianRegion})
                  </p>
                </div>
              </div>

              {/* Requirement 1: 마이페이지 프로필 설정에서 '정보 수정' 버튼만 단일 유지 */}
              <div className="shrink-0">
                <button
                  onClick={() => {
                    syncEditForm();
                    setIsProfileModalOpen(true);
                  }}
                  className="py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>정보 수정</span>
                </button>
              </div>
            </div>

            {/* Quick Status Badges Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-stone-100">
              <div className="p-3 bg-stone-50/80 rounded-2xl">
                <div className="text-[11px] text-stone-400 font-medium">체중 관리</div>
                <div className="text-sm font-bold text-stone-900 mt-0.5 tabular-nums">{user.petWeight} kg</div>
                <div className="text-[10px] text-emerald-600 font-medium">슬개골 적정범위</div>
              </div>
              <div className="p-3 bg-stone-50/80 rounded-2xl">
                <div className="text-[11px] text-stone-400 font-medium">생애 주기</div>
                <div className="text-sm font-bold text-stone-900 mt-0.5">{user.petAge} 세</div>
                <div className="text-[10px] text-stone-500">{user.petAge >= 7 ? '노령견 집중케어' : '성견 안정기'}</div>
              </div>
              <div className="p-3 bg-stone-50/80 rounded-2xl">
                <div className="text-[11px] text-stone-400 font-medium">중성화 여부</div>
                <div className="text-sm font-bold text-stone-900 mt-0.5">
                  {user.neuteredStatus || (user.petIsNeutered ? '중성화 완료' : '중성화하지 않음')}
                </div>
                <div className="text-[10px] text-stone-500">{user.petGender}견</div>
              </div>
              <div className="p-3 bg-stone-50/80 rounded-2xl">
                <div className="text-[11px] text-stone-400 font-medium">최근 정기검진</div>
                <div className="text-sm font-bold text-stone-900 mt-0.5 truncate">
                  {user.regularCheckupRecord || '최근 6개월 이내'}
                </div>
                <div className="text-[10px] text-amber-600 font-medium">정기 종합검진 완료</div>
              </div>
            </div>
          </div>

          {/* Health Information Detail Card (지병, 질병종류, 세부질병, 약물, 특이사항) */}
          <div className="bg-white rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900">반려견 맞춤 건강 & 지병 상세</h4>
                  <p className="text-[11px] text-stone-400">의료비 목표 설정과 추천 산책 코스에 직접 반영되는 정보입니다.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* 1. 지병 여부 & 질병 종류 */}
              <div className="p-4 rounded-2xl bg-stone-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-500">만성 지병 여부</span>
                  <span
                    className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                      user.hasCondition === '있음'
                        ? 'bg-rose-100 text-rose-700'
                        : user.hasCondition === '없음'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {user.hasCondition || '있음'}
                  </span>
                </div>

                {user.hasCondition === '있음' ? (
                  <div>
                    <span className="text-[11px] text-stone-400 block mb-1.5">선택된 질병 카테고리:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {user.conditionCategories && user.conditionCategories.length > 0 ? (
                        user.conditionCategories.map((cat) => (
                          <span
                            key={cat}
                            className="bg-white text-stone-800 border border-stone-200 px-2 py-0.5 rounded-lg text-[11px] font-semibold"
                          >
                            {cat}
                          </span>
                        ))
                      ) : (
                        <span className="text-stone-500 text-[11px]">선택된 카테고리 없음</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-stone-500 text-[11px] pt-1">
                    {user.hasCondition === '없음'
                      ? '등록된 만성 질환이 없어 일반적인 기초 건강검진 및 예방접종 플랜이 권장됩니다.'
                      : '지병 여부 확인이 필요합니다. 동물병원 정기검진을 통해 건강 상태를 확인해 보세요.'}
                  </p>
                )}
              </div>

              {/* 2. 세부 질병명 */}
              <div className="p-4 rounded-2xl bg-stone-50/70 space-y-1">
                <span className="font-semibold text-stone-500 block">세부 질병명</span>
                <p className="text-stone-900 font-bold text-xs pt-1">
                  {user.conditionDetail || (user.hasCondition === '있음' ? '슬개골 탈구 2기 및 관절염 관리 필요' : '해당 사항 없음')}
                </p>
                <p className="text-[11px] text-stone-400">
                  {user.hasCondition === '있음' ? '무리한 계단 오르기나 점프 제한 권장' : '주기적인 기본 건강 관리'}
                </p>
              </div>

              {/* 3. 복용 중인 약물 */}
              <div className="p-4 rounded-2xl bg-stone-50/70 space-y-1">
                <div className="flex items-center gap-1.5 text-stone-500 font-semibold">
                  <Pill className="w-3.5 h-3.5 text-amber-600" />
                  <span>복용 중인 약물 / 처방 영양제</span>
                </div>
                <p className="text-stone-900 font-bold text-xs pt-1">
                  {user.medications || (user.hasCondition === '있음' ? '관절 영양제(글루코사민/MSM) 일 1회 급여' : '복용 중인 약물 없음')}
                </p>
              </div>

              {/* 4. 기타 특이사항 */}
              <div className="p-4 rounded-2xl bg-stone-50/70 space-y-1">
                <div className="flex items-center gap-1.5 text-stone-500 font-semibold">
                  <Activity className="w-3.5 h-3.5 text-amber-600" />
                  <span>보호자 특별 메모 & 주의사항</span>
                </div>
                <p className="text-stone-900 font-medium text-xs pt-1 leading-relaxed">
                  {user.healthNotes || '미끄러운 실내 바닥 매트 시공 완료, 산책 시 평지 코스 30분 위주로 진행'}
                </p>
              </div>
            </div>
          </div>

          {/* Guardian Account & Housing Environment */}
          <div className="bg-white rounded-3xl p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-stone-900">보호자 계정 및 돌봄 환경</h4>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-3 rounded-2xl bg-stone-50/70">
                <span className="text-[11px] text-stone-400 block">보호자 성함</span>
                <span className="font-bold text-stone-900 text-sm mt-0.5 block">{user.guardianName}</span>
              </div>
              <div className="p-3 rounded-2xl bg-stone-50/70">
                <span className="text-[11px] text-stone-400 block">보호자 나이</span>
                <span className="font-bold text-stone-900 text-sm mt-0.5 block">
                  {user.guardianAge ? `${user.guardianAge}세` : '미입력 (선택)'}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-stone-50/70">
                <span className="text-[11px] text-stone-400 block">거주 지역</span>
                <span className="font-bold text-stone-900 text-sm mt-0.5 block">{user.guardianRegion}</span>
              </div>
              <div className="p-3 rounded-2xl bg-stone-50/70">
                <span className="text-[11px] text-stone-400 block">함께 돌보는 사람 여부</span>
                <span className="font-bold text-stone-900 text-sm mt-0.5 block">
                  {user.cohabitantStatus || (user.hasCohabitant ? '있음 (가족·동거인과 함께 돌봄)' : '없음 (혼자 돌봄)')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SUBTAB 2: 병원 검진·예방접종 공인 기록 (EMR 전산 연동 및 기간별 조회)
          Requirement 1: 최근 1개월, 3개월, 6개월, 1년, 전체 기간, 직접 기간 설정 (시작일~종료일)
          ======================================================== */}
      {subTab === 'records' && (() => {
        const filteredMedicalRecords = medicalRecords.filter((rec) =>
          isDateInPeriod(rec.date, recordsPeriod, recordsCustomStart, recordsCustomEnd)
        );

        return (
          <div className="space-y-4">
            {/* Medical Expense KPI & Hospital EMR Notice */}
            <div className="bg-white rounded-3xl p-5 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-stone-400 font-medium">연간 누적 절감 의료비</span>
                  <div className="text-2xl font-black text-stone-900 tabular-nums mt-0.5">
                    {medicalRecords
                      .reduce((sum, r) => sum + r.pointDiscountApplied, 0)
                      .toLocaleString()}{' '}
                    <span className="text-sm font-semibold text-amber-600">원 지원 완료</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-emerald-800 text-xs font-semibold shrink-0">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>제휴 동물병원 EMR 전산 연동 공인 기록</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/70 text-xs text-amber-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  검진·접종 기록은 모으개 제휴 동물병원에서 진료 후 수의사가 전산(EMR)으로 직접 등록합니다.
                  의료 데이터의 신뢰성과 투명성을 위해 보호자가 임의로 추가, 수정, 삭제할 수 없습니다.
                </p>
              </div>
            </div>

            {/* Requirement 1: 기간별 조회 바 */}
            <PeriodFilterBar
              period={recordsPeriod}
              onPeriodChange={setRecordsPeriod}
              customStart={recordsCustomStart}
              onCustomStartChange={setRecordsCustomStart}
              customEnd={recordsCustomEnd}
              onCustomEndChange={setRecordsCustomEnd}
              countLabel="조회된 검진·접종"
              count={filteredMedicalRecords.length}
            />

            {/* Records List or Empty State */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-stone-700 px-1">
                <span>제휴 병원 공인 검진·접종 내역 ({filteredMedicalRecords.length}건)</span>
                <span className="text-[11px] text-stone-400 font-normal">카드 클릭 시 상세 진료 소견 열람</span>
              </div>

              {filteredMedicalRecords.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-stone-200 shadow-xs space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-2xl shadow-inner">
                    <Stethoscope className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-stone-900">
                      {medicalRecords.length === 0
                        ? '등록된 검진·접종 기록이 없습니다.'
                        : '선택하신 기간 내 조회된 검진·접종 기록이 없습니다.'}
                    </h4>
                    <p className="text-xs text-stone-500 max-w-md mx-auto mt-1.5 leading-relaxed">
                      모으개와 제휴된 동물병원에서 진료 또는 정기검진을 받으시면 병원 EMR 전산 시스템과 연동되어 이곳에 공인 진료 및 접종 내역이 자동으로 등록됩니다.
                    </p>
                  </div>
                </div>
              ) : (
                filteredMedicalRecords.map((rec) => (
                  <div
                    key={rec.id}
                    className="bg-white rounded-3xl p-5 shadow-xs hover:shadow-md transition-all space-y-3 cursor-pointer border border-stone-100"
                    onClick={() => setSelectedRecord(rec)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                            {rec.checkupType}
                          </span>
                          <span className="text-xs text-stone-400 font-medium">{rec.date}</span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            제휴병원 인증 완료
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-stone-900 mt-1">{rec.hospitalName}</h4>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-amber-600 block">
                          -{rec.pointDiscountApplied.toLocaleString()}원 지원
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-stone-600 bg-stone-50 p-3.5 rounded-2xl space-y-2">
                      <div>
                        <span className="font-semibold text-stone-800">수의사 진료 소견: </span>
                        <span>{rec.doctorOpinion}</span>
                      </div>
                      {rec.findings && rec.findings.length > 0 && (
                        <div className="pt-2 border-t border-stone-200/60 text-stone-600">
                          <span className="font-semibold text-stone-700">검진 세부 결과: </span>
                          <span>{rec.findings.join(' · ')}</span>
                        </div>
                      )}
                      {rec.nextCheckupDate && (
                        <div className="pt-2 border-t border-stone-200/60 text-amber-800 text-[11px] font-medium flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-amber-600" />
                          <span>다음 권장 검진일: {rec.nextCheckupDate}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs text-stone-500">
                      <span>총 진료비: {rec.totalCost.toLocaleString()}원</span>
                      <span className="font-bold text-stone-900">
                        실결제: {rec.actualPaid.toLocaleString()}원
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })()}

      {/* ========================================================
          SUBTAB 3: 산책 기록 (기간별 조회, 누적 통계 동시 갱신, 경로 지도 및 GPS 인증)
          Requirement 2: 날짜/시간, 거리, 소요시간, 포인트, 경로지도, GPS인증여부 표시
          ======================================================== */}
      {subTab === 'walks' && (() => {
        const filteredWalkRecords = walkRecords.filter((w) =>
          isDateInPeriod(w.date, walksPeriod, walksCustomStart, walksCustomEnd)
        );
        const totalDistance = filteredWalkRecords.reduce((sum, w) => sum + (w.distanceKm || 0), 0).toFixed(1);
        const totalMinutes = filteredWalkRecords.reduce((sum, w) => sum + (w.durationMinutes || 0), 0);
        const totalPointsEarned = filteredWalkRecords.reduce((sum, w) => sum + (w.pointsEarned ?? w.earnedPoints ?? 0), 0);

        return (
          <div className="space-y-4">
            {/* Walk Statistics Header Banner - 기간 변경 시 함께 갱신 */}
            <div className="bg-white rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                    산책 히스토리
                  </span>
                  <span className="text-xs text-stone-400">선택 기간 총 {filteredWalkRecords.length}회 완주</span>
                </div>
                <h3 className="text-base font-bold text-stone-900 mt-1">반려견 맞춤 산책 기록</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  모으개 스마트 GPS 목걸이로 동행이 검증된 산책 기록과 적립된 리워드를 기간별로 확인하세요.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-50/60 rounded-2xl text-center min-w-[80px]">
                  <span className="text-[10px] text-amber-700 font-medium block">총 거리</span>
                  <span className="text-base font-black text-amber-900 tabular-nums">
                    {totalDistance} km
                  </span>
                </div>
                <div className="p-3 bg-stone-50 rounded-2xl text-center min-w-[80px]">
                  <span className="text-[10px] text-stone-500 font-medium block">총 시간</span>
                  <span className="text-base font-black text-stone-900 tabular-nums">
                    {totalMinutes} 분
                  </span>
                </div>
                <div className="p-3 bg-emerald-50/60 rounded-2xl text-center min-w-[90px]">
                  <span className="text-[10px] text-emerald-700 font-medium block">총 적립 포인트</span>
                  <span className="text-base font-black text-emerald-800 tabular-nums">
                    +{totalPointsEarned.toLocaleString()} P
                  </span>
                </div>
              </div>
            </div>

            {/* Requirement 2: 기간별 조회 필터 바 */}
            <PeriodFilterBar
              period={walksPeriod}
              onPeriodChange={setWalksPeriod}
              customStart={walksCustomStart}
              onCustomStartChange={setWalksCustomStart}
              customEnd={walksCustomEnd}
              onCustomEndChange={setWalksCustomEnd}
              countLabel="조회된 산책"
              count={filteredWalkRecords.length}
            />

            {/* Walk Records List */}
            {filteredWalkRecords.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-stone-200 shadow-xs space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-2xl shadow-inner">
                  🐾
                </div>
                <div>
                  <h4 className="text-base font-bold text-stone-900">
                    {walkRecords.length === 0
                      ? '아직 등록된 산책 기록이 없습니다.'
                      : '선택하신 기간 내 조회된 산책 기록이 없습니다.'}
                  </h4>
                  <p className="text-xs text-stone-500 max-w-md mx-auto mt-1 leading-relaxed">
                    미션 탭에서 반려견의 나이와 관절 상태에 맞춘 추천 산책 코스로 첫 산책을 시작해 보세요!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredWalkRecords.map((w) => (
                  <div
                    key={w.id}
                    onClick={() => setSelectedWalk(w)}
                    className="bg-white rounded-3xl p-5 shadow-xs hover:shadow-md transition-all space-y-3.5 cursor-pointer border border-stone-100 group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                            완주 완료
                          </span>
                          <span className="text-xs text-stone-500 font-semibold">
                            {w.date} {w.time ? w.time : ''}
                          </span>
                          {/* GPS 목걸이 인증 여부 필수 표시 */}
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border ${
                              w.dogAccompaniedVerified
                                ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                                : 'text-stone-600 bg-stone-100 border-stone-200'
                            }`}
                          >
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            {w.dogAccompaniedVerified ? 'GPS 목걸이 동행 인증 완료' : '반려견 동행 확인 완료'}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-stone-900 mt-1 group-hover:text-amber-600 transition-colors">
                          {w.courseTitle || w.courseName}
                        </h4>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-amber-600 tabular-nums">
                          +{(w.pointsEarned ?? w.earnedPoints ?? 0).toLocaleString()} P
                        </span>
                      </div>
                    </div>

                    {/* 산책 핵심 정보: 거리, 소요 시간, 칼로리, 속도 */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1 text-xs">
                      <div className="p-2.5 bg-stone-50 rounded-xl">
                        <span className="text-[10px] text-stone-400 block font-medium">산책 거리</span>
                        <span className="text-xs font-bold text-stone-800 tabular-nums">{w.distanceKm} km</span>
                      </div>
                      <div className="p-2.5 bg-stone-50 rounded-xl">
                        <span className="text-[10px] text-stone-400 block font-medium">소요 시간</span>
                        <span className="text-xs font-bold text-stone-800 tabular-nums">{w.durationMinutes} 분</span>
                      </div>
                      <div className="p-2.5 bg-stone-50 rounded-xl">
                        <span className="text-[10px] text-stone-400 block font-medium">소비 칼로리</span>
                        <span className="text-xs font-bold text-stone-800 tabular-nums">{w.caloriesBurned ?? w.calories ?? 0} kcal</span>
                      </div>
                      <div className="p-2.5 bg-stone-50 rounded-xl hidden sm:block">
                        <span className="text-[10px] text-stone-400 block font-medium">평균 속도</span>
                        <span className="text-xs font-bold text-stone-800 tabular-nums">
                          {((w.distanceKm / (w.durationMinutes || 1)) * 60).toFixed(1)} km/h
                        </span>
                      </div>
                    </div>

                    {/* Requirement 2: 산책 경로 지도 시각화 */}
                    <div className="relative w-full h-20 bg-gradient-to-r from-amber-50/70 via-stone-50 to-orange-50/50 rounded-2xl overflow-hidden border border-amber-100/70 p-2 flex items-center justify-between">
                      <svg className="w-full h-full opacity-70" viewBox="0 0 320 60" preserveAspectRatio="none">
                        <path
                          d="M 15 45 Q 70 10, 150 35 T 305 20"
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />
                        <circle cx="15" cy="45" r="4.5" fill="#10b981" />
                        <circle cx="305" cy="20" r="4.5" fill="#f43f5e" />
                      </svg>
                      <div className="absolute top-2 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md text-[10px] font-bold text-stone-700 shadow-2xs">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        <span>출발점: {w.courseTitle?.split(' ')[0] || '산책로'}</span>
                      </div>
                      <div className="absolute bottom-2 right-3 flex items-center gap-1 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] font-bold text-amber-800 border border-amber-200/80 shadow-2xs hover:bg-amber-50 transition-colors">
                        <MapIcon className="w-3 h-3 text-amber-600" />
                        <span>산책 경로 지도 상세 열람</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* ========================================================
          SUBTAB 4: 목표 관리 (Requirement 3: 진행 중인 목표 vs 완료된 목표 구분)
          ======================================================== */}
      {subTab === 'points' && (() => {
        const activeGoals = medicalGoals.filter((g) => !g.isCompleted && g.currentAmount < g.targetAmount);
        const completedGoals = medicalGoals.filter((g) => g.isCompleted || g.currentAmount >= g.targetAmount);

        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-stone-900">목표 관리</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  진행 중인 의료비 목표와 100% 달성하여 안전하게 보관된 완료 목표를 체계적으로 관리하세요.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingGoal(null);
                  setGoalForm({
                    title: '',
                    category: '정기검진',
                    targetAmount: 200000,
                    currentAmount: 0,
                    description: '',
                  });
                  setIsGoalModalOpen(true);
                }}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>새 목표 추가</span>
              </button>
            </div>

            {/* Points Distinction KPI Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-amber-800 font-semibold block">사용 가능한 보유 포인트</span>
                  <span className="text-xl font-black text-amber-700 tabular-nums mt-0.5 block">
                    {points.toLocaleString()} <span className="text-xs font-bold text-amber-900">P</span>
                  </span>
                  <span className="text-[10px] text-amber-600/90">진행 중 목표에 즉시 적립 가능</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-2xs">
                  <Coins className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-emerald-800 font-semibold block">목표 총 적립액</span>
                  <span className="text-xl font-black text-emerald-700 tabular-nums mt-0.5 block">
                    {medicalGoals.reduce((sum, g) => sum + g.currentAmount, 0).toLocaleString()}{' '}
                    <span className="text-xs font-bold text-emerald-900">P</span>
                  </span>
                  <span className="text-[10px] text-emerald-600/90">총 {medicalGoals.length}개 목표에 배분됨</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-2xs">
                  <Target className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-stone-900 text-white rounded-2xl p-4 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-stone-400 font-medium block">보유 + 적립 총 포인트</span>
                  <span className="text-xl font-black text-amber-400 tabular-nums mt-0.5 block">
                    {(points + medicalGoals.reduce((sum, g) => sum + g.currentAmount, 0)).toLocaleString()}{' '}
                    <span className="text-xs font-bold text-white">P</span>
                  </span>
                  <span className="text-[10px] text-stone-400">전체 자산 가치</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-stone-800 text-amber-400 flex items-center justify-center font-bold">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* 영역 1: 진행 중인 목표 */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <h4 className="text-sm font-bold text-stone-900">
                    진행 중인 목표 <span className="text-amber-600 font-black">({activeGoals.length}개)</span>
                  </h4>
                </div>
                <span className="text-[11px] text-stone-400">보유 포인트를 적립해 목표를 달성하세요</span>
              </div>

              {activeGoals.length === 0 ? (
                <div className="p-8 text-center bg-stone-50 rounded-3xl border border-dashed border-stone-200 space-y-2">
                  <p className="text-xs font-semibold text-stone-600">현재 진행 중인 목표가 없습니다.</p>
                  <p className="text-[11px] text-stone-400">새로운 건강검진이나 예방접종 목표를 추가해 보세요.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeGoals.map((goal) => {
                    const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                    const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

                    return (
                      <div
                        key={goal.id}
                        className={`bg-white rounded-3xl p-5 transition-all shadow-xs flex flex-col justify-between space-y-4 relative border ${
                          goal.isPrimary ? 'border-amber-300 ring-2 ring-amber-400/30 bg-amber-50/15' : 'border-stone-100'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md">
                                  {goal.category}
                                </span>
                                {goal.isPrimary && (
                                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                                    대표 목표
                                  </span>
                                )}
                              </div>
                              <h5 className="text-base font-bold text-stone-900 mt-1.5">{goal.title}</h5>
                            </div>
                            <span className="text-base font-black tabular-nums text-amber-600">
                              {percent}%
                            </span>
                          </div>

                          {goal.description && (
                            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                              {goal.description}
                            </p>
                          )}

                          {/* Progress Bar */}
                          <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden mt-4 p-0.5">
                            <div
                              className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-amber-400 to-amber-600"
                              style={{ width: `${percent}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-xs text-stone-600 mt-2 font-medium">
                            <span>
                              현재 적립액: <strong className="text-stone-900 tabular-nums">{goal.currentAmount.toLocaleString()} P</strong>
                            </span>
                            <span>
                              목표 금액: <span className="tabular-nums">{goal.targetAmount.toLocaleString()} P</span>
                            </span>
                          </div>

                          {remaining > 0 && (
                            <div className="text-[11px] text-stone-400 mt-1 text-right">
                              달성까지 <span className="text-amber-600 font-bold tabular-nums">{remaining.toLocaleString()} P</span> 남음
                            </div>
                          )}
                        </div>

                        <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            {!goal.isPrimary ? (
                              <button
                                onClick={() => handleSetPrimaryGoal(goal.id)}
                                className="text-stone-500 hover:text-amber-600 font-semibold text-[11px] cursor-pointer"
                              >
                                대표 목표로 지정
                              </button>
                            ) : (
                              <span className="text-emerald-600 font-semibold text-[11px]">메인 화면 표시 중</span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* 목표에 적립하기 버튼 */}
                            <button
                              onClick={() => {
                                setSelectedGoalForDeposit(goal);
                                setDepositAmount(Math.min(points, Math.max(1000, remaining || 1000)));
                                setIsDepositModalOpen(true);
                              }}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl flex items-center gap-1 shadow-2xs transition-all cursor-pointer text-xs"
                              title="보유 포인트를 이 목표에 적립"
                            >
                              <Coins className="w-3.5 h-3.5" />
                              <span>목표에 적립하기</span>
                            </button>

                            {/* 수정 버튼 */}
                            <button
                              onClick={() => {
                                setEditingGoal(goal);
                                setGoalForm({
                                  title: goal.title,
                                  category: goal.category,
                                  targetAmount: goal.targetAmount,
                                  currentAmount: goal.currentAmount,
                                  description: goal.description || '',
                                });
                                setIsGoalModalOpen(true);
                              }}
                              className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                              title="목표 수정"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* 삭제 버튼 */}
                            <button
                              onClick={() => {
                                setGoalToDelete(goal);
                                setIsDeleteModalOpen(true);
                              }}
                              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="목표 삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 영역 2: 완료된 목표 (영구 보관 및 명확한 시각적 구분) */}
            <div className="space-y-3 pt-4 border-t border-stone-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    <Trophy className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900">
                      완료된 목표 <span className="text-emerald-600 font-black">({completedGoals.length}개 달성)</span>
                    </h4>
                  </div>
                </div>
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold border border-emerald-200">
                  달성 완료 영구 보관
                </span>
              </div>
              <p className="text-xs text-stone-500">
                목표 금액을 100% 달성한 의료비 플랜입니다. 소중한 달성 기록은 삭제되거나 초기화되지 않고 안전하게 영구 보관됩니다.
              </p>

              {completedGoals.length === 0 ? (
                <div className="p-8 text-center bg-stone-50 rounded-3xl border border-dashed border-stone-200 space-y-1">
                  <p className="text-xs font-semibold text-stone-600">아직 달성 완료된 목표가 없습니다.</p>
                  <p className="text-[11px] text-stone-400">진행 중인 목표에 포인트를 적립하여 목표를 달성해 보세요!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {completedGoals.map((goal) => (
                    <div
                      key={goal.id}
                      className="bg-gradient-to-br from-emerald-50/40 via-white to-stone-50 rounded-3xl p-5 shadow-xs border border-emerald-200/80 relative space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              100% 달성 완료
                            </span>
                            <span className="text-[10px] font-bold text-stone-600 bg-white border border-stone-200 px-2 py-0.5 rounded-md">
                              {goal.category}
                            </span>
                          </div>
                          <h5 className="text-base font-bold text-stone-900 mt-1.5">{goal.title}</h5>
                        </div>

                        <span className="text-base font-black text-emerald-600 tabular-nums shrink-0">
                          100%
                        </span>
                      </div>

                      {goal.description && (
                        <p className="text-xs text-stone-600 leading-relaxed">
                          {goal.description}
                        </p>
                      )}

                      {/* Completed Full Progress Bar */}
                      <div className="w-full h-2 bg-emerald-100 rounded-full overflow-hidden">
                        <div className="w-full h-full bg-emerald-500 rounded-full" />
                      </div>

                      <div className="p-3 bg-white/90 rounded-2xl border border-emerald-100 text-xs space-y-1">
                        <div className="flex items-center justify-between text-stone-600">
                          <span>최종 목표 금액:</span>
                          <span className="font-bold text-stone-800 tabular-nums">
                            {goal.targetAmount.toLocaleString()} P
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-emerald-800 font-semibold">
                          <span>최종 적립 완료액:</span>
                          <span className="font-black text-emerald-600 tabular-nums">
                            {goal.currentAmount.toLocaleString()} P
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-emerald-100 text-[11px] text-stone-400">
                          <span>목표 달성 날짜:</span>
                          <span className="font-medium text-stone-600">
                            {goal.completedDate || '2026.10.15'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ========================================================
          SUBTAB 5: 포인트 내역 (포인트 적립·사용 내역 확인)
          Requirement 4: 상단 필터(전체/적립/사용), 날짜, 사유, 변동금액, 잔액(balanceAfter), 관련미션/구매내역(relatedSource), 최신순 정렬 및 기간별 조회
          ======================================================== */}
      {subTab === 'benefits' && (() => {
        // 필터링 및 최신순 정렬
        const filteredTxList = [...transactions]
          .filter((tx) => {
            if (txTypeFilter === 'earn') return tx.type === 'earn';
            if (txTypeFilter === 'use') return tx.type === 'use';
            return true;
          })
          .filter((tx) =>
            isDateInPeriod(tx.date, txPeriod, txCustomStart, txCustomEnd)
          )
          .sort((a, b) => {
            const dateA = parseRecordDate(a.date)?.getTime() || 0;
            const dateB = parseRecordDate(b.date)?.getTime() || 0;
            return dateB - dateA;
          });

        const periodEarnTotal = filteredTxList
          .filter((t) => t.type === 'earn')
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const periodUseTotal = filteredTxList
          .filter((t) => t.type === 'use')
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        return (
          <div className="space-y-4">
            {/* 포인트 내역 Header & Balance KPI */}
            <div className="bg-stone-900 text-white rounded-3xl p-5 shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-stone-800 border border-stone-700/80 p-1 flex items-center justify-center shrink-0 shadow-inner">
                    <img src="/assets/aistudio/mogege_brand_logo.png" alt="모으개 로고" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">포인트 적립 및 사용 내역</h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      산책 미션, 출석체크, 병원비 바우처 및 샵 이용 내역을 한눈에 확인하세요.
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs text-stone-400 block">현재 보유 포인트</span>
                  <div className="text-2xl font-black text-amber-400 tabular-nums">
                    {points.toLocaleString()} <span className="text-base font-bold text-white">P</span>
                  </div>
                </div>
              </div>

              {/* Period In/Out Summary */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-800 text-xs">
                <div className="p-3 bg-stone-800/80 rounded-2xl flex items-center justify-between">
                  <span className="text-stone-400 font-medium">조회 기간 적립 합계:</span>
                  <span className="font-extrabold text-amber-400 tabular-nums">
                    +{periodEarnTotal.toLocaleString()} P
                  </span>
                </div>
                <div className="p-3 bg-stone-800/80 rounded-2xl flex items-center justify-between">
                  <span className="text-stone-400 font-medium">조회 기간 사용 합계:</span>
                  <span className="font-extrabold text-rose-400 tabular-nums">
                    -{periodUseTotal.toLocaleString()} P
                  </span>
                </div>
              </div>
            </div>

            {/* Type Filter Buttons: 전체 | 적립 | 사용 */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTxTypeFilter('all')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  txTypeFilter === 'all'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                전체 내역 ({transactions.length})
              </button>
              <button
                onClick={() => setTxTypeFilter('earn')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  txTypeFilter === 'earn'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                적립 내역 ({transactions.filter((t) => t.type === 'earn').length})
              </button>
              <button
                onClick={() => setTxTypeFilter('use')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  txTypeFilter === 'use'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                사용 내역 ({transactions.filter((t) => t.type === 'use').length})
              </button>
            </div>

            {/* Requirement 4: 기간별 조회 바 */}
            <PeriodFilterBar
              period={txPeriod}
              onPeriodChange={setTxPeriod}
              customStart={txCustomStart}
              onCustomStartChange={setTxCustomStart}
              customEnd={txCustomEnd}
              onCustomEndChange={setTxCustomEnd}
              countLabel="조회된 내역"
              count={filteredTxList.length}
            />

            {/* Transactions List */}
            {filteredTxList.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-stone-200 shadow-xs space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto text-xl">
                  📜
                </div>
                <h4 className="text-sm font-bold text-stone-800">조회된 포인트 내역이 없습니다.</h4>
                <p className="text-xs text-stone-400">선택하신 기간 또는 유형에 해당하는 내역이 존재하지 않습니다.</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-5 divide-y divide-stone-100 shadow-xs space-y-1">
                {filteredTxList.map((tx) => {
                  const isEarn = tx.type === 'earn';
                  const balanceDisplay = tx.balanceAfter !== undefined ? tx.balanceAfter : points;

                  return (
                    <div key={tx.id} className="py-3.5 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              isEarn
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {isEarn ? '적립' : '사용'}
                          </span>
                          <span className="text-[10px] font-semibold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                            {tx.category}
                          </span>
                          <h5 className="text-sm font-bold text-stone-900">{tx.title}</h5>
                        </div>

                        {/* 날짜 및 관련 미션 또는 구매 내역 */}
                        <div className="text-[11px] text-stone-500 flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-stone-400">{tx.date}</span>
                          {(tx.relatedSource || tx.detail) && (
                            <span className="text-stone-600 bg-stone-50 px-2 py-0.5 rounded border border-stone-200/60 font-medium">
                              출처: {tx.relatedSource || tx.detail}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 변동 금액 및 적립/사용 후 잔액 */}
                      <div className="text-left sm:text-right shrink-0">
                        <div
                          className={`text-base font-black tabular-nums ${
                            isEarn ? 'text-amber-600' : 'text-rose-600'
                          }`}
                        >
                          {isEarn ? `+${tx.amount.toLocaleString()}` : tx.amount.toLocaleString()} P
                        </div>
                        <div className="text-[11px] text-stone-400 tabular-nums font-medium mt-0.5">
                          잔액: <strong className="text-stone-700">{balanceDisplay.toLocaleString()} P</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* ========================================================
          MODAL: 반려견 사진 변경 (File Upload & Presets)
          ======================================================== */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900">반려견 사진 추가 및 변경</h3>
              <button onClick={() => setIsPhotoModalOpen(false)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center py-2">
              <div className="w-24 h-24 rounded-3xl bg-amber-500 text-white flex items-center justify-center text-5xl mx-auto shadow-md overflow-hidden border-2 border-stone-100">
                {user.profileImage && user.profileImage.startsWith('data:image') ? (
                  <img src={user.profileImage} alt={user.petName} className="w-full h-full object-cover" />
                ) : (
                  <span>{user.profileImage || '🐶'}</span>
                )}
              </div>
              <p className="text-xs text-stone-500 mt-2">
                직접 찍은 반려견 사진을 올리거나 귀여운 캐릭터를 골라보세요.
              </p>
            </div>

            {/* Direct File Upload */}
            <div className="space-y-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>내 기기에서 사진 불러오기</span>
              </button>
            </div>

            {/* Preset Avatars */}
            <div>
              <span className="text-[11px] font-semibold text-stone-500 block mb-2">캐릭터 아바타 선택</span>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {['🐶', '🐕', '🐩', '🐾', '🦮', '🐕‍🦺', '🦴', '🧡'].map((em) => (
                  <button
                    key={em}
                    onClick={() => handleSelectPresetAvatar(em)}
                    className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-amber-100 text-xl flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: 반려견 프로필 사진 확대 뷰 (LIGHTBOX ZOOM MODAL)
          Requirement 4: 프로필 사진 클릭 시 사진 확대 기능 제공
          ======================================================== */}
      {isPhotoZoomOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-stone-900 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 text-white border border-stone-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🐾</span>
                <div>
                  <h3 className="text-base font-bold text-white">{user.petName} 프로필 사진</h3>
                  <p className="text-xs text-stone-400">{user.petBreed} · {user.petAge}세</p>
                </div>
              </div>
              <button
                onClick={() => setIsPhotoZoomOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Enlarged Photo Frame */}
            <div className="w-full aspect-square rounded-2xl bg-stone-950 flex items-center justify-center overflow-hidden border border-stone-800 shadow-inner">
              {user.profileImage && user.profileImage.startsWith('data:image') ? (
                <img
                  src={user.profileImage}
                  alt={user.petName}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-8xl select-none">{user.profileImage || '🐶'}</span>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsPhotoZoomOpen(false);
                  setIsPhotoModalOpen(true);
                }}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Camera className="w-4 h-4" />
                <span>사진 변경하기</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPhotoZoomOpen(false)}
                className="px-5 py-3 bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: 반려동물 건강정보 및 보호자 정보 수정 (FULL FORM)
          ======================================================== */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-900">맞춤 케어 정보 수정</h3>
                <p className="text-xs text-stone-500 mt-0.5">최신 상태를 업데이트하면 맞춤 산책량과 의료 혜택이 정밀해집니다.</p>
              </div>
              <button onClick={() => setIsProfileModalOpen(false)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* 0. 반려견 프로필 사진 변경 */}
              <div className="bg-stone-50 p-4 rounded-2xl flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-3xl shadow-sm overflow-hidden border-2 border-white shrink-0">
                  {user.profileImage && user.profileImage.startsWith('data:image') ? (
                    <img src={user.profileImage} alt={user.petName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{user.profileImage || '🐶'}</span>
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <span className="text-xs font-bold text-stone-800 block">반려견 프로필 사진 변경</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-600" />
                      <span>내 기기에서 사진 불러오기</span>
                    </button>
                    <div className="flex items-center gap-1">
                      {['🐶', '🐕', '🐩', '🐾', '🦮', '🦴'].map((em) => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => handleSelectPresetAvatar(em)}
                          className="w-7 h-7 rounded-lg bg-white border border-stone-200 hover:bg-amber-50 text-sm flex items-center justify-center cursor-pointer"
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 1. 반려동물 기본 정보 */}
              <div className="bg-stone-50 p-4 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-amber-800">🐾 반려동물 기본 정보</span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-stone-600 mb-1 font-medium">이름 (필수)</label>
                    <input
                      type="text"
                      value={editProfileForm.petName}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, petName: e.target.value })}
                      className="w-full px-3 py-2 bg-white rounded-xl text-xs focus:ring-2 focus:ring-amber-500/30"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1 font-medium">견종 (필수)</label>
                    <input
                      type="text"
                      value={editProfileForm.petBreed}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, petBreed: e.target.value })}
                      className="w-full px-3 py-2 bg-white rounded-xl text-xs focus:ring-2 focus:ring-amber-500/30"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1 font-medium">나이 (세, 필수)</label>
                    <input
                      type="number"
                      value={editProfileForm.petAge}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, petAge: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white rounded-xl text-xs focus:ring-2 focus:ring-amber-500/30"
                      min="1"
                      max="30"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1 font-medium">몸무게 (kg, 필수)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editProfileForm.petWeight}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, petWeight: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-white rounded-xl text-xs focus:ring-2 focus:ring-amber-500/30"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1 font-medium">성별</label>
                    <select
                      value={editProfileForm.petGender}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, petGender: e.target.value as '남아' | '여아' })}
                      className="w-full px-3 py-2 bg-white rounded-xl text-xs"
                    >
                      <option value="남아">남아</option>
                      <option value="여아">여아</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1 font-medium">중성화 여부 (필수)</label>
                    <select
                      value={editProfileForm.neuteredStatus}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, neuteredStatus: e.target.value as '중성화 완료' | '중성화하지 않음' | '모름' })}
                      className="w-full px-3 py-2 bg-white rounded-xl text-xs font-semibold text-stone-800"
                    >
                      <option value="중성화 완료">중성화 완료</option>
                      <option value="중성화하지 않음">중성화하지 않음</option>
                      <option value="모름">모름</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. 반려동물 건강 정보 (지병, 질병종류 10종, 세부질병, 약물, 특이사항) */}
              <div className="bg-amber-50/50 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                    반려동물 건강 & 지병 정보 (필수)
                  </span>
                </div>

                {/* 지병 여부 3-choice */}
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1.5">지병 여부</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['있음', '없음', '모름'] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setEditProfileForm({ ...editProfileForm, hasCondition: opt })}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          editProfileForm.hasCondition === opt
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-white text-stone-600 hover:bg-stone-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conditional detail fields if hasCondition === '있음' */}
                {editProfileForm.hasCondition === '있음' && (
                  <div className="space-y-3 pt-2 border-t border-amber-200/60 animate-fadeIn">
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1.5">
                        질병 종류 (복수 선택 가능)
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                        {DISEASE_CATEGORIES.map((cat) => {
                          const isSelected = editProfileForm.conditionCategories.includes(cat);
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => toggleEditCategory(cat)}
                              className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-amber-600 text-white shadow-2xs'
                                  : 'bg-white text-stone-700 hover:bg-stone-100'
                              }`}
                            >
                              {cat}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <label className="block text-stone-600 mb-1 font-medium">세부 질병명</label>
                        <input
                          type="text"
                          value={editProfileForm.conditionDetail}
                          onChange={(e) => setEditProfileForm({ ...editProfileForm, conditionDetail: e.target.value })}
                          className="w-full px-3 py-2 bg-white rounded-xl text-xs"
                          placeholder="예: 슬개골 탈구 2기, 아토피 피부염 등"
                        />
                      </div>
                      <div>
                        <label className="block text-stone-600 mb-1 font-medium">복용 중인 약물</label>
                        <input
                          type="text"
                          value={editProfileForm.medications}
                          onChange={(e) => setEditProfileForm({ ...editProfileForm, medications: e.target.value })}
                          className="w-full px-3 py-2 bg-white rounded-xl text-xs"
                          placeholder="예: 항히스타민제, 관절 영양제 등"
                        />
                      </div>
                      <div>
                        <label className="block text-stone-600 mb-1 font-medium">기타 특이사항</label>
                        <textarea
                          rows={2}
                          value={editProfileForm.healthNotes}
                          onChange={(e) => setEditProfileForm({ ...editProfileForm, healthNotes: e.target.value })}
                          className="w-full px-3 py-2 bg-white rounded-xl text-xs resize-none"
                          placeholder="예: 미끄러운 바닥 주의, 심한 흥분 시 호흡 불안정 등"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 최근 정기검진 기록 */}
                <div className="pt-2 text-xs">
                  <label className="block text-stone-600 mb-1 font-medium">최근 정기검진 기록 (선택)</label>
                  <input
                    type="text"
                    value={editProfileForm.regularCheckupRecord}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, regularCheckupRecord: e.target.value })}
                    className="w-full px-3 py-2 bg-white rounded-xl text-xs"
                    placeholder="예: 2024년 10월 연간 종합건강검진 완료"
                  />
                </div>
              </div>

              {/* 3. 보호자 정보 */}
              <div className="bg-stone-50 p-4 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-stone-800">👤 보호자 정보</span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-stone-600 mb-1 font-medium">보호자 성함 (필수)</label>
                    <input
                      type="text"
                      value={editProfileForm.guardianName}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, guardianName: e.target.value })}
                      className="w-full px-3 py-2 bg-white rounded-xl text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-1 font-medium">보호자 나이 (선택)</label>
                    <input
                      type="number"
                      value={editProfileForm.guardianAge}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, guardianAge: e.target.value })}
                      className="w-full px-3 py-2 bg-white rounded-xl text-xs"
                      placeholder="예: 28"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-stone-600 mb-1 font-medium">
                      거주 지역 <span className="text-amber-600 font-bold">(필수)</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {/* 1차: 시·도 선택 (17개 광역자치단체) */}
                      <div>
                        <select
                          value={editSido}
                          onChange={(e) => {
                            const newSido = e.target.value;
                            setEditSido(newSido);
                            const sigungus = getSigunguList(newSido);
                            const firstSigungu = sigungus[0] || '';
                            setEditSigungu(firstSigungu);
                            setEditProfileForm((prev) => ({
                              ...prev,
                              guardianRegion: formatRegion(newSido, firstSigungu),
                            }));
                          }}
                          className="w-full px-3 py-2 bg-white rounded-xl text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-2xs cursor-pointer"
                          required
                        >
                          <option value="">시·도 선택 (광역자치단체)</option>
                          {SIDO_LIST.map((sido) => (
                            <option key={sido} value={sido}>
                              {sido}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 2차: 시·군·구 선택 */}
                      <div>
                        <select
                          value={editSigungu}
                          onChange={(e) => {
                            const newSigungu = e.target.value;
                            setEditSigungu(newSigungu);
                            setEditProfileForm((prev) => ({
                              ...prev,
                              guardianRegion: formatRegion(editSido, newSigungu),
                            }));
                          }}
                          disabled={!editSido}
                          className={`w-full px-3 py-2 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-2xs transition-all ${
                            editSido
                              ? 'bg-white text-stone-800 cursor-pointer'
                              : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                          }`}
                          required
                        >
                          <option value="">
                            {editSido ? '시·군·구 선택' : '시·도를 먼저 선택해 주세요'}
                          </option>
                          {getSigunguList(editSido).map((sigungu) => (
                            <option key={sigungu} value={sigungu}>
                              {sigungu}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {editProfileForm.guardianRegion && (
                      <div className="mt-1.5 text-[11px] text-amber-700 font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-600" />
                        <span>선택된 지역: <strong>{editProfileForm.guardianRegion}</strong> (주변 병원 검색에 반영)</span>
                      </div>
                    )}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-stone-600 mb-1 font-medium">
                      함께 반려동물을 돌보는 사람이 있나요? (선택)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        '있음 (가족·동거인과 함께 돌봄)',
                        '없음 (혼자 돌봄)',
                      ].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setEditProfileForm({ ...editProfileForm, cohabitantStatus: opt })}
                          className={`py-2 px-2.5 rounded-xl text-[11px] font-semibold text-center transition-all cursor-pointer ${
                            editProfileForm.cohabitantStatus === opt
                              ? 'bg-amber-500 text-white font-bold shadow-xs'
                              : 'bg-white text-stone-600 hover:bg-stone-100'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: 새 의료비 목표 추가 / 수정
          ======================================================== */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-stone-900">
                {editingGoal ? '목표 수정' : '새 목표 추가'}
              </h3>
              <button onClick={() => setIsGoalModalOpen(false)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-700 mb-1 font-semibold">목표 이름</label>
                <input
                  type="text"
                  value={goalForm.title}
                  onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                  placeholder="예: 다음 달 정기 종합검진, 슬개골 관리 대비"
                  className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-semibold">목적 카테고리</label>
                <select
                  value={goalForm.category}
                  onChange={(e) => setGoalForm({ ...goalForm, category: e.target.value as MedicalGoal['category'] })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-medium cursor-pointer"
                >
                  <option value="정기검진">정기검진</option>
                  <option value="예방접종">예방접종</option>
                  <option value="응급진료비">응급진료비 대비</option>
                  <option value="수술비">수술비 마련</option>
                  <option value="기타">기타 목적</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-stone-700 font-semibold">목표 금액 (P)</label>
                  <span className="text-amber-600 font-bold tabular-nums">
                    {goalForm.targetAmount.toLocaleString()} P
                  </span>
                </div>
                <input
                  type="number"
                  step="10000"
                  value={goalForm.targetAmount}
                  onChange={(e) => setGoalForm({ ...goalForm, targetAmount: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 tabular-nums font-semibold"
                  required
                />
                <div className="flex items-center gap-1.5 mt-2">
                  {[50000, 150000, 300000, 500000, 800000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setGoalForm({ ...goalForm, targetAmount: amt })}
                      className="px-2 py-1 bg-stone-100 hover:bg-amber-100 rounded-lg text-[10px] font-semibold text-stone-600 transition-colors cursor-pointer"
                    >
                      {(amt / 10000)}만P
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-600">
                    {editingGoal ? '현재 목표 적립액' : '시작 적립액'}
                  </span>
                  <span className="font-bold text-stone-900 tabular-nums bg-white px-2 py-0.5 rounded border border-stone-200">
                    {editingGoal ? `${editingGoal.currentAmount.toLocaleString()} P` : '0 P (고정)'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 mt-1">
                  {editingGoal
                    ? '* 적립액은 목표 카드의 [목표에 적립하기] 버튼을 통해 보유 포인트에서 추가 적립할 수 있습니다.'
                    : '* 신규 생성 시 0P로 시작하며, 생성 완료 후 보유 포인트에서 자유롭게 적립할 수 있습니다.'}
                </p>
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-semibold">목표 상세 메모 (선택)</label>
                <textarea
                  rows={2}
                  value={goalForm.description}
                  onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                  placeholder="예: 마포 센트럴 병원 가을 검진 패키지 대비"
                  className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="px-4 py-2.5 font-semibold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: 검진·접종 내역 직접 등록 / 수정
          ======================================================== */}
      {/* ========================================================
          MODAL: 산책 기록 상세 보기
          ======================================================== */}
      {selectedWalk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                  산책 상세 리포트
                </span>
                <h3 className="text-base font-bold text-stone-900 mt-1">{selectedWalk.courseTitle || selectedWalk.courseName}</h3>
              </div>
              <button onClick={() => setSelectedWalk(null)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-stone-50 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between text-stone-500">
                  <span>산책 일시</span>
                  <span className="font-semibold text-stone-800">
                    {selectedWalk.date} {selectedWalk.time ? selectedWalk.time : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between text-stone-500">
                  <span>반려견 동행 검증</span>
                  <span className="font-semibold text-emerald-600 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    스마트 GPS 목걸이 연동 완료
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-amber-50 rounded-2xl">
                  <span className="text-[10px] text-amber-700 font-semibold block">산책 거리</span>
                  <span className="text-sm font-black text-amber-900 tabular-nums mt-0.5 block">{selectedWalk.distanceKm} km</span>
                </div>
                <div className="p-3 bg-amber-50 rounded-2xl">
                  <span className="text-[10px] text-amber-700 font-semibold block">소요 시간</span>
                  <span className="text-sm font-black text-amber-900 tabular-nums mt-0.5 block">{selectedWalk.durationMinutes} 분</span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-2xl">
                  <span className="text-[10px] text-emerald-700 font-semibold block">지급 포인트</span>
                  <span className="text-sm font-black text-emerald-900 tabular-nums mt-0.5 block">
                    +{(selectedWalk.pointsEarned ?? selectedWalk.earnedPoints ?? 0).toLocaleString()} P
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-stone-600">
                  <span>소비 칼로리</span>
                  <span className="font-bold text-stone-900">
                    {selectedWalk.caloriesBurned ?? selectedWalk.calories ?? 0} kcal
                  </span>
                </div>
                <div className="flex items-center justify-between text-stone-600">
                  <span>평균 보행 속도</span>
                  <span className="font-bold text-stone-900">
                    {((selectedWalk.distanceKm / (selectedWalk.durationMinutes || 1)) * 60).toFixed(1)} km/h
                  </span>
                </div>
                {selectedWalk.geoPath && selectedWalk.geoPath.length > 0 && (
                  <div className="pt-2 border-t border-stone-200 text-stone-500 text-[11px]">
                    <span className="font-semibold text-stone-700 block mb-0.5">실시간 GPS 궤적 기록</span>
                    <span>총 {selectedWalk.geoPath.length}개 GPS 좌표 경로 수집 및 유효성 검증 완료</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedWalk(null)}
              className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: 검진 내역 상세 보기
          ======================================================== */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                  {selectedRecord.checkupType}
                </span>
                <h3 className="text-base font-bold text-stone-900 mt-1">{selectedRecord.hospitalName}</h3>
              </div>
              <button onClick={() => setSelectedRecord(null)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between text-stone-500">
                  <span>진료일시</span>
                  <span className="font-semibold text-stone-800">{selectedRecord.date}</span>
                </div>
                {selectedRecord.nextCheckupDate && (
                  <div className="flex items-center justify-between text-stone-500">
                    <span>다음 권장 검진</span>
                    <span className="font-semibold text-amber-600">{selectedRecord.nextCheckupDate}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <span className="font-bold text-stone-800">수의사 진료 소견</span>
                <p className="p-3 bg-stone-50 rounded-2xl text-stone-700 leading-relaxed">
                  {selectedRecord.doctorOpinion}
                </p>
              </div>

              {selectedRecord.findings && selectedRecord.findings.length > 0 && (
                <div className="space-y-1">
                  <span className="font-bold text-stone-800">세부 검사 결과</span>
                  <ul className="p-3 bg-stone-50 rounded-2xl space-y-1 list-disc list-inside text-stone-600">
                    {selectedRecord.findings.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedRecord.memo && (
                <div className="space-y-1">
                  <span className="font-bold text-stone-800">보호자 기록 메모</span>
                  <p className="p-3 bg-amber-50 rounded-2xl text-amber-900">{selectedRecord.memo}</p>
                </div>
              )}

              <div className="p-3 bg-stone-900 text-white rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-stone-400">총 진료비 {selectedRecord.totalCost.toLocaleString()}원</div>
                  <div className="text-xs font-bold text-amber-400">
                    모으개 할인 -{selectedRecord.pointDiscountApplied.toLocaleString()}원
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-stone-400 block">실제 결제액</span>
                  <span className="text-base font-black text-white tabular-nums">
                    {selectedRecord.actualPaid.toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedRecord(null)}
              className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: 포인트 혜택 상세 보기
          ======================================================== */}
      {detailRewardItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 bg-amber-50 rounded-2xl border border-amber-100">{detailRewardItem.icon || detailRewardItem.image || '🎁'}</span>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                      {detailRewardItem.subCategory || detailRewardItem.category}
                    </span>
                    {detailRewardItem.brandName && (
                      <span className="text-[10px] font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md">
                        {detailRewardItem.brandName}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-stone-900 mt-1">{detailRewardItem.title || detailRewardItem.name}</h3>
                </div>
              </div>
              <button onClick={() => setDetailRewardItem(null)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-stone-600 bg-stone-50 p-3.5 rounded-2xl leading-relaxed">
                {detailRewardItem.description}
              </p>

              {detailRewardItem.terms && (
                <div className="p-3 bg-stone-50 rounded-2xl space-y-1 text-stone-700">
                  <span className="font-bold text-stone-900 block">ℹ️ 이용 안내 및 혜택 기준</span>
                  <p>{detailRewardItem.terms}</p>
                </div>
              )}

              {detailRewardItem.usageConditions && detailRewardItem.usageConditions.length > 0 && (
                <div className="p-3 bg-stone-50 rounded-2xl space-y-1.5">
                  <span className="font-bold text-stone-900 block">📋 상세 이용 조건</span>
                  <ul className="space-y-1 text-stone-600 list-disc list-inside">
                    {detailRewardItem.usageConditions.map((cond, idx) => (
                      <li key={idx}>{cond}</li>
                    ))}
                  </ul>
                </div>
              )}

              {detailRewardItem.availableHospitals && detailRewardItem.availableHospitals.length > 0 && (
                <div className="space-y-1.5">
                  <span className="font-bold text-stone-800">이용 가능 제휴 병원</span>
                  <div className="flex flex-wrap gap-1.5">
                    {detailRewardItem.availableHospitals.map((h, i) => (
                      <span key={i} className="px-2.5 py-1 bg-stone-100 rounded-lg text-stone-700 font-medium text-[11px]">
                        🏥 {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {detailRewardItem.externalUrl && (
                <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-2xl flex items-center justify-between">
                  <div className="text-[11px] text-amber-900">
                    <span className="font-bold block">공식 제휴 스토어</span>
                    <span>정품 인증 및 상품 사양을 공식 몰에서 확인하실 수 있습니다.</span>
                  </div>
                  <a
                    href={detailRewardItem.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl border border-amber-200 flex items-center gap-1 shadow-2xs shrink-0"
                  >
                    <span>스토어 방문</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* Point Status Check */}
              <div className="p-3 rounded-2xl bg-stone-100/80 flex items-center justify-between text-xs">
                <span className="text-stone-600">내 보유 포인트: <strong className="text-stone-900 font-bold">{points.toLocaleString()} P</strong></span>
                {points >= detailRewardItem.requiredPoints ? (
                  <span className="text-emerald-700 font-bold">
                    교환 후 잔여: {(points - detailRewardItem.requiredPoints).toLocaleString()} P
                  </span>
                ) : (
                  <span className="text-rose-600 font-bold">
                    {(detailRewardItem.requiredPoints - points).toLocaleString()} P 부족
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-100">
              <div className="text-xs">
                <span className="text-stone-400 block text-[11px]">필요 교환 포인트</span>
                <span className="text-base font-black text-amber-600 tabular-nums">
                  {detailRewardItem.requiredPoints.toLocaleString()} P
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDetailRewardItem(null)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  닫기
                </button>
                <button
                  onClick={() => handleRedeemClick(detailRewardItem)}
                  disabled={points < detailRewardItem.requiredPoints}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-xs cursor-pointer ${
                    points >= detailRewardItem.requiredPoints
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
                  }`}
                >
                  {points >= detailRewardItem.requiredPoints ? '포인트 즉시 교환' : '포인트 부족'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: 포인트 교환 완료 바우처 팝업
          ======================================================== */}
      {redeemedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center text-3xl mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                교환 완료
              </span>
              <h3 className="text-base font-black text-stone-900 mt-1">{redeemedItem.title}</h3>
              <p className="text-xs text-stone-500 mt-1">
                바우처가 정상 발급되었습니다. 제휴 병원 접수처 또는 결제 시 바우처 코드를 제시해 주세요.
              </p>
            </div>

            <div className="p-3.5 bg-stone-50 rounded-2xl font-mono text-xs font-bold text-stone-700 tracking-wider">
              VOUCHER-MOGEGAE-{Date.now().toString().slice(-6)}
            </div>

            <button
              onClick={() => setRedeemedItem(null)}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: 목표에 포인트 적립하기 (보유 포인트 -> 목표 적립액)
          ======================================================== */}
      {isDepositModalOpen && selectedGoalForDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-2xs font-bold">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">목표에 적립하기</h3>
                  <span className="text-[11px] text-stone-500">
                    보유 포인트를 선택한 목표의 적립액으로 이체합니다.
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsDepositModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Goal Summary */}
            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-800 bg-white px-2 py-0.5 rounded border border-amber-200">
                  {selectedGoalForDeposit.category}
                </span>
                <span className="text-xs font-bold text-amber-900">
                  {Math.min(100, Math.round((selectedGoalForDeposit.currentAmount / selectedGoalForDeposit.targetAmount) * 100))}% 달성 중
                </span>
              </div>
              <h4 className="text-sm font-bold text-stone-900">{selectedGoalForDeposit.title}</h4>
              <div className="flex items-center justify-between text-xs text-stone-600 pt-1 border-t border-amber-200/50">
                <span>현재 적립액: <strong className="text-stone-900">{selectedGoalForDeposit.currentAmount.toLocaleString()} P</strong></span>
                <span>목표 금액: {selectedGoalForDeposit.targetAmount.toLocaleString()} P</span>
              </div>
            </div>

            {/* Available Points Info */}
            <div className="p-3 bg-stone-50 rounded-xl flex items-center justify-between text-xs">
              <span className="text-stone-600 font-medium">현재 사용 가능한 보유 포인트</span>
              <span className="text-sm font-black text-amber-600 tabular-nums">
                {points.toLocaleString()} P
              </span>
            </div>

            <form onSubmit={handleConfirmDeposit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  적립할 포인트 금액 (P)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={points}
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-3.5 pr-12 py-2.5 bg-stone-50 rounded-xl text-sm font-bold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 tabular-nums"
                    required
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs font-bold text-stone-400">P</span>
                </div>

                {/* Quick Add Buttons */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {[1000, 5000, 10000, 30000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDepositAmount((prev) => Math.min(points, (prev || 0) + amt))}
                      className="px-2.5 py-1 bg-stone-100 hover:bg-amber-100 rounded-lg text-[11px] font-semibold text-stone-700 transition-colors cursor-pointer"
                    >
                      +{amt.toLocaleString()}P
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const needed = Math.max(0, selectedGoalForDeposit.targetAmount - selectedGoalForDeposit.currentAmount);
                      setDepositAmount(Math.min(points, needed > 0 ? needed : points));
                    }}
                    className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ml-auto"
                  >
                    필요 전액
                  </button>
                </div>
              </div>

              {/* Real-time Preview */}
              {depositAmount > 0 && (
                <div className="p-3 bg-stone-50 rounded-xl space-y-1 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span>적립 후 남은 보유 포인트:</span>
                    <strong className="text-stone-900 tabular-nums">
                      {Math.max(0, points - depositAmount).toLocaleString()} P
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>적립 후 목표 적립액:</span>
                    <strong className="text-emerald-600 tabular-nums">
                      {(selectedGoalForDeposit.currentAmount + depositAmount).toLocaleString()} P (
                      {Math.min(100, Math.round(((selectedGoalForDeposit.currentAmount + depositAmount) / selectedGoalForDeposit.targetAmount) * 100))}%)
                    </strong>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDepositModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={depositAmount <= 0 || depositAmount > points}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-200 disabled:text-stone-400 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>{depositAmount.toLocaleString()}P 적립하기</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: 목표 삭제 및 포인트 환급 확인
          ======================================================== */}
      {isDeleteModalOpen && goalToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-stone-900">목표를 삭제하시겠습니까?</h3>
              <p className="text-xs text-stone-500">
                삭제 대상: <strong className="text-stone-800">[{goalToDelete.title}]</strong>
              </p>
            </div>

            {/* Refund Notice if currentAmount > 0 */}
            {goalToDelete.currentAmount > 0 ? (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/80 text-center space-y-1">
                <span className="text-[11px] font-bold text-emerald-800 block">
                  💰 적립 포인트 전액 환급 안내
                </span>
                <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                  현재 해당 목표에 적립된{' '}
                  <strong className="text-emerald-700 font-extrabold tabular-nums">
                    {goalToDelete.currentAmount.toLocaleString()} P
                  </strong>
                  는 회원님의 <strong>보유 포인트로 즉시 전액 환급</strong> 처리됩니다.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-stone-50 rounded-xl text-center text-xs text-stone-500">
                적립된 포인트가 없어 별도의 환급 없이 삭제됩니다.
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setGoalToDelete(null);
                }}
                className="flex-1 py-2.5 text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteGoal}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {goalToDelete.currentAmount > 0 ? '삭제 및 환급받기' : '삭제하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
