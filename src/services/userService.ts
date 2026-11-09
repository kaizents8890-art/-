/**
 * @file userService.ts
 * 사용자별 독립적인 데이터 로컬 영구 저장소 (localStorage) 관리 서비스
 */

import {
  UserProfile,
  AttendanceDay,
  WalkTarget,
  MedicalGoal,
  PointTransaction,
  MedicalCheckupRecord,
  WalkRecord,
  ShopOrder,
  CartItem,
  ProductReview
} from '../types';
import {
  initialUserProfile,
  initialAttendanceDays,
  initialWalkTarget,
  initialMedicalGoals,
  initialTransactions,
  initialMedicalCheckupRecords,
  initialWalkRecords
} from '../data/mockData';
import { initialShopOrders, initialProductReviews } from '../data/shopData';

export interface StoredUserData {
  userId: string;
  user: UserProfile;
  points: number;
  dailyEarnedPoints: number;
  medicalGoals: MedicalGoal[];
  transactions: PointTransaction[];
  attendanceDays: AttendanceDay[];
  walkTarget: WalkTarget;
  medicalRecords: MedicalCheckupRecord[];
  walkRecords: WalkRecord[];
  welcomePointsGranted: boolean;
  lastAttendanceDate?: string;
  attendanceHistory?: string[];
  orders?: ShopOrder[];
  cart?: CartItem[];
  reviews?: Record<string, ProductReview[]>;
  customLogo?: string;
}

const STORAGE_PREFIX = 'mogege_user_data_v2_';

import { generateRealAttendanceDays, getTodayDateString } from '../utils/dateUtils';

/**
 * 기본 시연 계정 (ascend8630 - 김영석) 초기 데이터 생성
 */
export const getInitialDataForDefaultUser = (userId: string, name: string): StoredUserData => {
  return {
    userId,
    user: {
      ...initialUserProfile,
      id: userId,
      guardianName: name,
    },
    points: 138500,
    dailyEarnedPoints: 120,
    medicalGoals: [...initialMedicalGoals],
    transactions: [...initialTransactions],
    attendanceDays: generateRealAttendanceDays([]),
    walkTarget: { ...initialWalkTarget },
    medicalRecords: [...initialMedicalCheckupRecords],
    walkRecords: [...initialWalkRecords],
    welcomePointsGranted: true,
    lastAttendanceDate: undefined,
    attendanceHistory: [],
    orders: [...initialShopOrders],
    cart: [],
    reviews: { ...initialProductReviews },
    customLogo: '/assets/aistudio/mogege_new_logo.png',
  };
};

/**
 * 신규 회원가입 유저 초기 데이터 생성
 * - 가입 축하 포인트는 무조건 2,000P로 고정
 * - 목표 시작 적립액은 0P로 시작
 * - 사용자가 설정한 단일 목표 1개만 등록
 * - 검진·접종 기록은 제휴 병원에서 등록하기 전까지 빈 목록 (안내 문구 표출)
 */
export const createInitialDataForNewUser = (
  userId: string,
  profile: Partial<UserProfile>,
  initialGoal?: MedicalGoal
): StoredUserData => {
  const welcomePoint = 2000;
  const initialGoals: MedicalGoal[] = [];

  if (initialGoal) {
    initialGoals.push({
      ...initialGoal,
      currentAmount: 0, // 시작 적립액은 무조건 0P
      isPrimary: true,
    });
  } else {
    initialGoals.push({
      id: `goal_${Date.now()}`,
      title: '응급진료비 대비',
      targetAmount: 300000,
      currentAmount: 0,
      category: '응급진료비',
      isPrimary: true,
      description: `${profile.petName || '반려견'}을(를) 위한 맞춤 의료비 적립 플랜`,
    });
  }

  const welcomeTx: PointTransaction = {
    id: `tx_welcome_${Date.now()}`,
    type: 'earn',
    title: '회원가입 축하 포인트 +2,000P',
    category: '보너스',
    amount: welcomePoint,
    date: '방금 전',
    detail: '모으개 신규 회원가입 환영 리워드',
  };

  const fullProfile: UserProfile = {
    id: userId,
    guardianName: profile.guardianName || '신규 보호자',
    guardianRegion: profile.guardianRegion || '서울특별시 마포구',
    guardianAge: profile.guardianAge,
    hasCohabitant: profile.hasCohabitant ?? true,
    cohabitantStatus: profile.cohabitantStatus || '있음 (가족·동거인과 함께 돌봄)',
    petName: profile.petName || '우리 아이',
    petBreed: profile.petBreed || '말티즈',
    petAge: profile.petAge || 3,
    petWeight: profile.petWeight || 4.0,
    petGender: profile.petGender || '수컷',
    neuteredStatus: profile.neuteredStatus || '중성화 완료',
    petIsNeutered: profile.neuteredStatus === '중성화 완료',
    hasCondition: profile.hasCondition || '없음',
    conditionCategories: profile.conditionCategories || [],
    conditionDetail: profile.conditionDetail,
    medications: profile.medications,
    healthNotes: profile.healthNotes,
    petCondition: profile.petCondition || '특이 지병 없음 (건강)',
    regularCheckupRecord: profile.regularCheckupRecord || '',
    profileImage: profile.profileImage || '🐶',
    avatarColor: '#f59e0b',
    gpsCollarConnected: false, // 기본 미연결 상태 유지 (요구사항: 실제 연결 전 임의 연결 완료 표시 금지)
  };

  // Requirement 2: 제휴 병원 등록 기록이 없는 경우 '등록된 검진·접종 기록이 없습니다.' 표시
  return {
    userId,
    user: fullProfile,
    points: welcomePoint,
    dailyEarnedPoints: 0,
    medicalGoals: initialGoals,
    transactions: [welcomeTx],
    attendanceDays: generateRealAttendanceDays([]),
    walkTarget: {
      weeklyGoalTimes: 5,
      weeklyGoalDistance: 10.0,
      currentWeekTimes: 0,
      currentWeekDistance: 0,
    },
    medicalRecords: [], // 제휴 병원에서 등록하기 전까지 빈 목록 유지
    walkRecords: [],
    welcomePointsGranted: true,
    lastAttendanceDate: undefined,
    attendanceHistory: [],
    orders: [],
    cart: [],
    reviews: { ...initialProductReviews },
    customLogo: '/assets/aistudio/mogege_new_logo.png',
  };
};

/**
 * 특정 유저의 로컬 데이터 가져오기
 */
export const getUserData = (userId: string, defaultName?: string): StoredUserData => {
  const key = `${STORAGE_PREFIX}${userId}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredUserData;
      // 필수 데이터 누락 방지 보정
      if (!parsed.medicalGoals) parsed.medicalGoals = [];
      if (!parsed.transactions) parsed.transactions = [];
      if (!parsed.walkRecords) parsed.walkRecords = [];
      if (!parsed.medicalRecords) parsed.medicalRecords = [];
      if (!parsed.attendanceHistory) parsed.attendanceHistory = [];
      if (!parsed.orders) parsed.orders = [];
      if (!parsed.cart) parsed.cart = [];
      if (!parsed.reviews) parsed.reviews = { ...initialProductReviews };
      if (!parsed.customLogo) parsed.customLogo = '/assets/aistudio/mogege_new_logo.png';

      // 실제 현재 날짜 기반으로 출석체크 7일 데이터 동적 생성 및 당일 출석 여부 자동 평가
      parsed.attendanceDays = generateRealAttendanceDays(parsed.attendanceHistory);

      return parsed;
    }
  } catch (e) {
    console.error('Failed to load user data from localStorage', e);
  }

  // 데이터가 없을 때 기본 생성
  const defaultData = getInitialDataForDefaultUser(userId, defaultName || '김영석');
  saveUserData(userId, defaultData);
  return defaultData;
};

/**
 * 특정 유저의 로컬 데이터 저장
 */
export const saveUserData = (userId: string, data: StoredUserData): void => {
  const key = `${STORAGE_PREFIX}${userId}`;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save user data to localStorage', e);
  }
};
