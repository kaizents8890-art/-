import {
  UserProfile,
  AttendanceDay,
  WalkTarget,
  AiWalkRecommendation,
  PointTransaction,
  MedicalGoal,
  CommunityPost,
  EmergencyGuide,
  Hospital,
  RewardItem,
  MedicalCheckupRecord,
  WalkRecord
} from '../types';

export const initialUserProfile: UserProfile = {
  id: 'user_001',
  guardianName: '김영석',
  guardianRegion: '서울특별시 마포구 연남동',
  guardianAge: 29,
  hasCohabitant: true,
  petName: '초코',
  petBreed: '토이푸들',
  petAge: 4,
  petWeight: 3.8,
  petGender: '수컷',
  neuteredStatus: '중성화 완료',
  petIsNeutered: true,
  hasCondition: '있음',
  conditionCategories: ['관절·근골격'],
  conditionDetail: '우측 뒷다리 슬개골 탈구 2기',
  medications: '글루코사민 & 초록입홍합 관절 영양제 (매일 아침 1회)',
  healthNotes: '미끄러운 바닥 및 계단 보행 시 주의 필요, 무리한 점프 금지',
  petCondition: '슬개골 탈구 2기 (우측 관절 관리 중)',
  regularCheckupRecord: '2024년 10월 연간 정기 종합검진 완료 (마포 센트럴)',
  profileImage: '🐶',
  avatarColor: '#f59e0b',
};

export const initialAttendanceDays: AttendanceDay[] = [
  { dayNumber: 1, dateStr: '10/20 (월)', isToday: false, isChecked: true, rewardPoints: 100 },
  { dayNumber: 2, dateStr: '10/21 (화)', isToday: false, isChecked: true, rewardPoints: 100 },
  { dayNumber: 3, dateStr: '10/22 (수)', isToday: false, isChecked: true, rewardPoints: 100 },
  { dayNumber: 4, dateStr: '10/23 (목)', isToday: false, isChecked: true, rewardPoints: 100 },
  { dayNumber: 5, dateStr: '10/24 (금)', isToday: false, isChecked: true, rewardPoints: 100 },
  { dayNumber: 6, dateStr: '10/25 (토)', isToday: false, isChecked: true, rewardPoints: 100 },
  { dayNumber: 7, dateStr: '10/26 (일)', isToday: true, isChecked: false, rewardPoints: 150 }, // Bonus today!
];

export const initialWalkTarget: WalkTarget = {
  weeklyGoalTimes: 5,
  weeklyGoalDistance: 14.0,
  currentWeekTimes: 4,
  currentWeekDistance: 10.6,
};

export const initialAiWalkRecommendation: AiWalkRecommendation = {
  recommendedDailyMinutes: 35,
  recommendedDailyKm: 2.2,
  recommendedPace: '완만한 평지 / 보통 걸음걸이',
  healthCautionNote: '토이푸들 특유의 슬개골 탈구 2기 관리 중이므로, 계단이나 가파른 언덕길을 피해 푹신한 잔디나 우레탄 트랙을 권장합니다.',
  dailyMaxPointLimit: 500,
  pointsPer100m: 15,
};

// 의료비 목표 목록 (다양한 구체적 목표 지원 및 진행 중/완료된 목표 구분)
export const initialMedicalGoals: MedicalGoal[] = [
  {
    id: 'goal_01',
    title: '응급진료비 대비',
    targetAmount: 300000,
    currentAmount: 138500,
    category: '응급진료비',
    isPrimary: true,
    description: '야간/휴일 급성 질환 및 관절 부상 시 즉시 사용할 수 있는 긴급 예비 자금',
    isCompleted: false,
  },
  {
    id: 'goal_02',
    title: '다음 달 건강검진',
    targetAmount: 150000,
    currentAmount: 135000,
    category: '정기검진',
    isPrimary: false,
    description: '기본 혈액검사(CBC), 흉부/복부 엑스레이, 관절 초음파 정기 검진 대비',
    isCompleted: false,
  },
  {
    id: 'goal_03',
    title: '정기 예방접종',
    targetAmount: 50000,
    currentAmount: 50000,
    category: '예방접종',
    isPrimary: false,
    description: 'DHPPL 종합백신 및 광견병 예방접종 1회 비용 전액 마련 완료',
    isCompleted: true,
    completedDate: '2026.10.15',
  },
  {
    id: 'goal_04',
    title: '수술비 마련',
    targetAmount: 800000,
    currentAmount: 240000,
    category: '수술비',
    isPrimary: false,
    description: '슬개골 탈구 3기 진행 예방 및 연골 재생 수술비용 장기 적립',
    isCompleted: false,
  },
  {
    id: 'goal_05',
    title: '슬개골 탈구 1기 정밀 검진비',
    targetAmount: 120000,
    currentAmount: 120000,
    category: '정기검진',
    isPrimary: false,
    description: '관절 초음파 및 방사선 정밀 판독 진료비 목표 달성 완료',
    isCompleted: true,
    completedDate: '2026.08.20',
  },
];

export const initialTransactions: PointTransaction[] = [
  {
    id: 'tx_01',
    type: 'earn',
    title: '연남 경의선 숲길 주말 산책 완료',
    category: '산책',
    amount: 320,
    date: '2026.10.25 17:45',
    detail: '2.1km 산책 (AI 맞춤 적립)',
    balanceAfter: 138500,
    relatedSource: '산책 미션 2.15km 완주',
  },
  {
    id: 'tx_02',
    type: 'earn',
    title: '일일 출석체크 미션 완료',
    category: '출석체크',
    amount: 150,
    date: '2026.10.25 09:12',
    detail: '연속 출석 달성 리워드',
    balanceAfter: 138180,
    relatedSource: '출석체크 미션 (+150P)',
  },
  {
    id: 'tx_03',
    type: 'use',
    title: '24시 마포 센트럴 동물의료원 진료비 할인권',
    category: '병원비할인',
    amount: -30000,
    date: '2026.10.20 14:30',
    detail: '정기 검진 바우처 교환',
    balanceAfter: 138030,
    relatedSource: '제휴 병원 진료비 30,000원 바우처 발급',
  },
  {
    id: 'tx_04',
    type: 'earn',
    title: '반려동물 정기검진 결과 등록 축하금',
    category: '보너스',
    amount: 2000,
    date: '2026.10.18 18:20',
    detail: '제휴 동물병원 EMR 전산 연동 공인 기록',
    balanceAfter: 168030,
    relatedSource: '정기 종합검진 EMR 기록 자동 등록 리워드',
  },
  {
    id: 'tx_05',
    type: 'earn',
    title: '저녁 가벼운 산책 완료',
    category: '산책',
    amount: 270,
    date: '2026.10.16 20:10',
    detail: '1.85km 산책 완주',
    balanceAfter: 166030,
    relatedSource: '산책 미션 1.85km 완주',
  },
  {
    id: 'tx_06',
    type: 'use',
    title: '모으개 SHOP 상품 결제 (스마트 GPS 목걸이 등)',
    category: '용품교환',
    amount: -39000,
    date: '2026.10.05 11:20',
    detail: '주문번호: MGG-20261005-9214',
    balanceAfter: 165760,
    relatedSource: '모으개 SHOP 주문 결제 (MGG-20261005-9214)',
  },
  {
    id: 'tx_07',
    type: 'earn',
    title: '신규 회원가입 축하 포인트',
    category: '보너스',
    amount: 2000,
    date: '2026.09.28 10:00',
    detail: '신규 회원 맞춤 케어 프로필 등록 축하 리워드',
    balanceAfter: 204760,
    relatedSource: '회원가입 축하 이벤트 (+2,000P)',
  },
];

export const initialCommunityPosts: CommunityPost[] = [
  {
    id: 'post_01',
    category: '건강관리 및 예방',
    title: '슬개골 탈구 2기 진단 후 1년째 3기 진행 막은 5가지 관리법 공유',
    content: `저희 아이(토이푸들 4세)가 작년에 슬개골 2기 판정을 받고 정말 눈앞이 캄캄했는데요.
수의사 선생님과 상담하며 1년간 지킨 루틴입니다:
1. 거실 전체 논슬립 디팡 매트 시공 (미끄러짐 90% 차단)
2. 소파와 침대에는 반드시 완만한 경사로(램프) 설치
3. 뒷다리 허벅지 근육 강화를 위해 하루 30분씩 평지 산책 (모으개 앱 AI 산책량 추천 따름)
4. 관절 영양제(글루코사민, 초록입홍합) 아침마다 급여
5. 체중 0.2kg 단위로 철저히 감량 유지

지난주 정기검진 때 수의사님께서 2기 상태가 아주 단단하게 안정되어 수술 없이 잘 유지되고 있다고 칭찬해주셨어요! 모두 힘내세요.`,
    author: '연남동초코맘',
    authorPetBreed: '토이푸들 4세',
    date: '2일 전',
    likes: 84,
    commentsCount: 16,
    views: 432,
    tags: ['슬개골관리', '관절건강', '토이푸들', '생활꿀팁'],
    comments: [
      { id: 'c1', author: '몽이아빠', content: '경사로 각도가 궁금해요! 혹시 몇 도 정도가 좋은가요?', date: '1일 전' },
      { id: 'c2', author: '연남동초코맘', content: '20도 이하의 완만한 각도가 관절에 무리가 없다고 하셔서 높낮이 조절형 램프 사용 중이에요!', date: '1일 전' },
    ],
  },
  {
    id: 'post_02',
    category: '예방접종·검진',
    title: '성견(4~7세) 주기별 필수 정기검진 항목 및 검사 팁 총정리',
    content: `나이가 4세를 넘어가면 사람의 30대 중반에 해당합니다. 
외관상 건강해 보여도 1년에 한 번 정기검진은 필수예요.
- 기본 혈액검사 (CBC + 생화학 10종 이상)
- 디지털 엑스레이 (흉부, 복부, 관절)
- 복부 정밀 초음파
- 뇨검사 및 SDMA (초기 신장 손상 조기 발견)

모으개 앱에서 미리 검진 목표 포인트 모아서 제휴 병원 바우처 쓰니 5만원 이상 아꼈네요.`,
    author: '닥터수의학칼럼',
    authorPetBreed: '수의학 전문 보호자',
    date: '3일 전',
    likes: 128,
    commentsCount: 22,
    views: 890,
    tags: ['정기검진', '건강검진주기', '예방접종', '의료비절약'],
  },
  {
    id: 'post_03',
    category: '제품 후기',
    title: '관절 보호에 도움된 충격흡수 3D 하네스 + 발바닥 왁스 내돈내산 3개월 후기',
    content: `목줄은 기도와 경추에 압박을 줘서 Y자형 충격흡수 하네스로 바꿨는데, 
산책 시 당김이 심한 날에도 앞다리와 어깨에 충격이 분산되어 산책 후 다리를 절뚝거리는 일이 싹 사라졌습니다!
발바닥 패드가 건조하면 산책 후 미끄러지기 쉬워서 보습 왁스도 함께 발라주고 있어요.`,
    author: '망원동보리',
    authorPetBreed: '말티즈 3세',
    date: '5일 전',
    likes: 47,
    commentsCount: 8,
    views: 310,
    tags: ['하네스추천', '산책용품', '발바닥보호', '솔직후기'],
  },
];

export const initialEmergencyGuides: EmergencyGuide[] = [
  {
    id: 'emg_01',
    title: '이물질/초콜릿/포도/양파 급성 섭취 응급 대처',
    category: '응급처치 및 금지 행동',
    urgencyLevel: '즉시 병원 내원',
    summary: '독성 물질(초콜릿, 자일리톨, 포도, 양파) 또는 날카로운 이물질 섭취 시 과산화수소 자가 구토 유발은 식도 천공과 흡인성 폐렴 위험으로 절대 금기입니다.',
    doList: [
      '남아있는 잔여 물질이나 포장지, 섭취량, 섭취 시간을 즉시 메모/확보하세요.',
      '섭취 후 2시간 이내라면 수의사가 안전하게 최토제를 투여하여 제거할 수 있습니다.',
      '입안에 걸려있는 이물질이 육안으로 보이고 물리지 않을 안전한 상태에서만 조심스럽게 꺼내세요.',
      '즉시 24시 응급 동물병원에 연락하여 이동 시간을 알리고 준비를 요청하세요.',
    ],
    dontList: [
      '절대 과산화수소나 소금물 등을 강제로 먹여 구토를 유도하지 마세요.',
      '화학물질이나 배터리, 뾰족한 뼈를 삼켰을 때 억지로 토하게 하면 식도가 파열될 수 있습니다.',
      '우유나 물을 다량 먹이지 마세요 (체내 흡수를 오히려 촉진할 수 있습니다).',
    ],
    preparationNotes: [
      '섭취한 초콜릿의 카카오 함량(%) 표기 또는 포장지 지참',
      '섭취 추정 시간 및 아이의 현재 체중',
      '구토 및 침흘림 증상 발생 여부 확인',
    ],
    applicableSymptoms: ['구토', '과도한 침흘림', '호흡곤란', '복부팽만'],
  },
  {
    id: 'emg_02',
    title: '갑작스러운 경련, 발작 및 실신 증상',
    category: '증상별 응급 대처법',
    urgencyLevel: '응급 처치 후 내원',
    summary: '아이가 쓰러져 사지를 떨거나 눈이 풀리는 발작을 일으킬 때는 손을 입에 넣지 말고 주변 위험물을 치우고 조용히 동영상을 촬영하세요.',
    doList: [
      '아이가 부딪혀 다치지 않도록 주변의 모서리, 가구, 낙하 위험물을 즉시 치우세요.',
      '실내 조명을 어둡게 하고 TV 소리를 꺼서 자극을 최소화하세요.',
      '발작 시작 시각과 지속 시간을 정확히 기록하고, 스마트폰으로 전신 영상을 촬영하세요 (수의사 진단에 결정적).',
      '발작이 5분 이상 지속(중첩 발작)되거나 의식이 돌아오지 않으면 즉시 응급 이송하세요.',
    ],
    dontList: [
      '혀를 물까 봐 입안에 손가락이나 숟가락을 절대 넣지 마세요 (심각한 물림 사고 위험).',
      '아이를 억지로 붙잡거나 흔들어 깨우려 하지 마세요.',
      '발작 직후 의식이 흐릴 때 물이나 약을 먹이지 마세요 (기도 흡인 위험).',
    ],
    preparationNotes: [
      '발작 동영상 필수 지참 (손 떨림, 안구 떨림 등)',
      '발작 지속 시간 (초/분 단위)',
      '최근 복용한 약물이나 바른 외부구충제 내역',
    ],
    applicableSymptoms: ['사지떨림', '거품', '의식소실', '안구진탕'],
  },
  {
    id: 'emg_03',
    title: '응급 동물병원 출발 전 필수 준비사항 가이드',
    category: '병원 방문 전 준비사항',
    urgencyLevel: '상태 관찰',
    summary: '긴급 이송 시 골든타임을 확보하고 2차 부상을 막기 위한 이동 및 서류 준비 팁입니다.',
    doList: [
      '병원에 미리 전화를 걸어 "환견 나이, 증상, 예상 도착 시간"을 사전에 전달하여 ICU/산소방을 대기시키세요.',
      '골절이나 척추 손상이 의심될 때는 딱딱한 보드나 두꺼운 담요 위에 평평하게 눕혀 이동하세요.',
      '토사물, 혈변, 배설물이 있다면 비닐백에 밀봉해 수의사에게 직접 보여주세요.',
      '체온 저하를 막기 위해 담요로 부드럽게 감싸주세요 (열사병인 경우는 미온수 타월 적용).',
    ],
    dontList: [
      '출발 전 사람용 소염진통제(타이레놀, 아스피린 등)는 반려견에게 치명적인 독성이므로 절대 먹이지 마세요.',
      '안전벨트나 이동장 없이 조수석에 방치한 채 급운전하지 마세요.',
    ],
    preparationNotes: [
      '반려동물 등록번호 또는 모으개 건강기록 화면',
      '기존 복용 약물 처방전',
      '최근 백신 접종 내역',
    ],
    applicableSymptoms: ['이송준비', '골든타임확보', '사전통화', '체온유지'],
  },
];

export const initialHospitals: Hospital[] = [
  {
    id: 'hosp_01',
    name: '24시 마포 센트럴 동물의료원',
    isEmergency24h: true,
    distanceKm: 0.4,
    address: '서울특별시 마포구 월드컵북로 42 (연남동 입구)',
    phone: '02-334-7582',
    rating: 4.9,
    reviewCount: 348,
    openingHours: '24시간 연중무휴 (응급실 상시 운영)',
    departments: ['24시 응급의학과', '정형외과 관절센터', '심장내과', '안과 정밀'],
    facilities: ['지하 주차장(발렛 가능)', 'ICU 중환자실', '격리 입원실', '디지털 CT/초음파'],
    pointDiscountRate: '모으개 포인트 최대 30% 현장 즉시 할인',
    reviews: [
      {
        id: 'rv_01',
        author: '초코누나',
        petBreed: '토이푸들',
        rating: 5,
        content: '밤 11시에 슬개골 다리를 삐끗해서 급하게 내원했는데 당직 원장님께서 정말 꼼꼼하게 봐주셨어요. 모으개 바우처 3만원도 현장에서 바로 차감 적용되었습니다.',
        date: '2026.10.12',
        visitedFor: '야간 응급 진료',
      },
      {
        id: 'rv_02',
        author: '구름이아빠',
        petBreed: '비숑',
        rating: 5,
        content: '과잉진료 전혀 없고 꼭 필요한 엑스레이와 처방만 권해주셔서 안심하고 다닙니다. 시설도 최신식이에요.',
        date: '2026.10.05',
        visitedFor: '정기 검진',
      },
    ],
  },
  {
    id: 'hosp_02',
    name: '연남 바른 동물병원',
    isEmergency24h: false,
    distanceKm: 0.8,
    address: '서울특별시 마포구 동교로 210 2층',
    phone: '02-325-1175',
    rating: 4.8,
    reviewCount: 192,
    openingHours: '09:30 - 20:00 (일요일 18:00 마감)',
    departments: ['일반내과', '치과 스케일링', '피부/알레르기 클리닉', '건강검진센터'],
    facilities: ['무료 주차', '고양이 전용 대기실', '반려견 놀이방'],
    pointDiscountRate: '모으개 포인트 최대 25% 사용 가능',
    reviews: [
      {
        id: 'rv_03',
        author: '두부맘',
        petBreed: '말티즈',
        rating: 5,
        content: '선생님이 아이를 너무 예뻐해주시고 설명도 20분 넘게 자세히 해주세요.',
        date: '2026.09.28',
        visitedFor: '피부염 진료',
      },
    ],
  },
  {
    id: 'hosp_03',
    name: '신촌 24시 스마트 동물의료센터',
    isEmergency24h: true,
    distanceKm: 1.5,
    address: '서울특별시 서대문구 신촌로 87',
    phone: '02-393-8275',
    rating: 4.7,
    reviewCount: 420,
    openingHours: '24시간 연중무휴 (야간 할증 없음)',
    departments: ['외과 수술 전문', '24시 중환자 케어', '영상진단센터(MRI/CT)'],
    facilities: ['대형 주차장', '고압 산소 치료실', '전문 간호 인력 24시 상주'],
    pointDiscountRate: '모으개 포인트 종합검진 5만원권 제휴',
    reviews: [
      {
        id: 'rv_04',
        author: '루이보호자',
        petBreed: '포메라니안',
        rating: 4.8,
        content: '주말 새벽에 구토 증상으로 달려갔는데 산소방에서 빠른 처치로 살려주셨습니다. 감사드립니다.',
        date: '2026.10.01',
        visitedFor: '응급 처치',
      },
    ],
  },
  {
    id: 'hosp_04',
    name: '홍대 웰니스 펫 클리닉',
    isEmergency24h: false,
    distanceKm: 1.1,
    address: '서울특별시 마포구 와우산로 112',
    phone: '02-338-0099',
    rating: 4.9,
    reviewCount: 145,
    openingHours: '10:00 - 19:30 (수요일 휴무)',
    departments: ['예방의학', '한방/침 치료 및 재활', '노령견 맞춤 검진'],
    facilities: ['수중 러닝머신', '레이저 통증 치료기'],
    pointDiscountRate: '모으개 재활/관절 포인트 20% 우대',
    reviews: [
      {
        id: 'rv_05',
        author: '초코사랑',
        petBreed: '푸들',
        rating: 5,
        content: '슬개골 때문에 레이저 물리치료 받고 있는데 걸음걸이가 확실히 부드러워졌어요.',
        date: '2026.09.15',
        visitedFor: '관절 물리치료',
      },
    ],
  },
];

// 포인트 교환 및 제휴 혜택 데이터 (병원 진료 및 용품 상세 분리)
export const initialRewardItems: RewardItem[] = [
  // 1. 동물병원 진료 혜택 - 정기 종합검진 지원
  {
    id: 'rew_02',
    category: '병원비·검진',
    subCategory: '종합검진지원',
    name: '정기 종합건강검진 50,000원 특별 지원권',
    brandName: '모으개 제휴 메디컬 케어',
    provider: '모으개 종합 건강검진 센터 연합',
    requiredPoints: 45000,
    originalPrice: 50000,
    discountBadge: '10% 보너스',
    description: '혈액검사, 흉복부 디지털 엑스레이, 복부 초음파 등 연간 필수 종합검진 패키지 결제 시 50,000원 즉시 지원 혜택을 제공합니다.',
    terms: '유효기간 발급일로부터 180일 / 1일 전 전화 예약 필수',
    image: '🩺',
    availableHospitals: [
      '24시 마포 센트럴 동물의료원 (마포구)',
      '신촌 24시 스마트 동물의료센터 (서대문구)',
      '연남 바른 동물병원 (마포구)',
      '홍대 웰니스 펫 클리닉 (마포구)'
    ],
    coverageScope: '기본 혈액검사(CBC), 흉부/복부 엑스레이 4컷, 복부 초음파, 뇨비중 검사 비용에 직접 차감 적용',
    usageConditions: [
      '전국 모으개 제휴 동물병원 내원 시 모바일 바우처 제시',
      '다른 진료 항목(약제비, 추가 처치)과 분리 결제 가능',
      '1회 검진 시 바우처 1매 사용 가능 (동일 환견 한정)'
    ],
  },
  // 2. 동물병원 진료 혜택 - 예방접종 혜택
  {
    id: 'rew_03',
    category: '병원비·검진',
    subCategory: '예방접종지원',
    name: '연간 필수 예방접종 1회 지원권 (광견병/종합백신)',
    brandName: '모으개 백신 안심 케어',
    provider: '모으개 제휴 예방접종 클리닉',
    requiredPoints: 18000,
    originalPrice: 25000,
    discountBadge: '28% 절약',
    description: 'DHPPL 종합 5종 백신 또는 광견병 백신 1회 접종비를 전액 지원하여 감염병을 사전에 예방합니다.',
    terms: '유효기간 발급일로부터 1년 / 접종 전 기초 신체검사 포함',
    image: '💉',
    availableHospitals: [
      '연남 바른 동물병원 (마포구)',
      '24시 마포 센트럴 동물의료원 (마포구)',
      '홍대 웰니스 펫 클리닉 (마포구)'
    ],
    coverageScope: 'DHPPL 5종 종합백신 또는 사독 광견병 백신 접종비 및 기초 바이탈 체크 비용 포함',
    usageConditions: [
      '예방접종 전 체온 및 청진 기본 건강 체크 무료 제공',
      '접종 수첩 또는 모으개 건강기록부 자동 연동 기록',
      '기타 구충제(심장사상충, 외부구충)와 병용 접종 가능'
    ],
  },
  // 3. 동물병원 진료 혜택 - 일반 진료비 할인 바우처
  {
    id: 'rew_01',
    category: '병원비·검진',
    subCategory: '진료비바우처',
    name: '제휴 동물병원 진료비 30,000원 할인 바우처',
    brandName: '모으개 의료비 지원',
    provider: '모으개 제휴 24시 응급 & 일반 병원 전 지점',
    requiredPoints: 28000,
    originalPrice: 30000,
    discountBadge: '인기 1위',
    description: '전국 모으개 제휴 동물병원에서 일반 진료비, 약제비, 외상 및 내과 처치비 결제 시 현금처럼 차감 적용됩니다.',
    terms: '유효기간 발급일로부터 90일 / 타 할인 쿠폰과 중복 적용 가능',
    image: '🏥',
    availableHospitals: [
      '24시 마포 센트럴 동물의료원',
      '신촌 24시 스마트 동물의료센터',
      '연남 바른 동물병원',
      '홍대 웰니스 펫 클리닉'
    ],
    coverageScope: '초진/재진료, 내과 약 처방, 드레싱 및 상처 소독, 방사선 촬영비 등 병원 진료비 전반',
    usageConditions: [
      '결제 시 모으개 앱 마이페이지 바우처 코드 제시',
      '최소 결제금액 제한 없음 (잔액 환불 불가, 전액 소진)',
      '야간 응급 진료 시에도 할증 구분 없이 동일 액면가 차감'
    ],
  },
  // 4. 반려동물 용품 할인 - 관절 보호 매트
  {
    id: 'rew_05',
    category: '반려용품',
    subCategory: '관절보호',
    name: '디팡 프리미엄 논슬립 폴딩 관절 보호 매트 (2단)',
    brandName: '디팡 (Dfang)',
    provider: '디팡 공식 플래그십 스토어',
    requiredPoints: 35000,
    originalPrice: 48000,
    discountBadge: '필수템 27%↓',
    description: '미끄러짐을 90% 이상 방지하는 특수 엠보싱 표면과 14mm 고밀도 폼으로 슬개골 탈구 충격을 효과적으로 흡수합니다.',
    terms: '무료 배송 / 생활 방수 및 99.9% 항균 처리 완료',
    image: '🛋️',
    usageConditions: [
      '모으개 포인트로 전액 결제 또는 포인트 차감 쿠폰 발급',
      '주문 시 1~2일 내 로켓 출고',
      '사이즈: 140 x 100 x 1.4 cm (폴딩형)'
    ],
    externalUrl: 'https://smartstore.naver.com/dfang',
  },
  // 5. 반려동물 용품 할인 - 수의사 처방 관절 영양제
  {
    id: 'rew_04',
    category: '반려용품',
    subCategory: '영양관리',
    name: '닥터힐메딕스 조인트 케어 슬개골/관절 영양제 (60정)',
    brandName: '닥터힐메딕스 (Dr. Healmedix)',
    provider: '수의사 처방 전문 뉴트리션',
    requiredPoints: 22000,
    originalPrice: 32000,
    discountBadge: '수의사 추천 31%↓',
    description: '뉴질랜드산 순수 초록입홍합 추출물과 글루코사민, MSM, 보스웰리아가 고농축 배합된 관절 영양제입니다.',
    terms: '무료 배송 / 기호성 높은 츄어블 큐브 타입',
    image: '💊',
    usageConditions: [
      '유통기한 최소 18개월 이상 잔여 상품 출고',
      '체중 5kg 미만 1일 1정 급여 권장',
      '포인트 교환 시 본사 정품 인증 보증서 동봉'
    ],
    externalUrl: 'https://www.drhealmedix.com',
  },
  // 6. 반려동물 용품 할인 - 충격흡수 안전 하네스
  {
    id: 'rew_06',
    category: '반려용품',
    subCategory: '위생/산책',
    name: '에르고 라이트 무압박 Y형 관절 보호 안전 하네스',
    brandName: '바른산책 연구소',
    provider: '바른산책 인체공학 펫웨어',
    requiredPoints: 19000,
    originalPrice: 28000,
    discountBadge: '산책 필수 32%↓',
    description: '기도와 경추 압박이 전혀 없고 앞다리 관절 가동 범위를 제한하지 않는 인체공학적 3D 충격 분산 하네스입니다.',
    terms: '사이즈(S/M/L) 및 색상 선택 가능 / 3M 반사 스티치',
    image: '🦮',
    usageConditions: [
      '교환 신청 후 옵션(체형/가슴둘레) 맞춤 발송',
      '전용 리드줄 연결 D링 2개(가슴/등) 기본 탑재',
      '7일 이내 무상 사이즈 교환 지원'
    ],
    externalUrl: 'https://barunwalk.kr',
  },
];

// 보호자 확인 가능한 제휴 병원 검진·예방접종 기록 목록 (병원 EMR 전산 공인 등록)
export const initialMedicalCheckupRecords: MedicalCheckupRecord[] = [
  {
    id: 'rec_01',
    date: '2026.10.12',
    hospitalName: '24시 마포 센트럴 동물의료원',
    checkupType: '정기 종합건강검진',
    doctorOpinion: '우측 슬개골 탈구 2기 소견이 지난 검진 대비 악화되지 않고 안정적으로 유지되고 있습니다. 평지 산책 루틴과 체중 관리가 매우 효과적입니다.',
    findings: [
      '슬개골 탈구 2기 유지 (우측 관절 인대 양호)',
      '혈액 검사(CBC, 신장, 간수치) 정상 범위 내 양호',
      '치아 치석 1단계 (양치질 관리 지속 권고)',
      '체중 3.8kg (적정 체중 범위 유지 중)',
    ],
    memo: '원장님께서 슬개골 근육이 작년보다 단단해졌다고 칭찬하심. 다음 검진은 6개월 뒤!',
    totalCost: 280000,
    pointDiscountApplied: 50000,
    actualPaid: 230000,
    nextCheckupDate: '2027.04.15 (봄철 정기 접종 및 관절 재평가)',
  },
  {
    id: 'rec_02',
    date: '2026.08.15',
    hospitalName: '24시 마포 센트럴 동물의료원',
    checkupType: '예방접종 & 슬개골 정밀 검사',
    doctorOpinion: '종합백신 항체 역가 충분함. 관절 부종 없으며 활력 매우 우수함.',
    findings: [
      '항체가 검사: 파보 5단계, 홍역 5단계 (충분)',
      '슬개골 2기 판정 및 체중 감량 플랜 순항',
      '심장사상충 키트 음성 (정상)',
    ],
    memo: '광견병 백신 접종 완료. 산책 후 발바닥 패드 보습 신경 쓸 것.',
    totalCost: 145000,
    pointDiscountApplied: 30000,
    actualPaid: 115000,
    nextCheckupDate: '2026.10.12',
  },
  {
    id: 'rec_03',
    date: '2026.05.20',
    hospitalName: '신촌 24시 스마트 동물의료센터',
    checkupType: '관절 초음파 및 춘계 종합검진',
    doctorOpinion: '슬개골 탈구 진행 억제를 위한 연골 영양제 급여가 확인되며, 파행(절뚝거림) 증상 없습니다.',
    findings: [
      '관절 낭액 정상, 골극 형성 없음',
      '심장 청진: 심잡음 없음 (정상)',
      '체온 38.4도 안정적',
    ],
    memo: '여름철 야외 산책 시 아스팔트 화상 주의 안내 받음.',
    totalCost: 220000,
    pointDiscountApplied: 40000,
    actualPaid: 180000,
    nextCheckupDate: '2026.08.15',
  },
  {
    id: 'rec_04',
    date: '2025.11.18',
    hospitalName: '홍대 웰니스 펫 클리닉',
    checkupType: '동계 구충 및 기본 신체검사',
    doctorOpinion: '구강 및 피부 알러지 반응 없음. 귀 내부 청결 상태 양호.',
    findings: [
      '체중 3.9kg',
      '외부기생충 예방제 도포 완료',
    ],
    memo: '겨울철 실내 보온 및 미끄럼 방지 매트 시공 유지 권고.',
    totalCost: 65000,
    pointDiscountApplied: 15000,
    actualPaid: 50000,
    nextCheckupDate: '2026.05.20',
  },
];

// 산책 완료 기록 및 지도 경로 히스토리
export const initialWalkRecords: WalkRecord[] = [
  {
    id: 'walk_01',
    date: '2026.10.25 17:15',
    courseName: '연남 경의선 숲길 평지 산책 코스',
    distanceKm: 2.15,
    durationMinutes: 34,
    steps: 3240,
    calories: 142,
    earnedPoints: 320,
    dogAccompaniedVerified: true,
    paceNote: '완만한 평지 / 관절 친화 우레탄길',
    memo: '초코가 다리 저는 기색 없이 신나게 냄새 맡고 완주함. 가을바람 솔솔.',
    pathPoints: [
      { x: 12, y: 75, timeSec: 0 },
      { x: 22, y: 55, timeSec: 360 },
      { x: 38, y: 45, timeSec: 720 },
      { x: 54, y: 62, timeSec: 1080 },
      { x: 70, y: 35, timeSec: 1440 },
      { x: 86, y: 48, timeSec: 1800 },
      { x: 92, y: 28, timeSec: 2040 },
    ],
  },
  {
    id: 'walk_02',
    date: '2026.10.24 16:30',
    courseName: '홍제천 인공폭포 평지 잔디 산책로',
    distanceKm: 1.85,
    durationMinutes: 28,
    steps: 2780,
    calories: 120,
    earnedPoints: 270,
    dogAccompaniedVerified: true,
    paceNote: '부드러운 잔디 위주 / 슬개골 충격 최소화',
    memo: '강아지 친구들 3마리 만나서 인사함. 무리하지 않고 28분 만에 귀가.',
    pathPoints: [
      { x: 15, y: 80, timeSec: 0 },
      { x: 30, y: 68, timeSec: 300 },
      { x: 45, y: 72, timeSec: 600 },
      { x: 60, y: 50, timeSec: 900 },
      { x: 78, y: 55, timeSec: 1200 },
      { x: 88, y: 40, timeSec: 1680 },
    ],
  },
  {
    id: 'walk_03',
    date: '2026.09.20 19:10',
    courseName: '동교동 가로수길 야간 안심 산책',
    distanceKm: 1.40,
    durationMinutes: 22,
    steps: 2100,
    calories: 92,
    earnedPoints: 210,
    dogAccompaniedVerified: true,
    paceNote: '안전한 가로등 보행로',
    memo: '야간 반사 하네스 착용하고 가볍게 저녁 배변 산책 완료.',
    pathPoints: [
      { x: 20, y: 85, timeSec: 0 },
      { x: 35, y: 70, timeSec: 300 },
      { x: 50, y: 58, timeSec: 600 },
      { x: 68, y: 45, timeSec: 900 },
      { x: 82, y: 30, timeSec: 1320 },
    ],
  },
  {
    id: 'walk_04',
    date: '2026.06.18 18:00',
    courseName: '월드컵공원 평화의공원 호수 둘레길',
    distanceKm: 2.40,
    durationMinutes: 38,
    steps: 3600,
    calories: 158,
    earnedPoints: 350,
    dogAccompaniedVerified: true,
    paceNote: '호숫가 그늘 평지 코스',
    memo: '시원한 호수 바람 쐬며 여유롭게 노즈워크.',
    pathPoints: [
      { x: 10, y: 60, timeSec: 0 },
      { x: 30, y: 40, timeSec: 400 },
      { x: 55, y: 50, timeSec: 800 },
      { x: 75, y: 35, timeSec: 1200 },
      { x: 90, y: 65, timeSec: 1600 },
    ],
  },
  {
    id: 'walk_05',
    date: '2025.12.14 16:30',
    courseName: '망원 한강공원 잔디 둘레길',
    distanceKm: 1.60,
    durationMinutes: 25,
    steps: 2400,
    calories: 105,
    earnedPoints: 240,
    dogAccompaniedVerified: true,
    paceNote: '초겨울 방한 패딩 착용 산책',
    memo: '추운 날씨라 25분 단시간 산책으로 관절 보호.',
    pathPoints: [
      { x: 18, y: 80, timeSec: 0 },
      { x: 35, y: 65, timeSec: 350 },
      { x: 55, y: 70, timeSec: 700 },
      { x: 75, y: 50, timeSec: 1050 },
    ],
  },
];

export interface AdminUserRecord {
  id: string;
  name: string;
  region: string;
  petBreed: string;
  petCondition: string;
  points: number;
  walkCountWeek: number;
  lastActive: string;
  status: '정상' | '모니터링';
}

export const initialAdminUsers: AdminUserRecord[] = [
  {
    id: 'u_100',
    name: '김영석 (보호자)',
    region: '서울 마포구 연남동',
    petBreed: '토이푸들 4세 (초코)',
    petCondition: '슬개골 탈구 2기',
    points: 138500,
    walkCountWeek: 4,
    lastActive: '방금 전',
    status: '정상',
  },
  {
    id: 'u_101',
    name: '김민서',
    region: '서울 마포구',
    petBreed: '포메라니안 3세 (퐁이)',
    petCondition: '슬개골 탈구 1기',
    points: 92000,
    walkCountWeek: 3,
    lastActive: '15분 전',
    status: '정상',
  },
  {
    id: 'u_102',
    name: '이수진',
    region: '서울 서대문구',
    petBreed: '말티즈 3세 (보리)',
    petCondition: '알레르기 피부염',
    points: 84200,
    walkCountWeek: 5,
    lastActive: '30분 전',
    status: '정상',
  },
  {
    id: 'u_103',
    name: '박도현',
    region: '서울 영등포구',
    petBreed: '골든리트리버 2세 (맥스)',
    petCondition: '고관절 이형성 주의',
    points: 215000,
    walkCountWeek: 6,
    lastActive: '2시간 전',
    status: '정상',
  },
  {
    id: 'u_104',
    name: '최예원',
    region: '경기 고양시',
    petBreed: '비숑프리제 5세 (구름)',
    petCondition: '특이질환 없음',
    points: 52300,
    walkCountWeek: 3,
    lastActive: '1일 전',
    status: '정상',
  },
];
