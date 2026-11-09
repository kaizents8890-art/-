import { ShopProduct, ShopOrder, ProductReview } from '../types';

export const initialShopProducts: ShopProduct[] = [
  // 1. [KEY PRODUCT] 모으개 스마트 GPS 안심 산책 목걸이
  {
    id: 'shop_gps_01',
    name: '모으개 스마트 GPS 안심 산책 목걸이',
    category: '스마트 IoT',
    isGpsCollar: true,
    price: 39000,
    originalPrice: 49000,
    discountBadge: '20% OFF',
    image: '/assets/brand/gps_collar_photo.png',
    shortDesc: '산책 미션 중 반려동물의 실제 동행 여부를 실시간 확인하고 부정행위를 방지하는 공식 스마트 목걸이',
    fullDesc: `모으개 스마트 GPS 안심 산책 목걸이는 산책 미션 수행 시 반려견이 실제로 보호자와 함께 동행하고 있는지를 실시간 블루투스 BLE & GPS 듀얼 비콘으로 정밀 검증하는 모으개 공식 인증 스마트 디바이스입니다.

스마트 모션 센서가 반려견 고유의 4족 보행 패턴과 활동량을 측정하여 스마트폰 단독 휴대 등 부정 적립을 원천 방지합니다. 
착용 시 산책 미션 포인트 10% 추가 적립 보너스가 제공되며, 야간 산책 시 자동으로 켜지는 안전 고휘도 LED와 IP68 완전 방진·방수를 지원합니다.`,
    features: [
      '모으개 산책 미션 반려견 실제 동행 실시간 인증 (부정행위 원천 방지)',
      '22g 초경량 콤팩트 설계 (슬개골·경추 부담 없는 편안한 착용감)',
      'IP68 최고 등급 방진·방수 (우천 산책 및 진흙길도 안심)',
      '스마트 가속도 센서 기반 반려견 보행/활동량 정밀 측정',
      '야간 보행 안전 고휘도 7색 스마트 LED 탑재 (가시거리 50m)',
      '저전력 고효율 배터리 (1회 USB-C 완충으로 최대 14일 연속 작동)',
      '모으개 앱과 블루투스 5.3 근거리 자동 원터치 페어링'
    ],
    options: [
      {
        name: '사이즈 선택',
        choices: [
          'S (목둘레 20~28cm / 5kg 미만 소형견)',
          'M (목둘레 27~38cm / 5~15kg 중형견)',
          'L (목둘레 36~52cm / 15kg 이상 대형견)'
        ]
      },
      {
        name: '스트랩 컬러',
        choices: ['모으개 시그니처 오렌지', '포레스트 그린', '모던 차콜']
      }
    ],
    rating: 4.9,
    reviewCount: 384,
  },
  // 2. 산책용품 - 관절 보호 3D 하네스
  {
    id: 'shop_walk_01',
    name: '모으개 인체공학 관절 안심 3D 충격흡수 Y형 하네스',
    category: '산책용품',
    price: 26000,
    originalPrice: 35000,
    discountBadge: '25% OFF',
    image: '🦮',
    shortDesc: '기도 압박을 배제하고 앞다리 관절 가동 범위를 보호하는 인체공학적 무압박 충격 분산 하네스',
    fullDesc: `산책 시 갑작스러운 당김에도 경추와 기도에 압박을 가하지 않는 Y자 구조 설계 하네스입니다.
가슴과 등 부위에 3D 에어메쉬 충격 흡수 패드가 장착되어 슬개골 탈구 및 어깨 관절 부담을 최소화합니다.`,
    features: [
      '기도/경추 무압박 인체공학 Y자 3D 설계',
      '충격 분산 3D 에어메쉬 패딩 & 통기성 원단',
      '3M 리플렉티브 고반사 야간 안전 스티치',
      '앞섬 방지 듀얼 D링(가슴/등) 장착'
    ],
    options: [
      { name: '사이즈', choices: ['S (가슴둘레 35~45cm)', 'M (가슴둘레 44~58cm)', 'L (가슴둘레 56~72cm)'] },
      { name: '컬러', choices: ['웜 오렌지', '세이지 그린', '소프트 베이지'] }
    ],
    rating: 4.8,
    reviewCount: 215,
  },
  // 3. 사료 - 슬개골 관절 & 소화 맞춤 처방 사료
  {
    id: 'shop_food_01',
    name: '그레인프리 조인트 & 다이제스트 기능성 맞춤 사료 (1.5kg)',
    category: '사료',
    price: 24000,
    originalPrice: 30000,
    discountBadge: '20% OFF',
    image: '🥣',
    shortDesc: '가수분해 연어 단백질과 글루코사민, 프로바이오틱스를 배합한 알러지 및 관절 복합 사료',
    fullDesc: `육류 알러지가 있거나 관절 관리가 필요한 반려견을 위한 수의영양학 맞춤 처방식입니다.
곡물을 배제한 그레인프리 레시피로 소화 흡수율을 극대화하고 변 냄새를 감소시킵니다.`,
    features: [
      '초록입홍합 & 글루코사민 500mg/kg 함유',
      '알러지 저감 단일 가수분해 연어 단백질원',
      '장 건강을 위한 생유산균 10억 CFU 투입',
      '인공 향료 및 보존제 무첨가 안심 처방'
    ],
    options: [
      { name: '키블 크기', choices: ['소형견용 스몰바이트 (7mm)', '중형견용 레귤러바이트 (11mm)'] }
    ],
    rating: 4.9,
    reviewCount: 168,
  },
  // 4. 간식 - 동결건조 소고기 큐브
  {
    id: 'shop_treat_01',
    name: '100% 원물 그대로 동결건조 한우 소고기 큐브 (120g)',
    category: '간식',
    price: 13500,
    originalPrice: 17000,
    discountBadge: '21% OFF',
    image: '🥩',
    shortDesc: '영양소 파괴 없이 원물 그대로 진공 동결건조하여 바삭하고 기호성이 뛰어난 건강 간식',
    fullDesc: `영하 40도에서 급속 동결건조하여 고단백 영양소와 본래의 풍미를 그대로 살렸습니다.
산책 훈련 보상용 또는 사료 위 토핑으로 활용하기 좋습니다.`,
    features: [
      '100% 무항생제 한우 소고기 단일 원료',
      '방부제, 색소, 보존제 0% 무첨가',
      '칭찬 훈련 및 노즈워크에 최적화된 1cm 큐브 사이즈'
    ],
    rating: 4.9,
    reviewCount: 342,
  },
  // 5. 장난감 - 치석제거 덴탈 터그 토이
  {
    id: 'shop_toy_01',
    name: '치아 치석 케어 덴탈 츄 & 무독성 천연고무 터그 세트',
    category: '장난감',
    price: 9800,
    originalPrice: 13000,
    discountBadge: '25% OFF',
    image: '🎾',
    shortDesc: '물고 씹는 과정에서 치아 사이 플라그를 자연스럽게 닦아내는 친환경 치석 케어 장난감',
    fullDesc: `단단하면서도 부드러운 천연 생고무 소재로 제작되어 치아와 잇몸 손상 없이 오래 가지고 놀 수 있습니다.
돌기 사이에 반려견용 치약을 짜 넣어 간편하게 양치 효과를 볼 수 있습니다.`,
    features: [
      '미국 FDA 인증 무독성 천연 천연고무 소재',
      '치석 제거용 입체 엠보싱 3D 돌기 구조',
      '분리불안 완화 및 실내 스트레스 해소'
    ],
    options: [
      { name: '사이즈', choices: ['소형견용 (직경 6cm)', '중대형견용 (직경 8.5cm)'] }
    ],
    rating: 4.7,
    reviewCount: 94,
  },
  // 6. 산책용품 - 휴대용 정수 산책 물병
  {
    id: 'shop_walk_02',
    name: '원터치 락앤롤 휴대용 활성탄 정수 산책 워터보틀 (420ml)',
    category: '산책용품',
    price: 14500,
    originalPrice: 19000,
    discountBadge: '24% OFF',
    image: '💧',
    shortDesc: '야외 산책 중 깨끗한 물을 바로 공급하고 남은 물은 다시 병 안으로 회수하는 클린 물병',
    fullDesc: `산책 중 반려견의 탈수 예방은 필수입니다. 야외에서도 한 손으로 버튼을 눌러 물을 주고, 마시지 않은 물은 버튼을 길게 눌러 다시 병 속으로 깔끔하게 회수할 수 있습니다.`,
    features: [
      '원터치 급수 및 잔여수 원터치 회수 메커니즘',
      '활성탄 코코넛 쉘 필터 탑재 (수돗물 염소 및 불순물 흡착)',
      '실리콘 밀폐 실링으로 가방 속 누수 100% 방지'
    ],
    options: [
      { name: '컬러', choices: ['파스텔 오렌지', '밀크 화이트', '스카이 블루'] }
    ],
    rating: 4.8,
    reviewCount: 156,
  },
  // 7. 위생용품 - 논슬립 슬개골 보호 매트
  {
    id: 'shop_hygiene_01',
    name: '디팡 프리미엄 넌슬립 폴딩 슬개골 보호 매트 (2단)',
    category: '위생용품',
    price: 42000,
    originalPrice: 56000,
    discountBadge: '25% OFF',
    image: '🛋️',
    shortDesc: '미끄러짐 90% 차단 및 14mm 고밀도 폼 충격 흡수로 슬개골 탈구를 예방하는 안심 매트',
    fullDesc: `거실 바닥의 미끄러움은 슬개골 탈구의 가장 큰 원인입니다.
양면 필름 방수 코팅으로 배변 실수 시에도 물티슈로 손쉽게 닦아낼 수 있습니다.`,
    features: [
      '미끄럼 방지 D-엠보싱 특허 표면',
      '14mm 고밀도 압축 폼 관절 충격 흡수',
      '생활 방수 및 99.9% 항균 처리 안심 인증'
    ],
    options: [
      { name: '컬러', choices: ['라이트 그레이 헤링본', '소프트 크림 마블'] }
    ],
    rating: 4.9,
    reviewCount: 420,
  },
  // 8. 위생용품 - 육구 발바닥 밤 & 왁스
  {
    id: 'shop_hygiene_02',
    name: '천연 시어버터 보습 육구 패드 밤 & 릴렉스 케어 세트',
    category: '위생용품',
    price: 11000,
    originalPrice: 15000,
    discountBadge: '26% OFF',
    image: '🐾',
    shortDesc: '아스팔트 열기와 차가운 보도블록 산책으로 갈라진 반려견 발바닥 패드를 촉촉하게 지켜주는 천연 보습 밤',
    fullDesc: `핥아도 무해한 유기농 식물성 원료(시어버터, 밀랍, 호호바오일)로 만들었습니다.
산책 전후로 가볍게 롤링하여 발라주면 미끄러짐 방지와 갈라짐 치유에 탁월합니다.`,
    features: [
      '100% EWG 올그린 식물성 비건 성분',
      '손에 묻지 않는 스틱형 이지 롤러',
      '건조한 코와 거친 육구 패드 겸용 보습'
    ],
    rating: 4.8,
    reviewCount: 112,
  }
];

export const initialShopOrders: ShopOrder[] = [
  {
    id: 'order_01',
    orderNumber: 'MGG-20261028-74921',
    date: '2026.10.28 14:20',
    items: [
      {
        productId: 'shop_gps_01',
        productName: '모으개 스마트 GPS 안심 산책 목걸이',
        productImage: '🛰️',
        priceAtOrder: 39000,
        quantity: 1,
        selectedOptions: {
          '사이즈 선택': 'S (목둘레 20~28cm / 5kg 미만 소형견)',
          '스트랩 컬러': '모으개 시그니처 오렌지',
        },
        isGpsCollar: true,
      },
    ],
    totalGoodsPrice: 39000,
    shippingFee: 0,
    pointsDiscount: 5000,
    finalPaidAmount: 34000,
    shippingAddress: {
      recipientName: '김영석',
      phone: '010-8630-1234',
      roadAddress: '서울특별시 마포구 월드컵북로 120',
      detailAddress: '302동 1104호',
      memo: '부재 시 문 앞에 놓아주세요.',
    },
    status: '배송중',
    courierName: 'CJ대한통운',
    trackingNumber: '6849-2910-3829',
    trackingHistory: [
      { date: '2026.10.28', time: '14:20', status: '주문 접수 완료', location: '모으개 공식 스토어' },
      { date: '2026.10.28', time: '17:40', status: '상품 포장 및 배송 준비', location: '김포 물류 허브센터' },
      { date: '2026.10.29', time: '08:30', status: '간선 상차 및 이동 중', location: '옥천 HUB' },
      { date: '2026.10.30', time: '09:15', status: '배송 출발 (금일 도착 예정)', location: '마포 대리점 (담당: 박기사 010-5544-2211)' },
    ],
  },
];

export const initialProductReviews: Record<string, ProductReview[]> = {
  shop_gps_01: [
    {
      id: 'rev_gps_01',
      productId: 'shop_gps_01',
      authorName: '김*석',
      authorPetBreed: '토이푸들 초코 보호자',
      rating: 5,
      title: '산책 미션 동행 인증이 완벽하게 작동해요!',
      content: '토이푸들 4살 아이 키우고 있는데, 무게가 22g이라 아이 목에 전혀 부담이 없습니다. 앱이랑 페어링도 원터치로 바로 되고, 무엇보다 산책 미션할 때 반려견 실제 동행이 실시간으로 인증되어 10% 보너스 포인트까지 매일 알뜰하게 모으고 있어요. 강력 추천합니다!',
      date: '2026.11.02',
      isVerifiedPurchase: true,
      isSampleData: true,
      selectedOptionsText: '사이즈: S / 컬러: 모으개 시그니처 오렌지',
      likesCount: 24,
    },
    {
      id: 'rev_gps_02',
      productId: 'shop_gps_01',
      authorName: '이*민',
      authorPetBreed: '비숑프리제 구름이 보호자',
      rating: 5,
      title: '야간 산책 LED 덕분에 밤길도 안심이에요',
      content: '저녁 퇴근 후 어두울 때 산책을 많이 하는데 고휘도 LED가 7가지 색상으로 빛나서 멀리서도 아이 위치가 한눈에 보입니다. 방수도 완벽해서 비 온 다음 날 진흙길에서도 문제없네요. 배터리도 2주 가까이 가니 충전 스트레스가 없어요.',
      date: '2026.10.30',
      isVerifiedPurchase: true,
      isSampleData: true,
      selectedOptionsText: '사이즈: M / 컬러: 모던 차콜',
      likesCount: 18,
    },
    {
      id: 'rev_gps_03',
      productId: 'shop_gps_01',
      authorName: '박*현',
      authorPetBreed: '포메라니안 몽이 보호자',
      rating: 4,
      title: '가볍고 귀여워요. 포인트 적립도 쏠쏠합니다',
      content: '처음엔 목걸이가 불편하지 않을까 걱정했는데 털 엉킴도 없고 착용감이 부드러워요. GPS 오차도 거의 없고 매일 산책 기록이 마이페이지에 상세하게 남아서 건강 관리용으로 대만족입니다.',
      date: '2026.10.25',
      isVerifiedPurchase: true,
      isSampleData: true,
      selectedOptionsText: '사이즈: S / 컬러: 모으개 시그니처 오렌지',
      likesCount: 11,
    },
  ],
  shop_walk_01: [
    {
      id: 'rev_walk_01',
      productId: 'shop_walk_01',
      authorName: '정*우',
      authorPetBreed: '골든리트리버 보리 보호자',
      rating: 5,
      title: '당김이 심했는데 목에 무리가 안 가요',
      content: 'Y자형 3D 에어메쉬라 가슴과 기도 압박이 없어서 켁켁거림이 완전히 사라졌습니다. 앞섬 방지 D링도 정말 유용해요.',
      date: '2026.10.28',
      isVerifiedPurchase: true,
      isSampleData: true,
      selectedOptionsText: '사이즈: L / 컬러: 웜 오렌지',
      likesCount: 15,
    },
    {
      id: 'rev_walk_02',
      productId: 'shop_walk_01',
      authorName: '최*아',
      authorPetBreed: '말티즈 콩이 보호자',
      rating: 5,
      title: '슬개골 탈구 있는 아이한테 딱입니다',
      content: '소프트한 패딩 덕분에 관절에 무리 가지 않고 야간 반사 스티치도 아주 밝습니다.',
      date: '2026.10.22',
      isVerifiedPurchase: true,
      isSampleData: true,
      selectedOptionsText: '사이즈: S / 컬러: 소프트 베이지',
      likesCount: 9,
    },
  ],
  shop_food_01: [
    {
      id: 'rev_food_01',
      productId: 'shop_food_01',
      authorName: '한*진',
      authorPetBreed: '시츄 다롱이 보호자',
      rating: 5,
      title: '눈물 자국도 줄고 다리도 덜 절어요',
      content: '가수분해 연어 사료라 알러지 반응도 없고 변 상태가 눈에 띄게 좋아졌습니다. 기호성도 최상입니다.',
      date: '2026.10.27',
      isVerifiedPurchase: true,
      isSampleData: true,
      selectedOptionsText: '키블: 스몰바이트 (7mm)',
      likesCount: 13,
    },
  ],
  shop_treat_01: [
    {
      id: 'rev_treat_01',
      productId: 'shop_treat_01',
      authorName: '송*경',
      authorPetBreed: '웰시코기 마루 보호자',
      rating: 5,
      title: '원물 100% 한우라 믿고 먹입니다',
      content: '동결건조 큐브라 부서짐 적고 물에 불려주면 육즙이 살아나요. 훈련할 때 최고 간식입니다!',
      date: '2026.10.29',
      isVerifiedPurchase: true,
      isSampleData: true,
      selectedOptionsText: '120g',
      likesCount: 8,
    },
  ],
  shop_toy_01: [
    {
      id: 'rev_toy_01',
      productId: 'shop_toy_01',
      authorName: '오*택',
      authorPetBreed: '잭러셀 테리어 탄이 보호자',
      rating: 5,
      title: '치석 제거 효과 확실해요',
      content: '치약 발라주니 스스로 씹으면서 양치하네요. 천연 고무라 튼튼해서 오래 씁니다.',
      date: '2026.10.19',
      isVerifiedPurchase: true,
      isSampleData: true,
      selectedOptionsText: '민트 그린',
      likesCount: 7,
    },
  ],
  shop_walk_02: [
    {
      id: 'rev_water_01',
      productId: 'shop_walk_02',
      authorName: '문*희',
      authorPetBreed: '스피츠 설이 보호자',
      rating: 5,
      title: '남은 물 다시 쏙 들어가서 편해요',
      content: '누수 방지 락도 확실하고 필터가 있어서 야외에서도 안심하고 깨끗한 물 먹이고 있습니다.',
      date: '2026.10.26',
      isVerifiedPurchase: true,
      isSampleData: true,
      selectedOptionsText: '500ml 대용량 / 퓨어 화이트',
      likesCount: 12,
    },
  ],
  shop_living_01: [
    {
      id: 'rev_mat_01',
      productId: 'shop_living_01',
      authorName: '강*훈',
      authorPetBreed: '포메라니안 루비 보호자',
      rating: 5,
      title: '슬개골 탈구 예방 필수템입니다',
      content: '바닥에서 미끄러지지 않고 푹신해서 아이가 뛰어다녀도 관절 소리가 안 나요. 틈새 청소도 쉽습니다.',
      date: '2026.10.24',
      isVerifiedPurchase: true,
      isSampleData: true,
      selectedOptionsText: '라이트 그레이 (140x200cm)',
      likesCount: 16,
    },
  ],
  shop_hygiene_01: [
    {
      id: 'rev_balm_01',
      productId: 'shop_hygiene_01',
      authorName: '신*주',
      authorPetBreed: '토이푸들 뽀미 보호자',
      rating: 5,
      title: '거칠었던 젤리가 촉촉해졌어요',
      content: '산책 후 닦아주고 발라주면 끈적이지 않고 흡수 빨라요. 핥아도 안전한 성분이라 안심입니다.',
      date: '2026.10.21',
      isVerifiedPurchase: true,
      isSampleData: true,
      selectedOptionsText: '오가닉 허브향 50ml',
      likesCount: 14,
    },
  ],
};
