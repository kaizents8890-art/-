import React, { useState } from 'react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  HeartPulse,
  Target,
  Coins,
  Check,
  X,
  MapPin,
  Search,
  ChevronDown,
  ShieldAlert,
  RotateCw
} from 'lucide-react';
import { login, isIdAvailable, registerNewAccount, AuthSession } from '../services/authService';
import { UserProfile, MedicalGoal } from '../types';
import { SIDO_LIST, getSigunguList, formatRegion } from '../data/koreaDistricts';
import { POPULAR_BREEDS, filterBreeds } from '../data/dogBreeds';
import { createInitialDataForNewUser, saveUserData } from '../services/userService';

const MACRO_CAPTCHA_POOL = [
  { question: '15 더하기 28은 얼마입니까?', answer: '43', hint: '숫자로만 입력하세요' },
  { question: '강아지가 내는 대표적인 소리는? (멍멍/야옹)', answer: '멍멍', hint: '멍멍 또는 야옹 입력' },
  { question: '34 더하기 19는 얼마입니까?', answer: '53', hint: '숫자로만 입력하세요' },
  { question: '모으개 서비스의 첫 글자는 무엇입니까?', answer: '모', hint: '한 글자 입력' },
  { question: '7 곱하기 6은 얼마입니까?', answer: '42', hint: '구구단 정답 입력' },
  { question: '50 빼기 18은 얼마입니까?', answer: '32', hint: '숫자로만 입력하세요' },
  { question: '대한민국의 수도는 어디입니까?', answer: '서울', hint: '두 글자 입력' },
];

interface LoginScreenProps {
  onLoginSuccess: (
    session: AuthSession,
    customProfile?: Partial<UserProfile>,
    initialPoints?: number,
    initialGoal?: MedicalGoal
  ) => void;
}

// 10 Disease Categories specified by user
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

interface TermModalContent {
  title: string;
  type: string;
  content: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [signupStep, setSignupStep] = useState<'form' | 'goal_setup'>('form');

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Macro Prevention CAPTCHA State (Requirement: 5 consecutive failed passwords triggers security challenge)
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    const saved = localStorage.getItem('mogege_login_failed_count');
    return saved ? parseInt(saved, 10) || 0 : 0;
  });
  const [captchaIndex, setCaptchaIndex] = useState(0);
  const [captchaInput, setCaptchaInput] = useState('');

  // Signup form state
  // Account
  const [signupId, setSignupId] = useState('');
  const [signupPw, setSignupPw] = useState('');
  const [signupPwConfirm, setSignupPwConfirm] = useState('');

  // Guardian info
  const [guardianName, setGuardianName] = useState('');
  const [selectedSido, setSelectedSido] = useState('');
  const [selectedSigungu, setSelectedSigungu] = useState('');
  const [guardianAge, setGuardianAge] = useState<number | ''>(''); // (선택)
  const [hasCohabitant, setHasCohabitant] = useState<boolean>(true); // (선택)

  // Pet info
  const [petName, setPetName] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [breedSearchQuery, setBreedSearchQuery] = useState('');
  const [isBreedDropdownOpen, setIsBreedDropdownOpen] = useState(false);
  const [isCustomBreedInput, setIsCustomBreedInput] = useState(false);
  const [petAge, setPetAge] = useState<number | ''>('');
  const [petWeight, setPetWeight] = useState<number | ''>(''); // (선택)
  const [petGender, setPetGender] = useState<'수컷' | '암컷'>('수컷'); // (필수!)
  const [neuteredStatus, setNeuteredStatus] = useState<'중성화 완료' | '중성화하지 않음' | '모름'>('중성화 완료');

  // Health info
  const [hasCondition, setHasCondition] = useState<'있음' | '없음' | '모름'>('없음');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [conditionDetail, setConditionDetail] = useState('');
  const [medications, setMedications] = useState('');
  const [healthNotes, setHealthNotes] = useState('');
  const [regularCheckupRecord, setRegularCheckupRecord] = useState('');

  // Agreements state
  const [agreeAll, setAgreeAll] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false); // 필수
  const [agreePrivacy, setAgreePrivacy] = useState(false); // 필수
  const [agreePoints, setAgreePoints] = useState(false); // 필수
  const [agreeThirdParty, setAgreeThirdParty] = useState(false); // 선택
  const [agreeLocation, setAgreeLocation] = useState(false); // 선택
  const [agreeMarketing, setAgreeMarketing] = useState(false); // 선택

  // Term detail modal state
  const [activeTermModal, setActiveTermModal] = useState<TermModalContent | null>(null);

  // Completed signup session cache to pass into goal setup step
  const [createdSession, setCreatedSession] = useState<AuthSession | null>(null);
  const [createdProfile, setCreatedProfile] = useState<Partial<UserProfile> | null>(null);

  // Goal setup state
  const [goalCategoryChoice, setGoalCategoryChoice] = useState<
    '응급진료비 대비' | '정기검진비' | '예방접종비' | '수술비 대비' | '기타 목표'
  >('응급진료비 대비');
  const [goalTitle, setGoalTitle] = useState('응급진료비 대비');
  const [goalTargetAmount, setGoalTargetAmount] = useState(300000);

  // Available sigungu list based on selected sido
  const availableSigunguList = selectedSido ? getSigunguList(selectedSido) : [];

  // Toggle category helper
  const handleToggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  // Agreement 'Select All' toggle
  const handleToggleAgreeAll = (checked: boolean) => {
    setAgreeAll(checked);
    setAgreeTerms(checked);
    setAgreePrivacy(checked);
    setAgreePoints(checked);
    setAgreeThirdParty(checked);
    setAgreeLocation(checked);
    setAgreeMarketing(checked);
  };

  // Sync agreeAll state
  const checkAgreeAllState = (
    terms: boolean,
    privacy: boolean,
    points: boolean,
    thirdParty: boolean,
    location: boolean,
    marketing: boolean
  ) => {
    const all = terms && privacy && points && thirdParty && location && marketing;
    setAgreeAll(all);
  };

  // Term Modal Contents
  const termDetails: Record<string, TermModalContent> = {
    terms: {
      title: '서비스 이용약관',
      type: '(필수)',
      content:
        '제1조 (목적)\n본 약관은 모으개(MOGEGAE)가 제공하는 반려동물 헬스케어 및 리워드 서비스의 이용과 관련하여 회사와 회원의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.\n\n제2조 (회원의 의무)\n회원은 반려동물의 올바른 건강 데이터 및 산책 기록을 성실히 관리하여야 하며, 비정상적인 방법으로 포인트를 부정 취득할 경우 서비스 이용이 제한될 수 있습니다.',
    },
    privacy: {
      title: '개인정보 수집 및 이용 동의',
      type: '(필수)',
      content:
        '1. 수집 항목: 이름, 아이디, 비밀번호, 거주 지역(시·도 및 시·군·구), 반려동물 기본 정보(견종, 나이, 체중, 성별, 건강상태)\n2. 수집 목적: 회원 가입 식별, AI 맞춤 산책량 계산, 주변 제휴 동물병원 연계 및 리워드 지급\n3. 보유 기간: 회원 탈퇴 시까지 (관계 법령에 따름)',
    },
    points: {
      title: '리워드 및 포인트 운영정책 동의',
      type: '(필수)',
      content:
        '1. 포인트 적립: 출석체크, AI 맞춤 산책 미션, 병원 영수증 인증 등을 통해 적립됩니다.\n2. 신규 가입 혜택: 신규 회원에게는 가입 축하 포인트 2,000P가 1회 지급됩니다.\n3. 목표 적립: 보유 포인트 중 원하는 금액을 특정 의료비 목표에 자유롭게 배분하여 적립할 수 있습니다.\n4. 포인트 사용: 1P는 현금 1원의 가치를 지니며, 제휴 동물병원 진료비 바우처 및 공식 반려용품 구매에 사용할 수 있습니다.',
    },
    thirdParty: {
      title: '개인정보 제3자 제공 동의',
      type: '(선택)',
      content:
        '1. 제공받는 자: 모으개 제휴 동물병원 및 공식 협력 브랜드몰\n2. 제공 목적: 진료비 바우처 현장 할인 적용, 검진 내역 전자의무기록 연계, 용품 주문 배송\n3. 제공 항목: 보호자 성함, 거주 지역, 반려견 이름 및 견종',
    },
    location: {
      title: '위치정보 수집 및 이용 동의',
      type: '(선택)',
      content:
        '1. 이용 목적: 실시간 산책 경로 궤적 기록(GPS), 주행 거리 측정, 거주 지역 기반 가장 가까운 24시 응급 동물병원 안내\n2. 보유 및 이용: 산책 트래킹 세션 완료 후 산책 기록 보관함에 암호화 저장',
    },
    marketing: {
      title: '마케팅 정보 수신 동의',
      type: '(선택)',
      content:
        '1. 수신 내용: 계절별 맞춤 백신 접종 프로모션, 제휴 동물병원 진료 할인 이벤트, 신규 용품 혜택 소식\n2. 수신 채널: 앱 내 푸시 알림, SMS, 이메일\n* 동의하지 않으셔도 기본 헬스케어 및 산책 리워드 서비스는 정상 이용 가능합니다.',
    },
  };

  // Handle Login Submit with Macro Prevention
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // If failedAttempts >= 5, enforce macro prevention question
    if (failedAttempts >= 5) {
      const currentCaptcha = MACRO_CAPTCHA_POOL[captchaIndex % MACRO_CAPTCHA_POOL.length];
      if (!captchaInput.trim()) {
        setErrorMessage('비정상 접근 방지를 위한 보안 확인(매크로 방지 질문)의 답변을 입력해 주세요.');
        return;
      }
      if (captchaInput.trim().toLowerCase() !== currentCaptcha.answer.toLowerCase()) {
        setErrorMessage('매크로 방지 질문의 정답이 올바르지 않습니다. 다시 확인 후 입력해 주세요.');
        setCaptchaIndex((prev) => (prev + 1) % MACRO_CAPTCHA_POOL.length);
        setCaptchaInput('');
        return;
      }
    }

    setIsLoading(true);

    try {
      await new Promise((res) => setTimeout(res, 200));
      const session = await login(username, password);

      // Reset failure count upon successful login
      setFailedAttempts(0);
      localStorage.removeItem('mogege_login_failed_count');
      setCaptchaInput('');

      onLoginSuccess(session);
    } catch (err: any) {
      const nextFailures = failedAttempts + 1;
      setFailedAttempts(nextFailures);
      localStorage.setItem('mogege_login_failed_count', String(nextFailures));

      if (nextFailures >= 5) {
        setErrorMessage(
          `비밀번호를 ${nextFailures}회 연속 잘못 입력하셨습니다. 비정상 접근(매크로) 방지를 위해 보안 확인 질문에 올바르게 답변해야 로그인이 가능합니다.`
        );
      } else {
        setErrorMessage(
          `${err.message || '아이디 또는 비밀번호가 일치하지 않습니다.'} (연속 실패: ${nextFailures}/5회)`
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Signup Submit (Form Validation & Transition to Goal Setup)
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanId = signupId.trim();
    if (!cleanId) {
      setErrorMessage('아이디를 입력해 주세요.');
      return;
    }

    if (!isIdAvailable(cleanId)) {
      setErrorMessage('이미 사용 중인 아이디입니다. 다른 아이디를 입력해 주세요.');
      return;
    }

    if (!signupPw) {
      setErrorMessage('비밀번호를 입력해 주세요.');
      return;
    }

    if (signupPw !== signupPwConfirm) {
      setErrorMessage('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    if (!guardianName.trim()) {
      setErrorMessage('보호자 이름을 입력해 주세요.');
      return;
    }

    if (!selectedSido || !selectedSigungu) {
      setErrorMessage('거주 지역의 시·도와 시·군·구를 모두 선택해 주세요.');
      return;
    }

    if (!petName.trim()) {
      setErrorMessage('반려견 이름을 입력해 주세요.');
      return;
    }

    if (!petBreed.trim()) {
      setErrorMessage('반려견 견종을 입력해 주세요.');
      return;
    }

    if (petAge === '') {
      setErrorMessage('반려견 나이를 입력해 주세요.');
      return;
    }

    if (!petGender) {
      setErrorMessage('반려견 성별을 선택해 주세요.');
      return;
    }

    if (!agreeTerms || !agreePrivacy || !agreePoints) {
      setErrorMessage('서비스 이용을 위해 필수 약관 3가지에 모두 동의해 주세요.');
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((res) => setTimeout(res, 250));

      const combinedRegion = formatRegion(selectedSido, selectedSigungu);

      const newAccount = {
        id: cleanId,
        password: signupPw.trim(),
        name: guardianName.trim(),
        role: 'professor' as const,
        description: '신규 가입 회원',
        avatar: '👤',
      };

      // 1. Register new account into persistent account registry
      registerNewAccount(newAccount);

      const newSession: AuthSession = {
        user: {
          id: cleanId,
          name: guardianName.trim(),
          role: 'professor',
          avatar: '👤',
        },
        token: `token_${cleanId}_${Date.now()}`,
        loginTime: new Date().toISOString(),
      };

      // Summary condition string for quick badges
      let conditionSummary = '특이 지병 없음 (건강)';
      if (hasCondition === '있음') {
        const parts = [];
        if (selectedCategories.length > 0) parts.push(selectedCategories.join(', '));
        if (conditionDetail.trim()) parts.push(conditionDetail.trim());
        conditionSummary = parts.length > 0 ? parts.join(' - ') : '관리 중인 지병 있음';
      } else if (hasCondition === '모름') {
        conditionSummary = '지병 여부 확인 필요 (검진 권장)';
      }

      const customProfile: Partial<UserProfile> = {
        id: cleanId,
        guardianName: guardianName.trim(),
        guardianRegion: combinedRegion,
        guardianAge: guardianAge === '' ? undefined : Number(guardianAge),
        hasCohabitant,
        cohabitantStatus: hasCohabitant ? '있음 (가족·동거인과 함께 돌봄)' : '없음 (혼자 돌봄)',
        petName: petName.trim(),
        petBreed: petBreed.trim(),
        petAge: Number(petAge),
        petWeight: petWeight === '' ? 4.0 : Number(petWeight),
        petGender,
        neuteredStatus,
        petIsNeutered: neuteredStatus === '중성화 완료',
        hasCondition,
        conditionCategories: selectedCategories,
        conditionDetail: conditionDetail.trim() || undefined,
        medications: medications.trim() || undefined,
        healthNotes: healthNotes.trim() || undefined,
        petCondition: conditionSummary,
        regularCheckupRecord: regularCheckupRecord.trim() || '최근 검진 기록 없음',
        profileImage: '🐶',
      };

      setCreatedSession(newSession);
      setCreatedProfile(customProfile);

      // Move to Step 2: Goal Setup!
      setSignupStep('goal_setup');
    } catch (err: any) {
      setErrorMessage(err.message || '회원가입 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // Change goal category choice helper
  const handleSelectGoalCategory = (choice: typeof goalCategoryChoice) => {
    setGoalCategoryChoice(choice);
    setGoalTitle(choice);
    switch (choice) {
      case '응급진료비 대비':
        setGoalTargetAmount(300000);
        break;
      case '정기검진비':
        setGoalTargetAmount(150000);
        break;
      case '예방접종비':
        setGoalTargetAmount(50000);
        break;
      case '수술비 대비':
        setGoalTargetAmount(800000);
        break;
      case '기타 목표':
        setGoalTargetAmount(200000);
        break;
    }
  };

  // Finish Goal Setup and enter app (starting amount is strictly 0P!)
  const handleCompleteGoalSetup = () => {
    if (!createdSession || !createdProfile) return;

    let catType: MedicalGoal['category'] = '기타';
    if (goalCategoryChoice === '응급진료비 대비') catType = '응급진료비';
    else if (goalCategoryChoice === '정기검진비') catType = '정기검진';
    else if (goalCategoryChoice === '예방접종비') catType = '예방접종';
    else if (goalCategoryChoice === '수술비 대비') catType = '수술비';

    const newGoal: MedicalGoal = {
      id: `goal_${Date.now()}`,
      title: goalTitle.trim() || goalCategoryChoice,
      category: catType,
      targetAmount: Number(goalTargetAmount) || 300000,
      currentAmount: 0, // Requirement 3: 목표 시작 적립액은 무조건 0P로 시작
      isPrimary: true,
      description: `${createdProfile.petName || '반려견'}을(를) 위한 맞춤 의료비 적립 플랜`,
    };

    // Save initial user data to per-user localStorage storage
    const initialUserData = createInitialDataForNewUser(createdSession.user.id, createdProfile, newGoal);
    saveUserData(createdSession.user.id, initialUserData);

    // Save session to localStorage so refresh keeps them logged in
    localStorage.setItem('mogege_auth_session_v2', JSON.stringify(createdSession));

    onLoginSuccess(createdSession, createdProfile, 2000, newGoal);
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center p-4 sm:p-6 py-10">
      {/* Subtle soft warmth glow */}
      <div className="fixed top-12 left-1/4 w-72 h-72 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-12 right-1/4 w-80 h-80 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className={`w-full ${mode === 'signup' ? 'max-w-xl' : 'max-w-md'} relative z-10 space-y-6 animate-fadeIn transition-all duration-300`}>
        {/* Brand Header with Moeugae Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white shadow-sm mb-1 hover:scale-105 transition-transform p-2.5">
            <img
              src="/assets/aistudio/mogege_brand_logo.png"
              alt="모으개 로고"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight flex items-center justify-center gap-2 whitespace-nowrap">
            <span>모으개</span>
            <span className="text-amber-600 font-extrabold text-xl">MOGEGAE</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-medium">
            반려동물 건강 맞춤 산책 & 병원비 리워드 서비스
          </p>
        </div>

        {/* Main Card (Login / Signup Toggle) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          {/* Tabs (Hidden during goal setup step) */}
          {signupStep !== 'goal_setup' && (
            <div className="flex items-center gap-1 p-1 bg-stone-50 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                로그인
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                신규 회원가입 (+2,000P)
              </button>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold">안내: </span>
                {errorMessage}
              </div>
            </div>
          )}

          {/* =========================================
              MODE 1: LOGIN FORM
              ========================================= */}
          {mode === 'login' && signupStep !== 'goal_setup' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  아이디
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="아이디를 입력하세요"
                    autoComplete="username"
                    className="w-full pl-10 pr-3.5 py-3 bg-stone-50 rounded-2xl text-sm placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  비밀번호
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="비밀번호를 입력하세요"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-3 bg-stone-50 rounded-2xl text-sm placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                    tabIndex={-1}
                    title={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Macro Prevention Security Challenge when 5 consecutive failures occur */}
              {failedAttempts >= 5 && (
                <div className="p-4 bg-orange-50/90 border border-orange-200 rounded-2xl space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-orange-950">
                      <ShieldAlert className="w-4 h-4 text-orange-600 shrink-0" />
                      <span>매크로 방지 보안 질문 (연속 {failedAttempts}회 실패)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCaptchaIndex((prev) => (prev + 1) % MACRO_CAPTCHA_POOL.length);
                        setCaptchaInput('');
                      }}
                      className="text-[11px] text-orange-700 hover:text-orange-950 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      title="새로운 보안 질문으로 변경"
                    >
                      <RotateCw className="w-3 h-3" />
                      <span>질문 새로고침</span>
                    </button>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-orange-100 flex items-center justify-between shadow-2xs">
                    <div className="pr-2">
                      <span className="text-[10px] font-bold text-orange-600 block mb-0.5">
                        보안 확인 챌린지
                      </span>
                      <p className="text-xs font-bold text-stone-900 leading-snug">
                        Q. {MACRO_CAPTCHA_POOL[captchaIndex % MACRO_CAPTCHA_POOL.length].question}
                      </p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-base shrink-0 select-none">
                      🔒
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      정답 입력{' '}
                      <span className="text-stone-400 font-normal">
                        ({MACRO_CAPTCHA_POOL[captchaIndex % MACRO_CAPTCHA_POOL.length].hint})
                      </span>
                    </label>
                    <input
                      type="text"
                      value={captchaInput}
                      onChange={(e) => {
                        setCaptchaInput(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder="질문의 정답을 정확히 입력하세요"
                      className="w-full px-3.5 py-2.5 bg-white border border-orange-200 rounded-xl text-xs placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                    />
                  </div>
                  <p className="text-[10px] text-orange-800/80 leading-tight">
                    * 비정상 접근 방지를 위해 질문의 정답을 올바르게 입력해야 로그인이 진행됩니다.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-300 text-white font-bold text-sm rounded-2xl transition-all shadow-sm active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <span>로그인 확인 중...</span>
                ) : (
                  <>
                    <span>로그인</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMessage(null);
                  }}
                  className="text-xs text-stone-500 hover:text-amber-600 font-medium transition-colors cursor-pointer"
                >
                  아직 회원이 아니신가요? <strong className="text-amber-600 underline underline-offset-2">신규 회원가입</strong>
                </button>
              </div>
            </form>
          ) : signupStep === 'form' ? (
            /* =========================================
               MODE 2: SIGNUP FORM
               ========================================= */
            <form onSubmit={handleSignupSubmit} className="space-y-5 max-h-[72vh] overflow-y-auto pr-1">
              {/* Header Box */}
              <div className="bg-amber-50/70 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 text-sm font-bold shadow-2xs">
                  ✨
                </div>
                <div>
                  <h3 className="text-sm font-bold text-amber-950">맞춤 케어 프로필 등록</h3>
                  <p className="text-xs text-amber-800/90 mt-1 leading-relaxed">
                    보호자와 반려동물 정보를 입력하면 AI가 반려동물의 특성에 맞는 산책 목표와 의료비 관리 계획을 추천합니다.
                  </p>
                </div>
              </div>

              {/* 1. Account Credentials */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-stone-900 block">계정 정보</span>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    아이디 <span className="text-amber-600 font-bold">(필수)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={signupId}
                    onChange={(e) => {
                      setSignupId(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="로그인에 사용할 아이디"
                    className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      비밀번호 <span className="text-amber-600 font-bold">(필수)</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={signupPw}
                      onChange={(e) => setSignupPw(e.target.value)}
                      placeholder="비밀번호"
                      className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      비밀번호 확인 <span className="text-amber-600 font-bold">(필수)</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={signupPwConfirm}
                      onChange={(e) => setSignupPwConfirm(e.target.value)}
                      placeholder="비밀번호 재입력"
                      className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Guardian Info (보호자 정보) */}
              <div className="pt-3 border-t border-stone-100 space-y-3">
                <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-600" />
                  <span>보호자 정보</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      보호자 이름 <span className="text-amber-600 font-bold">(필수)</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      placeholder="예: 홍길동"
                      className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      보호자 나이 <span className="text-stone-400 font-medium">(선택)</span>
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={120}
                      value={guardianAge}
                      onChange={(e) => setGuardianAge(e.target.value ? Number(e.target.value) : '')}
                      placeholder="예: 29 (선택사항)"
                      className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                </div>

                {/* Requirement 6: 2-step cascading dropdown for Guardian Region */}
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    거주 지역 <span className="text-amber-600 font-bold">(필수)</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* 1차: 시·도 선택 (17개 광역자치단체) */}
                    <div>
                      <select
                        value={selectedSido}
                        onChange={(e) => {
                          setSelectedSido(e.target.value);
                          setSelectedSigungu(''); // Reset sigungu when sido changes
                        }}
                        className="w-full px-3 py-2.5 bg-stone-50 rounded-xl text-xs font-medium text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
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

                    {/* 2차: 시·군·구 선택 (동적 바인딩) */}
                    <div>
                      <select
                        value={selectedSigungu}
                        onChange={(e) => setSelectedSigungu(e.target.value)}
                        disabled={!selectedSido}
                        className={`w-full px-3 py-2.5 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all ${
                          selectedSido
                            ? 'bg-stone-50 text-stone-800 focus:bg-white cursor-pointer'
                            : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                        }`}
                        required
                      >
                        <option value="">
                          {selectedSido ? '시·군·구 선택' : '시·도를 먼저 선택해 주세요'}
                        </option>
                        {availableSigunguList.map((sigungu) => (
                          <option key={sigungu} value={sigungu}>
                            {sigungu}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {selectedSido && selectedSigungu && (
                    <div className="mt-1.5 text-[11px] text-amber-700 font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-600" />
                      <span>선택된 지역: <strong>{selectedSido} {selectedSigungu}</strong></span>
                    </div>
                  )}
                </div>

                {/* '함께 반려동물을 돌보는 사람이 있나요?' */}
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1.5">
                    함께 반려동물을 돌보는 사람이 있나요? <span className="text-stone-400 font-medium">(선택)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setHasCohabitant(true)}
                      className={`py-2.5 px-3 text-xs rounded-xl text-center transition-all cursor-pointer ${
                        hasCohabitant
                          ? 'bg-amber-500 text-white font-bold shadow-xs'
                          : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      있음 (가족·동거인과 함께 돌봄)
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasCohabitant(false)}
                      className={`py-2.5 px-3 text-xs rounded-xl text-center transition-all cursor-pointer ${
                        !hasCohabitant
                          ? 'bg-amber-500 text-white font-bold shadow-xs'
                          : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      없음 (혼자 돌봄)
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. Pet Info & Health Info (반려동물 및 건강정보) */}
              <div className="pt-3 border-t border-stone-100 space-y-3.5">
                <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                  <span>반려동물 정보</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      반려견 이름 <span className="text-amber-600 font-bold">(필수)</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                      placeholder="예: 초코"
                      className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-medium text-stone-700">
                        견종 <span className="text-amber-600 font-bold">(필수)</span>
                      </label>
                      {isCustomBreedInput ? (
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomBreedInput(false);
                            setIsBreedDropdownOpen(true);
                          }}
                          className="text-[11px] text-amber-600 font-semibold hover:underline cursor-pointer"
                        >
                          목록에서 선택
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomBreedInput(true);
                            setIsBreedDropdownOpen(false);
                          }}
                          className="text-[11px] text-stone-400 hover:text-stone-600 font-medium cursor-pointer"
                        >
                          직접 입력
                        </button>
                      )}
                    </div>

                    {isCustomBreedInput ? (
                      <div>
                        <input
                          type="text"
                          required
                          value={petBreed}
                          onChange={(e) => setPetBreed(e.target.value)}
                          placeholder="견종명을 직접 입력하세요 (예: 믹스견, 꼬똥 드 툴레아)"
                          className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                        />
                        <p className="text-[10px] text-stone-400 mt-1">
                          목록에 없는 견종은 직접 입력해 주세요.
                        </p>
                      </div>
                    ) : (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsBreedDropdownOpen((prev) => !prev)}
                          className="w-full px-3.5 py-2.5 bg-stone-50 hover:bg-stone-100/80 rounded-xl text-xs flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-colors cursor-pointer"
                        >
                          <span className={petBreed ? 'font-bold text-stone-900' : 'text-stone-400'}>
                            {petBreed || '견종을 검색하거나 선택하세요'}
                          </span>
                          <ChevronDown className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        </button>

                        {/* Hidden required input for form validation */}
                        <input
                          type="text"
                          required
                          value={petBreed}
                          onChange={() => {}}
                          className="opacity-0 absolute h-0 w-0 pointer-events-none"
                          tabIndex={-1}
                        />

                        {/* Dropdown Menu */}
                        {isBreedDropdownOpen && (
                          <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white rounded-2xl shadow-xl p-3 space-y-2 border border-stone-100 max-h-72 overflow-y-auto animate-fadeIn">
                            {/* Search Box */}
                            <div className="relative">
                              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                              <input
                                type="text"
                                value={breedSearchQuery}
                                onChange={(e) => setBreedSearchQuery(e.target.value)}
                                placeholder="견종 검색 (예: 푸들, 말티즈, 리트리버)..."
                                className="w-full pl-8 pr-3 py-1.5 bg-stone-50 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                                autoFocus
                              />
                            </div>

                            {/* Popular Quick Chips */}
                            {!breedSearchQuery && (
                              <div className="space-y-1 pt-1">
                                <span className="text-[10px] text-stone-400 font-semibold block">인기 견종 빠른 선택</span>
                                <div className="flex flex-wrap gap-1">
                                  {['말티즈', '푸들', '포메라니안', '비숑 프리제', '시바견', '믹스견'].map((brd) => (
                                    <button
                                      key={brd}
                                      type="button"
                                      onClick={() => {
                                        setPetBreed(brd);
                                        setIsBreedDropdownOpen(false);
                                      }}
                                      className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                                        petBreed === brd
                                          ? 'bg-amber-500 text-white font-bold'
                                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                                      }`}
                                    >
                                      {brd}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Breeds List */}
                            <div className="divide-y divide-stone-50 pt-1">
                              {filterBreeds(breedSearchQuery).map((b) => (
                                <button
                                  key={b.id}
                                  type="button"
                                  onClick={() => {
                                    if (b.id === 'other') {
                                      setIsCustomBreedInput(true);
                                      setPetBreed('');
                                    } else {
                                      setPetBreed(b.name);
                                    }
                                    setIsBreedDropdownOpen(false);
                                    setBreedSearchQuery('');
                                  }}
                                  className={`w-full py-2 px-2.5 rounded-xl text-left text-xs flex items-center justify-between hover:bg-amber-50/70 transition-colors cursor-pointer ${
                                    petBreed === b.name ? 'bg-amber-50 font-bold text-amber-900' : 'text-stone-700'
                                  }`}
                                >
                                  <span>{b.name}</span>
                                  <span className="text-[10px] text-stone-400 bg-stone-100 px-1.5 py-0.2 rounded font-normal">
                                    {b.size}
                                  </span>
                                </button>
                              ))}

                              {filterBreeds(breedSearchQuery).length === 0 && (
                                <div className="py-4 text-center">
                                  <p className="text-xs text-stone-500">일치하는 견종이 없습니다.</p>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsCustomBreedInput(true);
                                      setPetBreed(breedSearchQuery);
                                      setIsBreedDropdownOpen(false);
                                    }}
                                    className="text-xs text-amber-600 font-bold mt-1 hover:underline cursor-pointer"
                                  >
                                    '{breedSearchQuery}' 직접 입력하기
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      나이 (세) <span className="text-amber-600 font-bold">(필수)</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={30}
                      value={petAge}
                      onChange={(e) => setPetAge(e.target.value ? Number(e.target.value) : '')}
                      placeholder="예: 4"
                      className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      몸무게 (kg) <span className="text-stone-400 font-medium">(선택)</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={petWeight}
                      onChange={(e) => setPetWeight(e.target.value ? Number(e.target.value) : '')}
                      placeholder="3.8"
                      className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  {/* Requirement 5: Pet Gender is MANDATORY '(필수)' */}
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      성별 <span className="text-amber-600 font-bold">(필수)</span>
                    </label>
                    <div className="grid grid-cols-2 gap-1 bg-stone-50 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setPetGender('수컷')}
                        className={`py-1.5 text-xs rounded-lg transition-all cursor-pointer ${
                          petGender === '수컷' ? 'bg-amber-500 text-white font-bold shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        수컷
                      </button>
                      <button
                        type="button"
                        onClick={() => setPetGender('암컷')}
                        className={`py-1.5 text-xs rounded-lg transition-all cursor-pointer ${
                          petGender === '암컷' ? 'bg-amber-500 text-white font-bold shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        암컷
                      </button>
                    </div>
                  </div>
                </div>

                {/* 중성화 여부 (선택) */}
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1.5">
                    중성화 여부 <span className="text-stone-400 font-medium">(선택)</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['중성화 완료', '중성화하지 않음', '모름'] as const).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setNeuteredStatus(status)}
                        className={`py-2 px-2 text-xs rounded-xl text-center transition-all cursor-pointer ${
                          neuteredStatus === status
                            ? 'bg-stone-900 text-white font-bold shadow-xs'
                            : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 지병 여부 (있음 / 없음 / 모름) */}
                <div className="pt-2">
                  <label className="block text-xs font-medium text-stone-700 mb-1.5">
                    지병 여부 <span className="text-amber-600 font-bold">(필수)</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['있음', '없음', '모름'] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setHasCondition(opt);
                          if (opt !== '있음') {
                            setSelectedCategories([]);
                          }
                        }}
                        className={`py-2 px-2 text-xs rounded-xl text-center transition-all cursor-pointer ${
                          hasCondition === opt
                            ? opt === '있음'
                              ? 'bg-rose-500 text-white font-bold shadow-xs'
                              : 'bg-amber-500 text-white font-bold shadow-xs'
                            : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* When '있음' is selected, show disease categories & detail fields */}
                {hasCondition === '있음' && (
                  <div className="bg-rose-50/50 rounded-2xl p-4 space-y-3.5 animate-fadeIn">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-rose-950">
                          질병 종류 <span className="text-[11px] font-normal text-rose-700">(복수 선택 가능)</span>
                        </span>
                        <span className="text-[11px] text-rose-600 font-medium">
                          {selectedCategories.length}개 선택됨
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {DISEASE_CATEGORIES.map((cat) => {
                          const isSel = selectedCategories.includes(cat);
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => handleToggleCategory(cat)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                                isSel
                                  ? 'bg-rose-500 text-white font-bold shadow-2xs'
                                  : 'bg-white text-stone-700 hover:bg-rose-100/60'
                              }`}
                            >
                              {cat}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-1">
                      <span className="text-xs font-bold text-rose-950 block">세부 건강정보 (직접 입력)</span>
                      <div>
                        <label className="block text-[11px] text-stone-600 mb-1">
                          세부 질병명 <span className="text-stone-400 font-medium">(선택)</span>
                        </label>
                        <input
                          type="text"
                          value={conditionDetail}
                          onChange={(e) => setConditionDetail(e.target.value)}
                          placeholder="예: 슬개골 탈구 2기, 아토피성 피부염"
                          className="w-full px-3 py-2 bg-white rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-rose-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-stone-600 mb-1">
                          복용 중인 약물 <span className="text-stone-400 font-medium">(선택)</span>
                        </label>
                        <input
                          type="text"
                          value={medications}
                          onChange={(e) => setMedications(e.target.value)}
                          placeholder="예: 관절 영양제(글루코사민), 처방 소염제"
                          className="w-full px-3 py-2 bg-white rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-rose-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-stone-600 mb-1">
                          기타 특이사항 <span className="text-stone-400 font-medium">(선택)</span>
                        </label>
                        <input
                          type="text"
                          value={healthNotes}
                          onChange={(e) => setHealthNotes(e.target.value)}
                          placeholder="예: 무리한 점프 금지, 계단 피하기"
                          className="w-full px-3 py-2 bg-white rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-rose-400"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    최근 정기검진 기록 <span className="text-stone-400 font-medium">(선택)</span>
                  </label>
                  <input
                    type="text"
                    value={regularCheckupRecord}
                    onChange={(e) => setRegularCheckupRecord(e.target.value)}
                    placeholder="예: 2024년 10월 종합검진 완료 (마포 센트럴)"
                    className="w-full px-3.5 py-2.5 bg-stone-50 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              {/* 4. Terms and Agreements Section */}
              <div className="pt-3 border-t border-stone-100 space-y-3">
                <span className="text-xs font-bold text-stone-900 block">약관 및 개인정보 동의</span>

                {/* Agree All Checkbox */}
                <div className="p-3 bg-stone-50 rounded-2xl flex items-center justify-between">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeAll}
                      onChange={(e) => handleToggleAgreeAll(e.target.checked)}
                      className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-stone-900">전체 동의합니다.</span>
                  </label>
                  <span className="text-[11px] text-stone-400">필수 및 선택 항목 포함</span>
                </div>

                {/* Individual Checkboxes */}
                <div className="space-y-2 text-xs text-stone-700 px-1">
                  <div className="flex items-center justify-between py-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => {
                          setAgreeTerms(e.target.checked);
                          checkAgreeAllState(e.target.checked, agreePrivacy, agreePoints, agreeThirdParty, agreeLocation, agreeMarketing);
                        }}
                        className="w-3.5 h-3.5 rounded accent-amber-500"
                      />
                      <span>
                        서비스 이용약관 동의 <strong className="text-amber-600">(필수)</strong>
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setActiveTermModal(termDetails.terms)}
                      className="text-[11px] text-stone-400 hover:text-stone-700 underline"
                    >
                      자세히 보기
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreePrivacy}
                        onChange={(e) => {
                          setAgreePrivacy(e.target.checked);
                          checkAgreeAllState(agreeTerms, e.target.checked, agreePoints, agreeThirdParty, agreeLocation, agreeMarketing);
                        }}
                        className="w-3.5 h-3.5 rounded accent-amber-500"
                      />
                      <span>
                        개인정보 수집 및 이용 동의 <strong className="text-amber-600">(필수)</strong>
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setActiveTermModal(termDetails.privacy)}
                      className="text-[11px] text-stone-400 hover:text-stone-700 underline"
                    >
                      자세히 보기
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreePoints}
                        onChange={(e) => {
                          setAgreePoints(e.target.checked);
                          checkAgreeAllState(agreeTerms, agreePrivacy, e.target.checked, agreeThirdParty, agreeLocation, agreeMarketing);
                        }}
                        className="w-3.5 h-3.5 rounded accent-amber-500"
                      />
                      <span>
                        리워드 및 포인트 운영정책 동의 <strong className="text-amber-600">(필수)</strong>
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setActiveTermModal(termDetails.points)}
                      className="text-[11px] text-stone-400 hover:text-stone-700 underline"
                    >
                      자세히 보기
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-1 text-stone-500">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreeThirdParty}
                        onChange={(e) => {
                          setAgreeThirdParty(e.target.checked);
                          checkAgreeAllState(agreeTerms, agreePrivacy, agreePoints, e.target.checked, agreeLocation, agreeMarketing);
                        }}
                        className="w-3.5 h-3.5 rounded accent-amber-500"
                      />
                      <span>개인정보 제3자 제공 동의 (선택)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setActiveTermModal(termDetails.thirdParty)}
                      className="text-[11px] text-stone-400 hover:text-stone-700 underline"
                    >
                      자세히 보기
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-1 text-stone-500">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreeLocation}
                        onChange={(e) => {
                          setAgreeLocation(e.target.checked);
                          checkAgreeAllState(agreeTerms, agreePrivacy, agreePoints, agreeThirdParty, e.target.checked, agreeMarketing);
                        }}
                        className="w-3.5 h-3.5 rounded accent-amber-500"
                      />
                      <span>위치정보 수집 및 이용 동의 (선택)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setActiveTermModal(termDetails.location)}
                      className="text-[11px] text-stone-400 hover:text-stone-700 underline"
                    >
                      자세히 보기
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-1 text-stone-500">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreeMarketing}
                        onChange={(e) => {
                          setAgreeMarketing(e.target.checked);
                          checkAgreeAllState(agreeTerms, agreePrivacy, agreePoints, agreeThirdParty, agreeLocation, e.target.checked);
                        }}
                        className="w-3.5 h-3.5 rounded accent-amber-500"
                      />
                      <span>마케팅 정보 수신 동의 (선택)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setActiveTermModal(termDetails.marketing)}
                      className="text-[11px] text-stone-400 hover:text-stone-700 underline"
                    >
                      자세히 보기
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-300 text-white font-bold text-sm rounded-2xl transition-all shadow-sm active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <span>회원가입 처리 중...</span>
                  ) : (
                    <>
                      <span>맞춤 프로필 등록 완료 (+2,000P 받기)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className="text-xs text-stone-500 hover:text-stone-800 underline underline-offset-2 cursor-pointer"
                >
                  이미 계정이 있으신가요? <strong>로그인하기</strong>
                </button>
              </div>
            </form>
          ) : (
            /* =========================================
               STEP 2: GOAL SETUP STEP (Requirement 1 & 3)
               - 회원가입 축하 포인트 무조건 2,000P로 고정 (변경 불가)
               - 현재 보유 포인트는 2,000P로 표시
               - 목표 시작 적립액은 0P로 시작
               ========================================= */
            <div className="space-y-5 animate-fadeIn">
              {/* Success Badge */}
              <div className="bg-emerald-50 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 font-bold shadow-2xs">
                  <Coins className="w-5 h-5 text-amber-200" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span className="text-xs font-bold text-emerald-800">회원가입 축하 포인트 지급 완료</span>
                    <span className="text-xs font-black text-amber-700 bg-amber-100/90 border border-amber-300 px-2.5 py-0.5 rounded-full shadow-2xs">
                      보유 포인트: 2,000 P
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-stone-900 mt-1.5">
                    {createdProfile?.guardianName} 보호자님, 환영합니다!
                  </h3>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    가입 축하금 <strong>2,000P</strong>가 회원님의 보유 포인트로 안전하게 적립되었습니다. 마지막으로 우리 아이를 위한 첫 번째 의료비 목표를 설정해 주세요.
                  </p>
                </div>
              </div>

              {/* Goal Selection Card */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-900 mb-2">
                    의료비 목표 항목 선택 <span className="text-amber-600 font-semibold">(1개 선택)</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(
                      [
                        { id: '응급진료비 대비', desc: '야간/휴일 급성 질환 및 외상 대비' },
                        { id: '정기검진비', desc: '정기 혈액검사·초음파·방사선 검진' },
                        { id: '예방접종비', desc: '종합백신 및 광견병 접종 비용' },
                        { id: '수술비 대비', desc: '슬개골 탈구·치과 등 전문 수술 대비' },
                        { id: '기타 목표', desc: '자유롭게 설정하는 맞춤 목표' },
                      ] as const
                    ).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectGoalCategory(item.id)}
                        className={`p-3 rounded-2xl text-left transition-all cursor-pointer ${
                          goalCategoryChoice === item.id
                            ? 'bg-amber-50 text-amber-950 font-bold shadow-xs ring-2 ring-amber-400'
                            : 'bg-stone-50 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{item.id}</span>
                          {goalCategoryChoice === item.id && (
                            <Check className="w-3.5 h-3.5 text-amber-600" />
                          )}
                        </div>
                        <span className="text-[11px] text-stone-500 font-normal mt-0.5 block">
                          {item.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Goal Details Inputs */}
                <div className="bg-stone-50 rounded-2xl p-4 space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      목표 이름
                    </label>
                    <input
                      type="text"
                      value={goalTitle}
                      onChange={(e) => setGoalTitle(e.target.value)}
                      placeholder="목표 이름을 입력하세요"
                      className="w-full px-3.5 py-2.5 bg-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-stone-700">
                        목표 금액 (P)
                      </label>
                      <span className="text-xs font-black text-amber-600 tabular-nums">
                        {goalTargetAmount.toLocaleString()} P
                      </span>
                    </div>
                    <input
                      type="number"
                      step={10000}
                      value={goalTargetAmount}
                      onChange={(e) => setGoalTargetAmount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 tabular-nums"
                    />
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {[50000, 150000, 300000, 500000, 800000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setGoalTargetAmount(amt)}
                          className="px-2.5 py-1 bg-white hover:bg-amber-100 rounded-lg text-[11px] font-semibold text-stone-700 transition-colors shadow-2xs"
                        >
                          {(amt / 10000)}만P
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Confirm CTA */}
                <button
                  type="button"
                  onClick={handleCompleteGoalSetup}
                  className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <Target className="w-4 h-4 text-white" />
                  <span>목표 설정 완료하고 시작하기</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-[11px] text-stone-400">
          모으개(MOGEGAE) · 올인원 펫 헬스케어 & 리워드
        </div>
      </div>

      {/* Term Detail Modal */}
      {activeTermModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-600">{activeTermModal.type}</span>
                <h3 className="text-sm font-bold text-stone-900">{activeTermModal.title}</h3>
              </div>
              <button
                onClick={() => setActiveTermModal(null)}
                className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-stone-600 whitespace-pre-line leading-relaxed bg-stone-50 p-4 rounded-2xl">
              {activeTermModal.content}
            </div>

            <button
              onClick={() => setActiveTermModal(null)}
              className="w-full py-2.5 bg-stone-900 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
