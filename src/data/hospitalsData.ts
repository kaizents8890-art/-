/**
 * @file hospitalsData.ts
 * 대한민국 전역 시·도 및 시·군·구 맞춤 동물병원 데이터 및 좌표 생성기
 */

import { Hospital } from '../types';
import { parseRegion } from './koreaDistricts';

export interface RegionCoord {
  lat: number;
  lng: number;
}

/**
 * 전국 주요 시·군·구 중심 좌표 매핑
 */
const DETAILED_REGION_COORDS: Record<string, RegionCoord> = {
  // 서울특별시 (25개 자치구)
  '서울특별시 마포구': { lat: 37.5663, lng: 126.9016 },
  '서울특별시 강남구': { lat: 37.5172, lng: 127.0473 },
  '서울특별시 서초구': { lat: 37.4837, lng: 127.0324 },
  '서울특별시 송파구': { lat: 37.5145, lng: 127.1060 },
  '서울특별시 영등포구': { lat: 37.5264, lng: 126.8962 },
  '서울특별시 용산구': { lat: 37.5326, lng: 126.9900 },
  '서울특별시 종로구': { lat: 37.5730, lng: 126.9794 },
  '서울특별시 중구': { lat: 37.5641, lng: 126.9979 },
  '서울특별시 성동구': { lat: 37.5635, lng: 127.0365 },
  '서울특별시 광진구': { lat: 37.5385, lng: 127.0822 },
  '서울특별시 강동구': { lat: 37.5301, lng: 127.1238 },
  '서울특별시 강서구': { lat: 37.5509, lng: 126.8495 },
  '서울특별시 양천구': { lat: 37.5169, lng: 126.8665 },
  '서울특별시 구로구': { lat: 37.4954, lng: 126.8874 },
  '서울특별시 금천구': { lat: 37.4568, lng: 126.8954 },
  '서울특별시 동작구': { lat: 37.5124, lng: 126.9393 },
  '서울특별시 관악구': { lat: 37.4784, lng: 126.9516 },
  '서울특별시 서대문구': { lat: 37.5791, lng: 126.9368 },
  '서울특별시 은평구': { lat: 37.6027, lng: 126.9291 },
  '서울특별시 성북구': { lat: 37.5891, lng: 127.0182 },
  '서울특별시 강북구': { lat: 37.6396, lng: 127.0255 },
  '서울특별시 도봉구': { lat: 37.6688, lng: 127.0471 },
  '서울특별시 노원구': { lat: 37.6542, lng: 127.0568 },
  '서울특별시 중랑구': { lat: 37.6065, lng: 127.0927 },
  '서울특별시 동대문구': { lat: 37.5744, lng: 127.0397 },

  // 경상남도 (거제시, 창원시, 김해시, 진주시, 양산시 등)
  '경상남도 거제시': { lat: 34.8806, lng: 128.6211 },
  '경상남도 창원시': { lat: 35.2280, lng: 128.6811 },
  '경상남도 김해시': { lat: 35.2285, lng: 128.8894 },
  '경상남도 진주시': { lat: 35.1802, lng: 128.1076 },
  '경상남도 양산시': { lat: 35.3350, lng: 129.0373 },
  '경상남도 통영시': { lat: 34.8544, lng: 128.4332 },
  '경상남도 사천시': { lat: 35.0035, lng: 128.0642 },
  '경상남도 밀양시': { lat: 35.5038, lng: 128.7466 },

  // 경기도 주요 시/구
  '경기도 성남시': { lat: 37.4201, lng: 127.1265 },
  '경기도 성남시 분당구': { lat: 37.3827, lng: 127.1189 },
  '경기도 수원시': { lat: 37.2636, lng: 127.0286 },
  '경기도 수원시 팔달구': { lat: 37.2825, lng: 127.0190 },
  '경기도 수원시 영통구': { lat: 37.2596, lng: 127.0503 },
  '경기도 용인시': { lat: 37.2411, lng: 127.1776 },
  '경기도 용인시 수지구': { lat: 37.3223, lng: 127.0975 },
  '경기도 고양시': { lat: 37.6584, lng: 126.8320 },
  '경기도 고양시 일산동구': { lat: 37.6584, lng: 126.7720 },
  '경기도 부천시': { lat: 37.5034, lng: 126.7660 },
  '경기도 안양시': { lat: 37.3943, lng: 126.9568 },
  '경기도 화성시': { lat: 37.1995, lng: 126.8315 },
  '경기도 남양주시': { lat: 37.6360, lng: 127.2165 },
  '경기도 평택시': { lat: 36.9921, lng: 127.1129 },
  '경기도 안산시': { lat: 37.3219, lng: 126.8309 },

  // 부산광역시
  '부산광역시 해운대구': { lat: 35.1631, lng: 129.1636 },
  '부산광역시 부산진구': { lat: 35.1630, lng: 129.0531 },
  '부산광역시 수영구': { lat: 35.1456, lng: 129.1130 },
  '부산광역시 남구': { lat: 35.1365, lng: 129.0842 },
  '부산광역시 사하구': { lat: 35.1044, lng: 128.9749 },
  '부산광역시 동래구': { lat: 35.2048, lng: 129.0836 },
  '부산광역시 북구': { lat: 35.1970, lng: 128.9900 },
  '부산광역시 금정구': { lat: 35.2430, lng: 129.0920 },

  // 대구광역시
  '대구광역시 수성구': { lat: 35.8583, lng: 128.6306 },
  '대구광역시 중구': { lat: 35.8694, lng: 128.6062 },
  '대구광역시 달서구': { lat: 35.8299, lng: 128.5327 },
  '대구광역시 북구': { lat: 35.8856, lng: 128.5828 },
  '대구광역시 동구': { lat: 35.8866, lng: 128.6355 },

  // 인천광역시
  '인천광역시 연수구': { lat: 37.4098, lng: 126.6783 },
  '인천광역시 남동구': { lat: 37.4471, lng: 126.7314 },
  '인천광역시 부평구': { lat: 37.5074, lng: 126.7219 },
  '인천광역시 서구': { lat: 37.5453, lng: 126.6760 },
  '인천광역시 중구': { lat: 37.4736, lng: 126.6216 },

  // 대전광역시
  '대전광역시 유성구': { lat: 36.3622, lng: 127.3563 },
  '대전광역시 서구': { lat: 36.3553, lng: 127.3838 },
  '대전광역시 중구': { lat: 36.3259, lng: 127.4214 },

  // 광주광역시
  '광주광역시 서구': { lat: 35.1520, lng: 126.8897 },
  '광주광역시 북구': { lat: 35.1741, lng: 126.9121 },
  '광주광역시 광산구': { lat: 35.1396, lng: 126.7936 },

  // 울산광역시
  '울산광역시 남구': { lat: 35.5438, lng: 129.3301 },
  '울산광역시 중구': { lat: 35.5694, lng: 129.3328 },

  // 세종특별자치시
  '세종특별자치시': { lat: 36.4800, lng: 127.2890 },

  // 강원특별자치도
  '강원특별자치도 춘천시': { lat: 37.8813, lng: 127.7298 },
  '강원특별자치도 원주시': { lat: 37.3422, lng: 127.9202 },
  '강원특별자치도 강릉시': { lat: 37.7519, lng: 128.8761 },

  // 충청북도
  '충청북도 청주시': { lat: 36.6424, lng: 127.4890 },
  '충청북도 충주시': { lat: 36.9910, lng: 127.9259 },

  // 충청남도
  '충청남도 천안시': { lat: 36.8151, lng: 127.1139 },
  '충청남도 아산시': { lat: 36.7898, lng: 127.0019 },

  // 전북특별자치도
  '전북특별자치도 전주시': { lat: 35.8242, lng: 127.1480 },
  '전북특별자치도 군산시': { lat: 35.9676, lng: 126.7366 },
  '전북특별자치도 익산시': { lat: 35.9483, lng: 126.9576 },

  // 전라남도
  '전라남도 여수시': { lat: 34.7604, lng: 127.6622 },
  '전라남도 순천시': { lat: 34.9506, lng: 127.4872 },
  '전라남도 목포시': { lat: 34.8118, lng: 126.3922 },

  // 경상북도
  '경상북도 포항시': { lat: 36.0190, lng: 129.3435 },
  '경상북도 구미시': { lat: 36.1195, lng: 128.3446 },
  '경상북도 경주시': { lat: 35.8562, lng: 129.2247 },

  // 제주특별자치도
  '제주특별자치도 제주시': { lat: 33.4996, lng: 126.5312 },
  '제주특별자치도 서귀포시': { lat: 33.2541, lng: 126.5601 },

  // 시·도 기본 중심좌표
  '서울특별시': { lat: 37.5665, lng: 126.9780 },
  '부산광역시': { lat: 35.1796, lng: 129.0756 },
  '대구광역시': { lat: 35.8714, lng: 128.6014 },
  '인천광역시': { lat: 37.4563, lng: 126.7052 },
  '광주광역시': { lat: 35.1595, lng: 126.8526 },
  '대전광역시': { lat: 36.3504, lng: 127.3845 },
  '울산광역시': { lat: 35.5384, lng: 129.3114 },
  '경기도': { lat: 37.4138, lng: 127.5183 },
  '강원특별자치도': { lat: 37.8228, lng: 128.1555 },
  '충청북도': { lat: 36.6357, lng: 127.4917 },
  '충청남도': { lat: 36.6588, lng: 126.6728 },
  '전북특별자치도': { lat: 35.8206, lng: 127.1088 },
  '전라남도': { lat: 34.8161, lng: 126.4629 },
  '경상북도': { lat: 36.5760, lng: 128.5056 },
  '경상남도': { lat: 35.2383, lng: 128.6925 },
  '제주특별자치도': { lat: 33.4890, lng: 126.4983 },
};

/**
 * 지역별 전화 지역번호 조회
 */
export const getPhoneAreaCode = (sido: string): string => {
  if (sido.includes('서울')) return '02';
  if (sido.includes('경기')) return '031';
  if (sido.includes('인천')) return '032';
  if (sido.includes('강원')) return '033';
  if (sido.includes('충남')) return '041';
  if (sido.includes('대전')) return '042';
  if (sido.includes('충북')) return '043';
  if (sido.includes('세종')) return '044';
  if (sido.includes('부산')) return '051';
  if (sido.includes('울산')) return '052';
  if (sido.includes('대구')) return '053';
  if (sido.includes('경북')) return '054';
  if (sido.includes('경남')) return '055';
  if (sido.includes('전남')) return '061';
  if (sido.includes('광주')) return '062';
  if (sido.includes('전북')) return '063';
  if (sido.includes('제주')) return '064';
  return '02';
};

/**
 * 거주지역명 기반 중심 좌표 계산 (대한민국 경계 내 보장)
 */
export const getCoordinatesForRegion = (regionStr: string): RegionCoord => {
  const clean = regionStr.trim();
  if (DETAILED_REGION_COORDS[clean]) return DETAILED_REGION_COORDS[clean];

  const parsed = parseRegion(clean);
  const composite = `${parsed.sido} ${parsed.sigungu}`.trim();
  if (DETAILED_REGION_COORDS[composite]) return DETAILED_REGION_COORDS[composite];

  // Try matching just the city (e.g., '경상남도 거제시' matches '거제시')
  for (const [key, val] of Object.entries(DETAILED_REGION_COORDS)) {
    if (parsed.sigungu && key.includes(parsed.sigungu)) {
      return val;
    }
  }

  // Fallback to Sido center
  if (DETAILED_REGION_COORDS[parsed.sido]) {
    return DETAILED_REGION_COORDS[parsed.sido];
  }

  // Default to Seoul Mapo
  return { lat: 37.5663, lng: 126.9016 };
};

/**
 * 보호자의 거주 지역(시·군·구 단위)에 맞춤형으로 100% 일치하는 주변 동물병원 목록 생성
 * @param regionStr 보호자 거주지역 (예: "경상남도 거제시", "서울특별시 마포구", "부산광역시 해운대구")
 */
export const getRecommendedHospitalsForRegion = (regionStr: string): Hospital[] => {
  const parsed = parseRegion(regionStr);
  const sido = parsed.sido || '서울특별시';
  const sigungu = parsed.sigungu || '마포구';
  const districtName = sigungu.replace(/(시|군|구)$/, '') || '우리동네';
  const center = getCoordinatesForRegion(regionStr);
  const areaCode = getPhoneAreaCode(sido);

  return [
    {
      id: `hosp_${sido}_${sigungu}_01`,
      name: `24시 ${districtName} 센트럴 동물의료원`,
      isEmergency24h: true,
      distanceKm: 0.4,
      address: `${sido} ${sigungu} 중앙로 142 (응급의료센터 1~3층)`,
      phone: `${areaCode}-332-7582`,
      rating: 4.9,
      reviewCount: 148,
      openingHours: '24시간 연중무휴 (야간응급수술 / 중환자실 집중관리)',
      departments: ['24시 응급의학과', '슬개골·정형외과', '심장내과', '치과스케일링'],
      facilities: ['24시 중환자실(ICU)', '무균 수술실 3실', '디지털 CT/DR X-ray', '전용 주차장'],
      pointDiscountRate: '모으개 포인트 최대 30,000P 즉시 차감 사용 가능 (진료비 10% 추가 적립)',
      lat: center.lat + 0.0025,
      lng: center.lng - 0.0035,
      reviews: [
        {
          id: 'r_01',
          author: '초코보호자',
          petBreed: '토이푸들',
          rating: 5,
          content: '새벽에 아이가 구토를 심하게 해서 급히 방문했는데, 야간 당직 수의사 선생님께서 침착하고 친절하게 진료해 주셨어요. 모으개 바우처 3만원권 사용해서 병원비 부담도 많이 덜었습니다!',
          date: '2026.10.22',
          visitedFor: '야간 응급 구토 및 혈액검사',
        },
        {
          id: 'r_02',
          author: '콩이아빠',
          petBreed: '말티즈',
          rating: 5,
          content: '슬개골 탈구 2기 진단받고 정기적으로 검진받고 있습니다. 관절 전문 원장님 소견이 매우 꼼꼼하고 과잉진료가 전혀 없어서 신뢰가 갑니다.',
          date: '2026.10.15',
          visitedFor: '슬개골 관절 정밀 방사선 검사',
        },
      ],
    },
    {
      id: `hosp_${sido}_${sigungu}_02`,
      name: `${districtName} 24시 스마트 동물의료센터`,
      isEmergency24h: true,
      distanceKm: 0.9,
      address: `${sido} ${sigungu} 해맞이로 88 센트럴타워 2층`,
      phone: `${areaCode}-711-8275`,
      rating: 4.8,
      reviewCount: 96,
      openingHours: '24시간 연중무휴 (야간진료 및 긴급수술)',
      departments: ['야간응급외과', '고양이 전문클리닉', '안과 정밀검진', '피부·알레르기'],
      facilities: ['격리 입원실', '고양이 전용 대기실(ISFM 인증)', '초음파 정밀진단기'],
      pointDiscountRate: '모으개 바우처 전 항목 100% 현금 동일 적용',
      lat: center.lat - 0.0042,
      lng: center.lng + 0.0051,
      reviews: [
        {
          id: 'r_03',
          author: '루비엄마',
          petBreed: '포메라니안',
          rating: 5,
          content: '일요일 저녁에 갑자기 귀를 긁고 아파해서 찾아갔는데 바로 이경 검사하고 약 지어주셨어요. 모으개 바우처 결제도 카운터에서 바코드 찍고 바로 차감되어 편리했습니다.',
          date: '2026.10.19',
          visitedFor: '외이도염 및 알레르기 급성 치료',
        },
      ],
    },
    {
      id: `hosp_${sido}_${sigungu}_03`,
      name: `${districtName} 바른 동물병원`,
      isEmergency24h: false,
      distanceKm: 1.3,
      address: `${sido} ${sigungu} 숲길로 56 1층`,
      phone: `${areaCode}-392-0075`,
      rating: 4.9,
      reviewCount: 82,
      openingHours: '평일 09:30 ~ 20:30 / 주말 및 공휴일 10:00 ~ 18:00',
      departments: ['정기 종합건강검진', '혼합예방접종', '스케일링·구강외과', '노령견 내과 케어'],
      facilities: ['호흡마취기', '치과 전용 디지털 X-ray', '무스트레스 회복실'],
      pointDiscountRate: '정기검진 바우처 50,000원권 사용 가능',
      lat: center.lat + 0.0068,
      lng: center.lng + 0.0028,
      reviews: [
        {
          id: 'r_04',
          author: '몽이네',
          petBreed: '시츄',
          rating: 5,
          content: '연간 종합검진 모으개 5만원 바우처 써서 다녀왔어요. 결과지 컬러로 출력해서 항목 하나하나 친절하게 설명해 주셔서 감사했습니다.',
          date: '2026.10.12',
          visitedFor: '연간 정기 종합건강검진',
        },
      ],
    },
    {
      id: `hosp_${sido}_${sigungu}_04`,
      name: `${districtName} 튼튼 동물병원`,
      isEmergency24h: false,
      distanceKm: 1.8,
      address: `${sido} ${sigungu} 평화로 210 동보빌딩 1층`,
      phone: `${areaCode}-882-1122`,
      rating: 4.8,
      reviewCount: 64,
      openingHours: '평일 10:00 ~ 19:30 / 토요일 10:00 ~ 17:00 (일요일 휴진)',
      departments: ['예방접종·기초검진', '피부 레이저 치료', '영양 상담 및 비만 클리닉'],
      facilities: ['반려견 전용 대기실', '반려견 체성분 분석기', '안심 미용실 연계'],
      pointDiscountRate: '진료비 20,000P 할인 및 영양제 10% 추가 적립',
      lat: center.lat - 0.0055,
      lng: center.lng - 0.0062,
      reviews: [
        {
          id: 'r_05',
          author: '보리보호자',
          petBreed: '비숑 프리제',
          rating: 4,
          content: '알레르기 피부 때문에 사료 상담받고 왔는데 원장님 설명이 아주 전문적입니다.',
          date: '2026.10.08',
          visitedFor: '식이 알레르기 및 아토피 처방',
        },
      ],
    },
    {
      id: `hosp_${sido}_${sigungu}_05`,
      name: `${districtName} 해피 애니멀 메디컬센터`,
      isEmergency24h: false,
      distanceKm: 2.4,
      address: `${sido} ${sigungu} 솔밭로 79`,
      phone: `${areaCode}-921-3344`,
      rating: 4.7,
      reviewCount: 51,
      openingHours: '월~토 09:30 ~ 20:00 (공휴일 정상진료)',
      departments: ['외과 수술 전문', '안과 정밀검사', '치과 발치 및 신경치료'],
      facilities: ['초음파 수술기', '모니터링 입원실', '주차 가능'],
      pointDiscountRate: '모으개 바우처 전액 사용 가능',
      lat: center.lat + 0.0088,
      lng: center.lng - 0.0078,
      reviews: [
        {
          id: 'r_06',
          author: '대박이맘',
          petBreed: '골든 리트리버',
          rating: 5,
          content: '대형견 진료도 전혀 부담 없이 능숙하게 잘 다뤄주셔서 편안하게 진료 마쳤습니다.',
          date: '2026.10.02',
          visitedFor: '심장사상충 및 혼합백신 접종',
        },
      ],
    },
  ];
};
