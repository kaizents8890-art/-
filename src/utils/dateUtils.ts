/**
 * @file dateUtils.ts
 * 실제 현재 날짜 기반 출석체크 및 날짜 처리 유틸리티
 */

import { AttendanceDay } from '../types';

/**
 * 현지 기준 오늘 날짜 문자열 반환 (YYYY-MM-DD)
 */
export const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 요일 문자열 반환
 */
const KOREAN_DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

/**
 * 실제 현재 날짜가 포함된 7일 출석체크 캘린더 생성 (월요일 ~ 일요일)
 * @param checkedDateKeys 이미 출석체크 완료된 YYYY-MM-DD 목록
 */
export const generateRealAttendanceDays = (checkedDateKeys: string[] = []): AttendanceDay[] => {
  const now = new Date();
  const todayStr = getTodayDateString();

  // 이번 주의 월요일 구하기 (0: 일요일, 1: 월요일, ... 6: 토요일)
  const currentDayOfWeek = now.getDay();
  // 한국 기준 월요일(1) 시작으로 계산. 일요일(0)이면 -6, 아니면 -(currentDayOfWeek - 1)
  const daysSinceMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;

  const monday = new Date(now);
  monday.setDate(now.getDate() - daysSinceMonday);
  monday.setHours(0, 0, 0, 0);

  const days: AttendanceDay[] = [];

  for (let i = 0; i < 7; i++) {
    const targetDate = new Date(monday);
    targetDate.setDate(monday.getDate() + i);

    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;
    const dayName = KOREAN_DAY_NAMES[targetDate.getDay()];

    const isToday = dateKey === todayStr;
    const isChecked = checkedDateKeys.includes(dateKey);
    // 7일차이거나 오늘 출석체크 시 150P
    const rewardPoints = i === 6 ? 150 : 150;

    days.push({
      dayNumber: i + 1,
      dateStr: `${month}/${day} (${dayName})`,
      isToday,
      isChecked,
      rewardPoints,
    });
  }

  return days;
};

export type PeriodFilterType = '1month' | '3months' | '6months' | '1year' | 'all' | 'custom';

export const PERIOD_FILTER_LABELS: Record<PeriodFilterType, string> = {
  '1month': '최근 1개월',
  '3months': '최근 3개월',
  '6months': '최근 6개월',
  '1year': '최근 1년',
  'all': '전체 기간',
  'custom': '직접 기간 설정',
};

/**
 * 다양한 날짜 형식(YYYY.MM.DD HH:mm, YYYY-MM-DD, 방금 전 등)을 Date 객체로 파싱
 */
export const parseRecordDate = (dateStr?: string): Date | null => {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();
  const now = new Date();

  if (trimmed.includes('전')) {
    if (trimmed.includes('방금')) return now;
    const match = trimmed.match(/(\d+)\s*일\s*전/);
    if (match) {
      const days = parseInt(match[1], 10);
      const d = new Date(now);
      d.setDate(d.getDate() - days);
      return d;
    }
    const hourMatch = trimmed.match(/(\d+)\s*시간\s*전/);
    if (hourMatch) {
      const hours = parseInt(hourMatch[1], 10);
      const d = new Date(now);
      d.setHours(d.getHours() - hours);
      return d;
    }
    return now;
  }

  // YYYY.MM.DD or YYYY-MM-DD
  const clean = trimmed.replace(/\./g, '-').replace(/\//g, '-');
  const [datePart, timePart] = clean.split(' ');
  const parts = datePart.split('-');
  if (parts.length >= 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    let hour = 12;
    let min = 0;
    if (timePart) {
      const t = timePart.split(':');
      if (t.length >= 2) {
        hour = parseInt(t[0], 10) || 0;
        min = parseInt(t[1], 10) || 0;
      }
    }
    return new Date(year, month, day, hour, min);
  }

  const parsed = new Date(trimmed);
  return isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * 특정 날짜가 선택한 기간 조건에 부합하는지 검사
 */
export const isDateInPeriod = (
  dateStr?: string,
  period: PeriodFilterType = 'all',
  customStart?: string,
  customEnd?: string
): boolean => {
  if (period === 'all') return true;
  if (!dateStr) return false;

  const targetDate = parseRecordDate(dateStr);
  if (!targetDate) return true; // 파싱 실패 시 표시 유지

  const now = new Date();

  if (period === 'custom') {
    if (customStart) {
      const start = new Date(customStart);
      start.setHours(0, 0, 0, 0);
      if (targetDate < start) return false;
    }
    if (customEnd) {
      const end = new Date(customEnd);
      end.setHours(23, 59, 59, 999);
      if (targetDate > end) return false;
    }
    return true;
  }

  const boundary = new Date(now);
  boundary.setHours(0, 0, 0, 0);

  if (period === '1month') {
    boundary.setMonth(boundary.getMonth() - 1);
  } else if (period === '3months') {
    boundary.setMonth(boundary.getMonth() - 3);
  } else if (period === '6months') {
    boundary.setMonth(boundary.getMonth() - 6);
  } else if (period === '1year') {
    boundary.setFullYear(boundary.getFullYear() - 1);
  }

  return targetDate >= boundary;
};
