/**
 * @file dogBreeds.ts
 * 대표적인 반려견 견종 목록 및 검색/선택 지원 유틸리티
 */

export interface DogBreedOption {
  id: string;
  name: string;
  size: '소형견' | '중형견' | '대형견';
  popular?: boolean;
}

export const POPULAR_BREEDS: DogBreedOption[] = [
  { id: 'maltese', name: '말티즈', size: '소형견', popular: true },
  { id: 'poodle', name: '푸들', size: '소형견', popular: true },
  { id: 'pomeranian', name: '포메라니안', size: '소형견', popular: true },
  { id: 'bichon', name: '비숑 프리제', size: '소형견', popular: true },
  { id: 'chihuahua', name: '치와와', size: '소형견', popular: true },
  { id: 'shiba', name: '시바견', size: '중형견', popular: true },
  { id: 'golden_retriever', name: '골든 리트리버', size: '대형견', popular: true },
  { id: 'labrador', name: '래브라도 리트리버', size: '대형견', popular: true },
  { id: 'welsh_corgi', name: '웰시코기', size: '중형견', popular: true },
  { id: 'dachshund', name: '닥스훈트', size: '소형견', popular: true },
  { id: 'shih_tzu', name: '시츄', size: '소형견', popular: true },
  { id: 'yorkshire', name: '요크셔테리어', size: '소형견', popular: true },
  { id: 'french_bulldog', name: '프렌치 불도그', size: '중형견', popular: true },
  { id: 'border_collie', name: '보더콜리', size: '중형견', popular: true },
  { id: 'jindo', name: '진돗개', size: '중형견', popular: true },
  { id: 'mixed', name: '믹스견', size: '중형견', popular: true },
  { id: 'bedlington', name: '베들링턴 테리어', size: '중형견' },
  { id: 'schnauzer', name: '슈나우저', size: '소형견' },
  { id: 'samoyed', name: '사모예드', size: '대형견' },
  { id: 'husky', name: '시베리안 허스키', size: '대형견' },
  { id: 'spitz', name: '재패니즈 스피츠', size: '중형견' },
  { id: 'italian_greyhound', name: '이탈리안 그레이하운드', size: '소형견' },
  { id: 'cavalier', name: '카발리에 킹 찰스 스패니얼', size: '소형견' },
  { id: 'beagle', name: '비글', size: '중형견' },
  { id: 'doberman', name: '도베르만', size: '대형견' },
  { id: 'other', name: '기타 (직접 입력)', size: '중형견' },
];

export const filterBreeds = (query: string): DogBreedOption[] => {
  const clean = query.trim().toLowerCase();
  if (!clean) return POPULAR_BREEDS;
  return POPULAR_BREEDS.filter(
    (b) =>
      b.name.toLowerCase().includes(clean) ||
      b.size.toLowerCase().includes(clean)
  );
};
