export type TabType = 'home' | 'mission' | 'shop' | 'community' | 'hospital' | 'mypage' | 'admin';

export interface UserProfile {
  id: string;
  guardianName: string;
  guardianRegion: string; // 보호자 거주지역 (필수)
  guardianAge?: number; // 보호자 나이 (선택)
  hasCohabitant: boolean; // 함께 반려동물을 돌보는 사람이 있나요? (있음: true, 없음: false)
  cohabitantStatus?: string; // 동거인 여부 텍스트 표현
  petName: string;
  petBreed: string; // 반려동물 견종 (필수)
  petAge: number; // 반려동물 나이 (세) (필수)
  petWeight?: number; // kg (선택)
  petGender: '수컷' | '암컷' | '남아' | '여아';
  neuteredStatus: '중성화 완료' | '중성화하지 않음' | '모름'; // 중성화 여부 (선택형 UI)
  petIsNeutered: boolean;
  hasCondition: '있음' | '없음' | '모름'; // 지병 여부 (있음/없음/모름)
  conditionCategories: string[]; // 질병 종류 복수 선택
  conditionDetail?: string; // 세부 질병명 (직접 입력)
  medications?: string; // 복용 중인 약물 (직접 입력)
  healthNotes?: string; // 기타 특이사항 (직접 입력)
  petCondition: string; // 종합 지병 요약 문구
  regularCheckupRecord?: string; // 반려동물 정기검진 기록
  profileImage?: string; // 반려견 사진 (dataURL 또는 아바타)
  avatarColor: string;
  gpsCollarConnected?: boolean; // GPS 산책 목걸이 연결 여부 (필수 조건)
  gpsCollarDeviceId?: string; // 연결된 기기 식별번호 (예: MOGE-GPS-9482)
  gpsCollarBattery?: number; // 배터리 잔량 % (예: 94)
  gpsCollarModel?: string; // 기기 모델명 (예: 모으개 스마트 GPS 안심 산책 목걸이)
}

export interface AttendanceDay {
  dayNumber: number;
  dateStr: string;
  isToday: boolean;
  isChecked: boolean;
  rewardPoints: number;
}

export interface WalkTarget {
  weeklyGoalTimes: number; // 주간 산책 목표 횟수 (예: 5회)
  weeklyGoalDistance: number; // 주간 산책 목표 거리 km (예: 14km)
  currentWeekTimes: number;
  currentWeekDistance: number;
}

export interface AiWalkRecommendation {
  recommendedDailyMinutes: number; // 권장 일일 산책 시간 (분)
  recommendedDailyKm: number; // 권장 거리 (km)
  recommendedPace: string; // 권장 페이스 (예: 보통 속도 평지 산책)
  healthCautionNote: string; // 건강정보 반영 주의사항
  dailyMaxPointLimit: number; // 한도 도달 시 추가 적립 제한 (예: 500P)
  pointsPer100m: number; // 100m당 적립 포인트
}

export interface PointTransaction {
  id: string;
  type: 'earn' | 'use';
  title: string;
  category: '산책' | '출석체크' | '병원비할인' | '용품교환' | '이벤트' | '보너스';
  amount: number;
  date: string;
  detail?: string;
  balanceAfter?: number; // 적립 또는 사용 후 잔액
  relatedSource?: string; // 관련 미션 또는 구매 내역 (예: '산책 미션 2.1km', '주문번호 MGG-20261028-4821', '출석체크 150P')
}

// 의료비 목표 항목 (여러 목표 등록 및 진행률 비교 관리)
export interface MedicalGoal {
  id: string;
  title: string; // 예: "다음 달 건강검진", "정기 예방접종", "응급진료비 대비", "수술비 마련"
  targetAmount: number; // 목표 금액 (예: 300,000P)
  currentAmount: number; // 현재 적립된 포인트 (예: 135,000P)
  category: '정기검진' | '예방접종' | '응급진료비' | '수술비' | '기타';
  isPrimary?: boolean;
  description?: string;
  isCompleted?: boolean; // 목표 달성 완료 여부 (100% 이상 달성 시)
  completedDate?: string; // 목표 달성 날짜 (예: '2026.10.15')
}

export interface CommunityPost {
  id: string;
  category: '건강관리 및 예방' | '예방접종·검진' | '제품 후기' | '자유질문';
  title: string;
  content: string;
  author: string;
  authorPetBreed: string;
  date: string;
  likes: number;
  commentsCount: number;
  views: number;
  isLiked?: boolean;
  tags: string[];
  comments?: Array<{
    id: string;
    author: string;
    content: string;
    date: string;
  }>;
}

export interface EmergencyGuide {
  id: string;
  title: string;
  category: '응급처치 및 금지 행동' | '증상별 응급 대처법' | '병원 방문 전 준비사항';
  urgencyLevel: '즉시 병원 내원' | '응급 처치 후 내원' | '상태 관찰';
  summary: string;
  doList: string[];
  dontList: string[];
  preparationNotes: string[];
  applicableSymptoms: string[];
}

export interface Hospital {
  id: string;
  name: string;
  isEmergency24h: boolean; // 응급 동물병원 (24시)
  distanceKm: number;
  address: string;
  phone: string;
  rating: number;
  reviewCount: number;
  openingHours: string;
  departments: string[]; // 시설·진료과목 (정형외과, 내과, 안과, 24시응급 등)
  facilities: string[]; // 주차, 고양이대기실, ICU입원실, CT/MRI
  pointDiscountRate: string; // "모으개 포인트 최대 30% 사용 가능"
  lat?: number;
  lng?: number;
  reviews: Array<{
    id: string;
    author: string;
    petBreed: string;
    rating: number;
    content: string;
    date: string;
    visitedFor: string;
  }>;
}

export interface RewardItem {
  id: string;
  category: '병원비·검진' | '반려용품' | '용품·사료';
  subCategory: '진료비바우처' | '종합검진지원' | '예방접종지원' | '관절보호' | '영양관리' | '위생/산책';
  name: string;
  title?: string; // alias for name
  icon?: string;
  brandName: string; // 대상 브랜드명 (예: 디팡, 닥터힐메딕스, 모으개 메디컬케어)
  provider: string;
  requiredPoints: number;
  originalPrice: number;
  discountBadge: string;
  description: string;
  terms: string;
  image: string;
  availableHospitals?: string[]; // 이용 가능 제휴 동물병원 목록
  coverageScope?: string; // 지원 범위 (예: 일반 진료비, 약제비, 기본 혈액검사 등)
  coverage?: string; // alias for coverageScope
  usageMethod?: string; // 사용 방법 안내
  usageConditions?: string[]; // 포인트 사용 상세 조건
  externalUrl?: string; // 외부 구매 페이지 이동 링크 (용품 할인용)
}

export interface MedicalCheckupRecord {
  id: string;
  date: string;
  hospitalName: string;
  checkupType: string; // 예: 정기 종합검진, 예방접종(광견병), 슬개골 탈구 재검
  doctorOpinion: string;
  findings: string[]; // 검진 소견
  memo?: string; // 보호자 메모
  totalCost: number;
  pointDiscountApplied: number;
  actualPaid: number;
  nextCheckupDate: string;
}

// 산책 완료 기록 및 지도 경로
export interface WalkPathPoint {
  x: number; // 0 ~ 100 percentage in map viewport
  y: number;
  timeSec?: number;
}

export interface WalkRecord {
  id: string;
  date: string; // 예: "2026.10.25 18:20"
  time?: string;
  courseName: string; // 예: "연남 경의선 숲길 평지 산책로"
  courseTitle?: string; // alias
  distanceKm: number;
  durationMinutes: number;
  steps: number;
  calories: number;
  caloriesBurned?: number; // alias
  earnedPoints: number;
  pointsEarned?: number; // alias
  pathPoints: WalkPathPoint[];
  geoPath?: Array<{ lat: number; lng: number }>; // 실제 GPS/지도 좌표 경로
  dogAccompaniedVerified?: boolean; // GPS 안심 목걸이를 통한 실제 반려견 동행 인증 여부
  paceNote: string;
  memo?: string;
}

// ==========================================
// 모으개 SHOP (온라인 반려동물 용품 쇼핑몰)
// ==========================================
export interface ShopProduct {
  id: string;
  name: string;
  category: '스마트 IoT' | '사료' | '간식' | '장난감' | '산책용품' | '위생용품';
  price: number;
  originalPrice: number;
  discountBadge?: string;
  image: string; // 이모지 또는 이미지 URL
  shortDesc: string;
  fullDesc: string;
  features: string[];
  options?: {
    name: string;
    choices: string[];
  }[];
  rating: number;
  reviewCount: number;
  isGpsCollar?: boolean; // GPS 스마트 목걸이 특화 플래그
}

export interface CartItem {
  id: string; // Cart line item unique id
  productId: string;
  product: ShopProduct;
  quantity: number;
  selectedOptions: Record<string, string>;
}

export interface ShopOrder {
  id: string;
  orderNumber: string;
  date: string;
  items: Array<{
    productId: string;
    productName: string;
    productImage: string;
    priceAtOrder: number;
    quantity: number;
    selectedOptions: Record<string, string>;
    isGpsCollar?: boolean;
  }>;
  totalGoodsPrice: number;
  shippingFee: number;
  pointsDiscount: number;
  finalPaidAmount: number;
  shippingAddress: {
    recipientName: string;
    phone: string;
    roadAddress: string;
    detailAddress: string;
    memo?: string;
  };
  status: '주문 완료' | '배송 준비중' | '배송중' | '배송 완료';
  courierName: string;
  trackingNumber: string;
  trackingHistory: Array<{
    date: string;
    time: string;
    status: string;
    location: string;
  }>;
}

export interface ProductReview {
  id: string;
  productId: string;
  authorName: string;
  authorPetBreed?: string;
  rating: number; // 1 ~ 5
  title: string;
  content: string;
  date: string;
  isVerifiedPurchase: boolean; // 실제 구매자 인증 표시
  isSampleData?: boolean; // 프로토타입 샘플 데이터 여부 표시
  selectedOptionsText?: string; // 구매 옵션 텍스트 (예: '사이즈: M / 컬러: 모으개 시그니처 오렌지')
  likesCount?: number;
}
