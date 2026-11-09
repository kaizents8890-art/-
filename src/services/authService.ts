/**
 * @file authService.ts
 * 모으개 (MOGEGAE) 인증 & 권한 관리 서비스
 * 
 * - 지정된 3개 테스트 계정 유지
 * - 신규 회원가입 계정 로컬 영구 저장 (중복 아이디 방지)
 * - 관리자 계정 2개 전용 회원 탈퇴 및 계정 영구 삭제 권한
 * - 세션 관리 및 로그인/로그아웃
 */

import { getUserData } from './userService';

export type UserRole = 'professor' | 'admin';

export interface AuthAccount {
  id: string; // 로그인 아이디
  password: string; // 비밀번호
  name: string; // 이름
  role: UserRole; // 역할
  description: string; // 설명
  avatar: string;
  registeredAt?: string;
}

export interface AuthSession {
  user: {
    id: string;
    name: string;
    role: UserRole;
    avatar: string;
  };
  token: string;
  loginTime: string;
}

// 최고 관리자 권한을 가진 계정 2개 (계정 삭제 권한 보유 및 자체 삭제 불가)
export const ADMIN_ACCOUNT_IDS = ['202302033', '2025001203'] as const;

// 사용자 요청에 지정된 3대 기본 계정
export const TEST_ACCOUNTS: AuthAccount[] = [
  {
    id: 'ascend8630',
    password: '1234',
    name: '김영석',
    role: 'professor',
    description: '일반 계정',
    avatar: '👤',
    registeredAt: '2024.10.01',
  },
  {
    id: '202302033',
    password: '1234',
    name: '이유현',
    role: 'admin',
    description: '관리자 계정 1',
    avatar: '👩‍💼',
    registeredAt: '2024.03.01',
  },
  {
    id: '2025001203',
    password: '1234',
    name: '임지윤',
    role: 'admin',
    description: '관리자 계정 2',
    avatar: '👨‍💼',
    registeredAt: '2024.03.01',
  },
];

const AUTH_STORAGE_KEY = 'mogege_auth_session_v2';
const REGISTERED_ACCOUNTS_KEY = 'mogege_registered_accounts_v2';
const DELETED_ACCOUNTS_KEY = 'mogege_deleted_accounts_v2';

/**
 * 삭제/탈퇴 처리된 계정 ID 목록 조회
 */
export const getDeletedAccountIds = (): string[] => {
  try {
    const raw = localStorage.getItem(DELETED_ACCOUNTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
};

/**
 * 계정 삭제 여부 확인
 */
export const isAccountDeleted = (id: string): boolean => {
  const deleted = getDeletedAccountIds();
  return deleted.includes(id.trim().toLowerCase());
};

/**
 * 특정 계정이 최고 관리자 권한(계정 삭제 권한)을 보유하고 있는지 검증
 */
export const isSuperAdmin = (userId?: string): boolean => {
  if (!userId) return false;
  return ADMIN_ACCOUNT_IDS.includes(userId.trim() as any);
};

/**
 * 저장된 신규 등록 계정 목록 불러오기 (삭제된 계정 제외)
 */
export const getRegisteredAccounts = (): AuthAccount[] => {
  try {
    const raw = localStorage.getItem(REGISTERED_ACCOUNTS_KEY);
    if (!raw) return [];
    const accounts = JSON.parse(raw) as AuthAccount[];
    const deleted = getDeletedAccountIds();
    return accounts.filter((acc) => !deleted.includes(acc.id.toLowerCase()));
  } catch {
    return [];
  }
};

/**
 * 아이디 중복 여부 확인
 * - 관리자 계정 2개는 신규 등록 불가
 * - 이미 활성 상태인 계정은 중복 불가
 * - 관리자에 의해 삭제된 계정 아이디는 재가입 허용
 */
export const isIdAvailable = (id: string): boolean => {
  const cleanId = id.trim().toLowerCase();
  if (!cleanId) return false;

  // 관리자 2개 계정은 신규 등록 불가 (보호)
  if (ADMIN_ACCOUNT_IDS.includes(cleanId as any)) return false;

  const deleted = getDeletedAccountIds();
  const isDeleted = deleted.includes(cleanId);

  // 기본 시연 계정 중 삭제되지 않은 활성 계정인지 확인
  const inTestActive = TEST_ACCOUNTS.some(
    (acc) => acc.id.toLowerCase() === cleanId && !isDeleted
  );
  if (inTestActive) return false;

  // 현재 활성 등록된 계정에 중복이 있는지 확인
  const registered = getRegisteredAccounts();
  const inRegistered = registered.some((acc) => acc.id.toLowerCase() === cleanId);
  if (inRegistered) return false;

  // 삭제된 계정이거나 미사용 아이디라면 신규 가입 가능!
  return true;
};

/**
 * 신규 계정 등록
 * - 삭제되었던 계정 아이디라면 삭제 목록에서 제거하여 완전 부활
 * - 기존 데이터와 격리된 새로운 데이터로 초기화
 */
export const registerNewAccount = (account: AuthAccount): void => {
  const cleanId = account.id.trim();

  if (!isIdAvailable(cleanId)) {
    throw new Error('이미 사용 중이거나 사용할 수 없는 아이디입니다.');
  }

  // 과거 삭제 목록에 남아있던 기록 제거 (재가입 지원)
  const deleted = getDeletedAccountIds();
  if (deleted.includes(cleanId.toLowerCase())) {
    const updated = deleted.filter((d) => d !== cleanId.toLowerCase());
    localStorage.setItem(DELETED_ACCOUNTS_KEY, JSON.stringify(updated));
  }

  const registered = getRegisteredAccounts();
  const now = new Date();
  const dateStr = `${now.getFullYear()}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getDate().toString().padStart(2, '0')}`;

  const newAccount: AuthAccount = {
    ...account,
    id: cleanId,
    registeredAt: dateStr,
  };

  registered.push(newAccount);
  localStorage.setItem(REGISTERED_ACCOUNTS_KEY, JSON.stringify(registered));
};

/**
 * 로그인 인증 처리
 */
export const login = async (id: string, password: string): Promise<AuthSession> => {
  const trimmedId = id.trim();
  const trimmedPw = password.trim();

  // 1. 등록 계정 중 검색 (재가입 계정 포함)
  const registered = getRegisteredAccounts();
  let account = registered.find(
    (acc) => acc.id.toLowerCase() === trimmedId.toLowerCase() && acc.password === trimmedPw
  );

  // 2. 등록 계정에 없고 삭제되지 않은 경우에만 기본 테스트 계정 검색
  if (!account && !isAccountDeleted(trimmedId)) {
    account = TEST_ACCOUNTS.find(
      (acc) => acc.id.toLowerCase() === trimmedId.toLowerCase() && acc.password === trimmedPw
    );
  }

  // 3. 삭제된 상태이고 재가입되지 않은 경우 안내
  if (!account && isAccountDeleted(trimmedId)) {
    throw new Error('삭제 처리된 계정입니다. 해당 아이디로 다시 회원가입 후 이용해 주세요.');
  }

  if (!account) {
    throw new Error('아이디 또는 비밀번호가 일치하지 않습니다. 다시 확인해 주세요.');
  }

  const session: AuthSession = {
    user: {
      id: account.id,
      name: account.name,
      role: account.role,
      avatar: account.avatar,
    },
    token: `token_${account.id}_${Date.now()}`,
    loginTime: new Date().toISOString(),
  };

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  return session;
};

/**
 * 로그아웃 처리
 */
export const logout = (): void => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  if (typeof window !== 'undefined' && window.history?.replaceState) {
    window.history.replaceState(null, '', window.location.pathname);
  }
};

/**
 * 새로고침 시 저장된 로그인 세션 확인
 */
export const getSavedSession = (): AuthSession | null => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as AuthSession;
    // 만약 삭제된 계정 세션이라면 자동 만료
    if (isAccountDeleted(session.user.id)) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
};

/**
 * 관리자 권한 확인
 */
export const isAdminUser = (session: AuthSession | null): boolean => {
  return session?.user.role === 'admin';
};

/**
 * 관리자용 전체 회원 목록 데이터 구조
 */
export interface AdminMemberItem {
  id: string;
  name: string;
  role: UserRole;
  petBreed: string;
  petName: string;
  region: string;
  points: number;
  registeredAt: string;
  status: '정상' | '탈퇴' | '관리자';
  canDelete: boolean;
}

/**
 * 관리자 화면용 전체 회원 목록 조회
 */
export const getAllMembersForAdmin = (): AdminMemberItem[] => {
  const deleted = getDeletedAccountIds();
  const allAccounts: AuthAccount[] = [
    ...TEST_ACCOUNTS,
    ...getRegisteredAccounts(),
  ].filter((acc, idx, self) => self.findIndex((s) => s.id === acc.id) === idx && !deleted.includes(acc.id.toLowerCase()));

  return allAccounts.map((acc) => {
    const isSpecialAdmin = isSuperAdmin(acc.id);
    let petBreed = '토이푸들';
    let petName = '초코';
    let region = '서울특별시 마포구';
    let points = 138500;

    try {
      const userData = getUserData(acc.id, acc.name);
      petBreed = userData.user.petBreed || petBreed;
      petName = userData.user.petName || petName;
      region = userData.user.guardianRegion || region;
      points = userData.points ?? points;
    } catch {
      // fallback to defaults
    }

    return {
      id: acc.id,
      name: acc.name,
      role: acc.role,
      petBreed,
      petName,
      region,
      points,
      registeredAt: acc.registeredAt || '2024.10.15',
      status: isSpecialAdmin ? '관리자' : '정상',
      canDelete: !isSpecialAdmin, // 관리자 계정은 절대 삭제 불가
    };
  });
};

/**
 * 관리자 전용 회원 계정 삭제 (영구 탈퇴 및 데이터 삭제)
 * @param requesterAdminId 삭제 요청한 관리자 아이디
 * @param targetUserId 삭제할 회원 아이디
 */
export const deleteMemberByAdmin = (requesterAdminId: string, targetUserId: string): void => {
  // 1. 요청자가 승인된 최고 관리자인지 엄격 검증
  if (!isSuperAdmin(requesterAdminId)) {
    throw new Error('권한 오류: 계정 삭제 권한이 없는 관리자입니다.');
  }

  // 2. 관리자 본인 또는 동료 관리자 계정 삭제 방지
  if (isSuperAdmin(targetUserId)) {
    throw new Error('보호 오류: 관리자 계정은 삭제할 수 없습니다.');
  }

  const cleanTargetId = targetUserId.trim().toLowerCase();

  // 3. 삭제 계정 목록에 추가
  const deleted = getDeletedAccountIds();
  if (!deleted.includes(cleanTargetId)) {
    deleted.push(cleanTargetId);
    localStorage.setItem(DELETED_ACCOUNTS_KEY, JSON.stringify(deleted));
  }

  // 4. 등록 계정 목록에서 제거
  try {
    const raw = localStorage.getItem(REGISTERED_ACCOUNTS_KEY);
    if (raw) {
      const accounts = JSON.parse(raw) as AuthAccount[];
      const filtered = accounts.filter((a) => a.id.toLowerCase() !== cleanTargetId);
      localStorage.setItem(REGISTERED_ACCOUNTS_KEY, JSON.stringify(filtered));
    }
  } catch (err) {
    console.error('Failed to update registered accounts:', err);
  }

  // 5. 유저의 저장된 개인정보, 포인트, 목표 등 전체 데이터 삭제
  try {
    localStorage.removeItem(`mogege_user_data_v2_${targetUserId}`);
  } catch (err) {
    console.error('Failed to remove user data:', err);
  }

  // 6. 만약 현재 로그인된 세션이 삭제된 회원이면 로그아웃
  const currentSession = getSavedSession();
  if (currentSession && currentSession.user.id.toLowerCase() === cleanTargetId) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
};
