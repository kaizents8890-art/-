import React, { useState } from 'react';
import {
  Home,
  Footprints,
  MessageSquare,
  Building2,
  User,
  Shield,
  Coins,
  LogOut,
  CheckCircle2,
  ShoppingCart
} from 'lucide-react';
import {
  TabType,
  UserProfile,
  AttendanceDay,
  WalkTarget,
  AiWalkRecommendation,
  MedicalGoal,
  PointTransaction,
  CommunityPost,
  EmergencyGuide,
  Hospital,
  RewardItem,
  MedicalCheckupRecord,
  WalkRecord,
  ShopOrder,
  CartItem,
  ProductReview
} from './types';
import {
  initialUserProfile,
  initialAttendanceDays,
  initialWalkTarget,
  initialAiWalkRecommendation,
  initialMedicalGoals,
  initialTransactions,
  initialCommunityPosts,
  initialEmergencyGuides,
  initialRewardItems,
  initialMedicalCheckupRecords,
  initialWalkRecords
} from './data/mockData';
import { initialShopOrders, initialProductReviews } from './data/shopData';
import { getRecommendedHospitalsForRegion } from './data/hospitalsData';
import { HomeView } from './components/HomeView';
import { MissionView } from './components/MissionView';
import { ShopView } from './components/ShopView';
import { CommunityView } from './components/CommunityView';
import { HospitalView } from './components/HospitalView';
import { MyPageView } from './components/MyPageView';
import { AdminView } from './components/AdminView';
import { LoginScreen } from './components/LoginScreen';
import { CartModal } from './components/CartModal';
import { GpsCollarModal } from './components/GpsCollarModal';
import { getSavedSession, logout as performLogout, AuthSession } from './services/authService';
import { getUserData, saveUserData, StoredUserData } from './services/userService';
import { triggerConfetti } from './utils/confetti';
import { getTodayDateString, generateRealAttendanceDays } from './utils/dateUtils';

export default function App() {
  // Authentication Session State (Initialized from localStorage for persistence across reloads)
  const [session, setSession] = useState<AuthSession | null>(() => getSavedSession());

  // Navigation State: Default to 'admin' if logged in as admin, otherwise 'home'
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const saved = getSavedSession();
    return saved?.user.role === 'admin' ? 'admin' : 'home';
  });
  const [activeSubTab, setActiveSubTab] = useState<string>('walking');

  // Application Data State - Loaded per logged-in user from localStorage
  const [initialData] = useState<StoredUserData | null>(() => {
    const saved = getSavedSession();
    return saved ? getUserData(saved.user.id, saved.user.name) : null;
  });

  const [user, setUser] = useState<UserProfile>(() => initialData?.user || initialUserProfile);
  const [points, setPoints] = useState<number>(() => (initialData ? initialData.points : 138500));
  const [dailyEarnedPoints, setDailyEarnedPoints] = useState<number>(() => (initialData ? initialData.dailyEarnedPoints : 120));
  const [attendanceHistory, setAttendanceHistory] = useState<string[]>(() => initialData?.attendanceHistory || []);
  const [lastAttendanceDate, setLastAttendanceDate] = useState<string | undefined>(() => initialData?.lastAttendanceDate);
  const [attendanceDays, setAttendanceDays] = useState<AttendanceDay[]>(() =>
    generateRealAttendanceDays(initialData?.attendanceHistory || [])
  );
  const [walkTarget, setWalkTarget] = useState<WalkTarget>(() => initialData?.walkTarget || initialWalkTarget);
  const [aiRecommendation, setAiRecommendation] = useState<AiWalkRecommendation>(initialAiWalkRecommendation);
  const [medicalGoals, setMedicalGoals] = useState<MedicalGoal[]>(() => initialData?.medicalGoals || initialMedicalGoals);
  const [transactions, setTransactions] = useState<PointTransaction[]>(() => initialData?.transactions || initialTransactions);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(initialCommunityPosts);
  const [emergencyGuides] = useState<EmergencyGuide[]>(initialEmergencyGuides);
  const [hospitals, setHospitals] = useState<Hospital[]>(() =>
    getRecommendedHospitalsForRegion(initialData?.user?.guardianRegion || initialUserProfile.guardianRegion)
  );
  const [rewards] = useState<RewardItem[]>(initialRewardItems);
  const [medicalRecords, setMedicalRecords] = useState<MedicalCheckupRecord[]>(() => initialData?.medicalRecords || initialMedicalCheckupRecords);
  const [walkRecords, setWalkRecords] = useState<WalkRecord[]>(() => initialData?.walkRecords || initialWalkRecords);
  const [orders, setOrders] = useState<ShopOrder[]>(() => initialData?.orders || initialShopOrders);

  // New Persistent States for Cart, Reviews, Custom Logo, Modals
  const [cart, setCart] = useState<CartItem[]>(() => initialData?.cart || []);
  const [reviews, setReviews] = useState<Record<string, ProductReview[]>>(() => initialData?.reviews || initialProductReviews);
  const [customLogo, setCustomLogo] = useState<string | undefined>(() => initialData?.customLogo);

  // Modal Visibility States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isGpsCollarModalOpen, setIsGpsCollarModalOpen] = useState(false);

  // Automatically update recommended hospitals when user changes guardian region
  React.useEffect(() => {
    if (user?.guardianRegion) {
      setHospitals(getRecommendedHospitalsForRegion(user.guardianRegion));
    }
  }, [user?.guardianRegion]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Show toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Synchronize state changes to localStorage per logged-in user
  React.useEffect(() => {
    if (!session) return;
    saveUserData(session.user.id, {
      userId: session.user.id,
      user,
      points,
      dailyEarnedPoints,
      medicalGoals,
      transactions,
      attendanceDays,
      walkTarget,
      medicalRecords,
      walkRecords,
      orders,
      cart,
      reviews,
      customLogo,
      welcomePointsGranted: true,
      lastAttendanceDate,
      attendanceHistory,
    });
  }, [
    session,
    user,
    points,
    dailyEarnedPoints,
    medicalGoals,
    transactions,
    attendanceDays,
    walkTarget,
    medicalRecords,
    walkRecords,
    orders,
    cart,
    reviews,
    customLogo,
    lastAttendanceDate,
    attendanceHistory,
  ]);

  // Auth Handlers (Load specific user's dataset)
  const handleLoginSuccess = (
    newSession: AuthSession,
    customProfile?: Partial<UserProfile>,
    initialPoints?: number,
    initialGoal?: MedicalGoal
  ) => {
    setSession(newSession);

    // Retrieve saved user-specific data from persistent storage
    const stored = getUserData(newSession.user.id, newSession.user.name);

    setUser(stored.user);
    setPoints(stored.points);
    setDailyEarnedPoints(stored.dailyEarnedPoints);
    setMedicalGoals(stored.medicalGoals);
    setTransactions(stored.transactions);
    setAttendanceHistory(stored.attendanceHistory || []);
    setLastAttendanceDate(stored.lastAttendanceDate);
    setAttendanceDays(generateRealAttendanceDays(stored.attendanceHistory || []));
    setWalkTarget(stored.walkTarget);
    setMedicalRecords(stored.medicalRecords);
    setWalkRecords(stored.walkRecords);
    setOrders(stored.orders || initialShopOrders);
    setCart(stored.cart || []);
    setReviews(stored.reviews || initialProductReviews);
    setCustomLogo(stored.customLogo);

    if (newSession.user.role === 'admin') {
      setActiveTab('admin');
      showToast(`${newSession.user.name} 관리자님 환영합니다. (관리자 대시보드)`);
    } else {
      setActiveTab('home');
      if (customProfile) {
        showToast(`${newSession.user.name}님 환영합니다! 가입 축하 포인트 +2,000P 지급 완료`);
      } else {
        showToast(`${newSession.user.name}님 환영합니다.`);
      }
    }
  };

  const handleLogout = () => {
    performLogout();
    setSession(null);
    setActiveTab('home');
    showToast('안전하게 로그아웃되었습니다.');
  };

  // Cart Handlers
  const handleAddToCart = (newItem: CartItem, directCheckout = false) => {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.id === newItem.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx].quantity += newItem.quantity;
        return updated;
      }
      return [...prev, newItem];
    });

    if (directCheckout) {
      setActiveTab('shop');
    } else {
      showToast(`${newItem.product.name}이(가) 장바구니에 담겼습니다.`);
    }
  };

  const handleUpdateCartQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveCartItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    showToast('상품이 장바구니에서 삭제되었습니다.');
  };

  const handleClearCart = () => {
    setCart([]);
    showToast('장바구니가 비워졌습니다.');
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setActiveTab('shop');
    showToast('주문서 작성을 위해 모으개 SHOP으로 이동했습니다.');
  };

  // Product Review Handler (+200P for buyer review)
  const handleAddProductReview = (productId: string, review: Omit<ProductReview, 'id' | 'date'>) => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now
      .getDate()
      .toString()
      .padStart(2, '0')}`;

    const newRev: ProductReview = {
      ...review,
      id: `rev_${Date.now()}`,
      date: dateStr,
    };

    setReviews((prev) => ({
      ...prev,
      [productId]: [newRev, ...(prev[productId] || [])],
    }));

    addPoints(200, '모으개 SHOP 실구매자 상품 후기 작성 리워드', '이벤트');
    showToast('소중한 상품 후기가 등록되었습니다! (+200P 지급)');
    triggerConfetti();
  };

  // GPS Collar Connection Handler
  const handleUpdateCollarStatus = (
    connected: boolean,
    deviceId?: string,
    battery?: number,
    model?: string
  ) => {
    setUser((prev) => ({
      ...prev,
      gpsCollarConnected: connected,
      gpsCollarDeviceId: deviceId,
      gpsCollarBattery: battery,
      gpsCollarModel: model,
    }));

    if (connected) {
      showToast(`모으개 스마트 GPS 목걸이 (${deviceId || 'MOGE-GPS-9482'}) 연동 완료!`);
      triggerConfetti();
    } else {
      showToast('GPS 목걸이 연동이 해제되었습니다.');
    }
  };

  // Requirement 4: 모으개 SHOP 주문 결제 및 상태 변경 핸들러
  const handlePlaceOrder = (newOrder: ShopOrder, usedPoints: number) => {
    setOrders((prev) => [newOrder, ...prev]);
    if (usedPoints > 0) {
      const remainingBal = Math.max(0, points - usedPoints);
      setPoints(remainingBal);
      const tx: PointTransaction = {
        id: `tx_${Date.now()}`,
        title: `모으개 SHOP 상품 결제 (${newOrder.items[0]?.productName || '주문'} 등)`,
        amount: -usedPoints,
        type: 'use',
        balanceAfter: remainingBal,
        relatedSource: `모으개 SHOP 주문: ${newOrder.orderNumber}`,
        date: getTodayDateString(),
        category: '용품교환',
        detail: `주문번호: ${newOrder.orderNumber}`,
      };
      setTransactions((prev) => [tx, ...prev]);
    }
    triggerConfetti();
    showToast(`주문이 완료되었습니다! (주문번호: ${newOrder.orderNumber})`);
  };

  const handleUpdateOrderStatus = (orderId: string, status: ShopOrder['status']) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status } : ord))
    );
    showToast('주문 배송 상태가 업데이트되었습니다.');
  };

  // Requirement 3: 목표에 적립하기 (보유 포인트 차감 -> 목표 적립액 가산) & 100% 완료 상태 자동 전환
  const handleDepositToGoal = (goalId: string, amount: number) => {
    if (amount <= 0 || amount > points) {
      showToast('보유 포인트가 부족하거나 올바르지 않은 금액입니다.');
      return;
    }

    const todayStr = getTodayDateString();
    let targetTitle = '의료비 목표';
    let isFullyAchieved = false;

    // 1. 차감 보유 포인트
    const newBal = points - amount;
    setPoints(newBal);

    // 2. 가산 목표 적립액 & 달성 여부 판단
    setMedicalGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          targetTitle = g.title;
          const newAmt = g.currentAmount + amount;
          const achieved = newAmt >= g.targetAmount;
          if (achieved) isFullyAchieved = true;
          return {
            ...g,
            currentAmount: newAmt,
            isCompleted: achieved ? true : g.isCompleted,
            completedDate: achieved && !g.completedDate ? todayStr : g.completedDate,
          };
        }
        return g;
      })
    );

    // 3. 포인트 내역 기록 (목표 적립: [목표명] -X,XXXP)
    const newTx: PointTransaction = {
      id: `tx_deposit_${Date.now()}`,
      type: 'use',
      title: `목표 적립: [${targetTitle}]`,
      category: '병원비할인',
      amount: -amount,
      balanceAfter: newBal,
      relatedSource: `목표 적립: ${targetTitle}`,
      date: todayStr,
      detail: `${targetTitle}에 ${amount.toLocaleString()}P 적립 완료`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    showToast(`${targetTitle}에 ${amount.toLocaleString()}P 적립 완료!`);

    if (isFullyAchieved) {
      triggerConfetti();
      setTimeout(() => {
        showToast(`🎉 축하합니다! [${targetTitle}] 목표 금액을 100% 달성하여 '완료된 목표'로 보관되었습니다!`);
      }, 500);
    }
  };

  // Requirement 3: 목표 삭제 시 적립액 보유 포인트 환급 처리
  const handleDeleteGoalWithRefund = (goalId: string, refundAmount: number, title: string) => {
    const todayStr = getTodayDateString();
    if (refundAmount > 0) {
      // 1. 환급
      const newBal = points + refundAmount;
      setPoints(newBal);

      // 2. 포인트 내역에 환급 기록
      const refundTx: PointTransaction = {
        id: `tx_refund_${Date.now()}`,
        type: 'earn',
        title: `목표 삭제 포인트 환급: [${title}]`,
        category: '보너스',
        amount: refundAmount,
        balanceAfter: newBal,
        relatedSource: `목표 환급: ${title}`,
        date: todayStr,
        detail: `${title} 목표 삭제에 따른 기존 적립액 전액 환급`,
      };
      setTransactions((prev) => [refundTx, ...prev]);

      showToast(`목표가 삭제되었으며, 적립된 ${refundAmount.toLocaleString()}P가 보유 포인트로 환급되었습니다.`);
    } else {
      showToast(`[${title}] 목표가 삭제되었습니다.`);
    }

    // 3. 목표 목록에서 제거 및 대표 목표 재지정
    setMedicalGoals((prev) => {
      const remaining = prev.filter((g) => g.id !== goalId);
      if (remaining.length > 0 && !remaining.some((g) => g.isPrimary)) {
        remaining[0].isPrimary = true;
      }
      return remaining;
    });
  };

  // 1. Point earning helper with balanceAfter and relatedSource
  const addPoints = (
    amount: number,
    reason: string,
    category: PointTransaction['category'] = '보너스',
    sourceMission?: string
  ) => {
    const newBal = points + amount;
    setPoints(newBal);
    setTransactions((prev) => [
      {
        id: `tx_${Date.now()}`,
        type: 'earn',
        title: reason,
        category,
        amount,
        balanceAfter: newBal,
        relatedSource: sourceMission || reason,
        date: getTodayDateString(),
      },
      ...prev,
    ]);
  };

  // 2. Attendance Check Handler (실제 현재 날짜 기반 출석체크 & 중복 방지)
  const handleCheckAttendance = () => {
    const todayStr = getTodayDateString();

    // 당일 중복 출석체크 방지
    if (attendanceHistory.includes(todayStr) || lastAttendanceDate === todayStr) {
      showToast('오늘은 이미 출석체크를 완료하셨습니다. 내일 다시 참여해 주세요!');
      return;
    }

    const reward = 150;
    const nextHistory = [...attendanceHistory, todayStr];
    setAttendanceHistory(nextHistory);
    setLastAttendanceDate(todayStr);

    // 실제 달력 기준 출석 현황 갱신
    setAttendanceDays(generateRealAttendanceDays(nextHistory));

    // 전체 보유 포인트에만 150P 추가 (산책 한도와 완전 분리)
    setPoints((p) => p + reward);

    setTransactions((prev) => [
      {
        id: `tx_${Date.now()}`,
        type: 'earn',
        title: '출석체크 완료 보너스',
        category: '출석체크',
        amount: reward,
        date: '방금 전',
        detail: `일일 출석체크 보너스 적립 (+150P, ${todayStr})`,
      },
      ...prev,
    ]);
    showToast(`오늘(${todayStr}) 출석체크 완료! +${reward}P가 적립되었습니다.`);
    triggerConfetti();
  };

  // 3. Walk Finish Handler
  const handleFinishWalk = (earnedPoints: number, distanceKm: number, minutes: number, record?: WalkRecord) => {
    if (earnedPoints > 0) {
      setPoints((p) => p + earnedPoints);
      setDailyEarnedPoints((prev) => Math.min(aiRecommendation.dailyMaxPointLimit, prev + earnedPoints));
      setTransactions((prev) => [
        {
          id: `tx_${Date.now()}`,
          type: 'earn',
          title: `${user.petName}와(과) 맞춤 산책 완료`,
          category: '산책',
          amount: earnedPoints,
          date: '방금 전',
          detail: `${distanceKm}km (${minutes}분) 주행`,
        },
        ...prev,
      ]);
    }

    if (record) {
      setWalkRecords((prev) => [record, ...prev]);
    }

    setWalkTarget((prev) => ({
      ...prev,
      currentWeekTimes: prev.currentWeekTimes + 1,
      currentWeekDistance: Number((prev.currentWeekDistance + distanceKm).toFixed(2)),
    }));

    showToast(`산책 완료! ${distanceKm}km 완주 (+${earnedPoints}P)`);
  };

  // 4. Update Weekly Target
  const handleUpdateWalkTarget = (times: number, distance: number) => {
    setWalkTarget((prev) => ({
      ...prev,
      weeklyGoalTimes: times,
      weeklyGoalDistance: distance,
    }));
    showToast(`주간 산책 목표가 ${times}회 / ${distance}km로 업데이트되었습니다.`);
  };

  // 5. Update Medical Goals
  const handleUpdateMedicalGoals = (newGoals: MedicalGoal[]) => {
    setMedicalGoals(newGoals);
    showToast('의료비 목표가 성공적으로 업데이트되었습니다.');
  };

  const handleSelectPrimaryGoal = (goalId: string) => {
    setMedicalGoals((prev) =>
      prev.map((g) => ({
        ...g,
        isPrimary: g.id === goalId,
      }))
    );
  };

  // 6. Medical Checkup & Vaccine Records Add / Edit
  const handleAddMedicalRecord = (record: MedicalCheckupRecord) => {
    setMedicalRecords((prev) => [record, ...prev]);
    addPoints(2000, '정기 검진·예방접종 기록 등록 축하금', '보너스');
    showToast('새 검진·접종 기록이 성공적으로 등록되었습니다! (+2,000P)');
    triggerConfetti();
  };

  const handleUpdateMedicalRecord = (record: MedicalCheckupRecord) => {
    setMedicalRecords((prev) =>
      prev.map((r) => (r.id === record.id ? record : r))
    );
    showToast('검진·예방접종 기록이 수정되었습니다.');
  };

  // 7. Update User Profile & Pet Photo
  const handleUpdateUserProfile = (updated: Partial<UserProfile>) => {
    setUser((prev) => ({
      ...prev,
      ...updated,
    }));
    showToast('반려동물 및 보호자 프로필 정보가 성공적으로 반영되었습니다.');
  };

  // 8. Redeem Reward Item
  const handleRedeemReward = (reward: RewardItem) => {
    const newBal = points - reward.requiredPoints;
    setPoints(newBal);
    setTransactions((prev) => [
      {
        id: `tx_${Date.now()}`,
        type: 'use',
        title: reward.name,
        category: reward.category === '병원비·검진' ? '병원비할인' : '용품교환',
        amount: -reward.requiredPoints,
        balanceAfter: newBal,
        relatedSource:
          reward.category === '병원비·검진'
            ? `동물병원 혜택 교환: ${reward.name}`
            : `반려동물 샵 제휴 교환: ${reward.brandName}`,
        date: getTodayDateString(),
        detail: reward.provider,
      },
      ...prev,
    ]);
    showToast(`${reward.name} 교환 완료! -${reward.requiredPoints.toLocaleString()}P`);
  };

  // 9. Community Post Actions
  const handleAddPost = (newPost: Omit<CommunityPost, 'id' | 'date' | 'likes' | 'commentsCount' | 'views'>) => {
    const created: CommunityPost = {
      ...newPost,
      id: `post_${Date.now()}`,
      date: '방금 전',
      likes: 1,
      commentsCount: 0,
      views: 1,
      isLiked: true,
      comments: [],
    };
    setCommunityPosts((prev) => [created, ...prev]);
    addPoints(300, '커뮤니티 건강 관리 정보 공유 리워드', '이벤트');
    showToast('새 게시글이 등록되었습니다! (+300P 적립)');
    triggerConfetti();
  };

  const handleToggleLike = (postId: string) => {
    setCommunityPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isLiked = !p.isLiked;
          return {
            ...p,
            isLiked,
            likes: isLiked ? p.likes + 1 : Math.max(0, p.likes - 1),
          };
        }
        return p;
      })
    );
  };

  // 10. Hospital Actions
  const handleAddHospitalReview = (hospitalId: string, content: string, rating: number) => {
    setHospitals((prev) =>
      prev.map((h) => {
        if (h.id === hospitalId) {
          const newReview = {
            id: `rv_${Date.now()}`,
            author: `${user.guardianName} (인증)`,
            petBreed: user.petBreed,
            rating,
            content,
            date: '2026.10.19',
            visitedFor: '정기 검진 및 치료',
          };
          return {
            ...h,
            reviews: [newReview, ...(h.reviews || [])],
            reviewCount: h.reviewCount + 1,
          };
        }
        return h;
      })
    );
    addPoints(200, '동물병원 영수증 인증 리뷰 작성 리워드', '이벤트');
    showToast('소중한 병원 리뷰가 등록되었습니다! (+200P 적립)');
    triggerConfetti();
  };

  // Role-based Navigation Guard
  const navigateTo = (tab: TabType, subTab?: string) => {
    if (tab === 'admin' && session?.user.role !== 'admin') {
      showToast('관리자 전용 페이지입니다. 일반 사용자는 접근 권한이 없습니다.');
      return;
    }
    setActiveTab(tab);
    if (subTab) setActiveSubTab(subTab);
  };

  // ========================================================
  // REQUIREMENT: First access MUST show LoginScreen first!
  // ========================================================
  if (!session) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  const isAdmin = session.user.role === 'admin';

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      {/* =========================================
          SINGLE-LINE DESKTOP HEADER
          Logo, Navigation, Points, Cart, Interactive Profile, Logout
          (Clean borderless styling with soft shadow)
          ========================================= */}
      <header className="w-full bg-white sticky top-0 z-40 px-3 sm:px-6 py-2.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 flex-nowrap overflow-x-auto">
          {/* 1. Brand Logo (Permanently locked official brand asset, no edits or hovers) */}
          <div className="flex items-center gap-1 shrink-0 mr-1 sm:mr-2">
            <button
              onClick={() => navigateTo(isAdmin ? 'admin' : 'home')}
              className="flex items-center gap-2.5 whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity cursor-pointer"
              title="모으개 홈으로 이동"
            >
              <img
                src="/assets/brand/logo_symbol.jpg"
                alt="모으개 심볼"
                className="w-8 h-8 rounded-xl object-contain shadow-2xs"
              />
              <img
                src="/assets/brand/logo_typo.png"
                alt="모으개"
                className="h-6 object-contain"
              />
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded whitespace-nowrap hidden lg:inline shrink-0">
                MOGEGAE
              </span>
            </button>
          </div>

          {/* 2. Primary Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2 flex-nowrap shrink-0">
            <button
              onClick={() => navigateTo('home')}
              className={`whitespace-nowrap shrink-0 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-amber-100 text-amber-700 font-bold px-3 py-1.5 rounded-full shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50 px-2.5 py-1.5 rounded-xl'
              }`}
            >
              홈
            </button>
            <button
              onClick={() => navigateTo('mission', 'walking')}
              className={`whitespace-nowrap shrink-0 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'mission'
                  ? 'bg-amber-100 text-amber-700 font-bold px-3 py-1.5 rounded-full shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50 px-2.5 py-1.5 rounded-xl'
              }`}
            >
              미션
            </button>
            <button
              onClick={() => navigateTo('shop')}
              className={`whitespace-nowrap shrink-0 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'shop'
                  ? 'bg-amber-100 text-amber-700 font-bold px-3 py-1.5 rounded-full shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50 px-2.5 py-1.5 rounded-xl'
              }`}
            >
              모으개 SHOP
            </button>
            <button
              onClick={() => navigateTo('community', 'living')}
              className={`whitespace-nowrap shrink-0 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'community'
                  ? 'bg-amber-100 text-amber-700 font-bold px-3 py-1.5 rounded-full shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50 px-2.5 py-1.5 rounded-xl'
              }`}
            >
              커뮤니티
            </button>
            <button
              onClick={() => navigateTo('hospital', 'all')}
              className={`whitespace-nowrap shrink-0 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'hospital'
                  ? 'bg-amber-100 text-amber-700 font-bold px-3 py-1.5 rounded-full shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50 px-2.5 py-1.5 rounded-xl'
              }`}
            >
              동물병원
            </button>
            <button
              onClick={() => navigateTo('mypage', 'benefits')}
              className={`whitespace-nowrap shrink-0 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'mypage'
                  ? 'bg-amber-100 text-amber-700 font-bold px-3 py-1.5 rounded-full shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50 px-2.5 py-1.5 rounded-xl'
              }`}
            >
              마이페이지
            </button>

            {/* Admin Menu (Only for Admin accounts) */}
            {isAdmin && (
              <button
                onClick={() => navigateTo('admin')}
                className={`whitespace-nowrap shrink-0 text-xs sm:text-sm font-bold px-2.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                  activeTab === 'admin'
                    ? 'bg-rose-50 text-rose-600'
                    : 'text-stone-700 hover:text-rose-600 hover:bg-stone-50'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>관리자 메뉴</span>
              </button>
            )}
          </nav>

          {/* 3. Points, Cart, Interactive Profile, and Logout */}
          <div className="flex items-center gap-2 sm:gap-3 flex-nowrap shrink-0">
            {/* Points Indicator Pill (Matches wireframe rounded gold pill) */}
            <button
              onClick={() => navigateTo('mypage', 'points')}
              className="py-1.5 px-3 bg-[#FEF3C7]/90 hover:bg-[#FDE68A] border border-amber-300/80 text-amber-900 text-xs font-black rounded-full flex items-center gap-1.5 shrink-0 whitespace-nowrap transition-colors cursor-pointer shadow-2xs"
              title="보유 포인트 및 목표 관리 확인"
            >
              <img
                src="/assets/brand/point_coin.png"
                alt="포인트"
                className="w-4 h-4 object-contain shrink-0"
              />
              <span className="tabular-nums whitespace-nowrap">{points.toLocaleString()} P</span>
            </button>

            {/* Cart Button placed EXACTLY between Points and Profile (Requirement 1 & Red Circle in attachment) */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative py-1.5 px-3 bg-amber-50 hover:bg-amber-100 text-stone-800 text-xs font-bold rounded-xl flex items-center gap-1.5 shrink-0 whitespace-nowrap transition-colors cursor-pointer shadow-2xs"
              title="장바구니 확인"
            >
              <img
                src="/assets/brand/cart_shopping_box.png"
                alt="장바구니"
                className="w-4 h-4 object-contain shrink-0"
              />
              <span className="hidden sm:inline text-xs font-bold">장바구니</span>
              {cart.reduce((sum, item) => sum + item.quantity, 0) > 0 && (
                <span className="min-w-4.5 h-4.5 px-1 bg-amber-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shrink-0">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>

            {/* Direct Profile Button to MyPage */}
            <button
              type="button"
              onClick={() => navigateTo('mypage', 'profile')}
              className="flex items-center gap-2 whitespace-nowrap shrink-0 px-2.5 py-1.5 rounded-xl bg-stone-50 hover:bg-amber-50/80 text-stone-800 transition-all cursor-pointer group shadow-2xs"
              title="마이페이지 반려견 프로필로 바로 이동"
            >
              <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold overflow-hidden shrink-0">
                {user.profileImage && user.profileImage.startsWith('data:image') ? (
                  <img src={user.profileImage} alt={user.petName} className="w-full h-full object-cover" />
                ) : (
                  <span>{user.profileImage || '🐶'}</span>
                )}
              </div>
              <span className="text-xs font-bold whitespace-nowrap group-hover:text-amber-700 transition-colors">
                {user.guardianName}
              </span>
              {isAdmin && (
                <span className="text-[10px] font-semibold bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded whitespace-nowrap">
                  관리자
                </span>
              )}
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="py-1.5 px-3 bg-stone-100 hover:bg-rose-50 hover:text-rose-600 text-stone-600 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1 shrink-0 whitespace-nowrap cursor-pointer shadow-2xs"
              title="로그아웃"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">로그아웃</span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================
          DESKTOP-ONLY EXPANSIVE MAIN LAYOUT
          (Clean white background, subtle shadow cards)
          ========================================= */}
      <main className="w-full flex-1 flex justify-center py-6 px-4 sm:px-6 md:px-8 bg-white">
        <div className="w-full max-w-5xl bg-white p-2 sm:p-4 animate-fadeIn">
          {activeTab === 'home' && (
            <HomeView
              user={user}
              attendanceDays={attendanceDays}
              points={points}
              dailyEarnedPoints={dailyEarnedPoints}
              dailyMaxLimit={aiRecommendation.dailyMaxPointLimit}
              medicalGoals={medicalGoals}
              nearbyEmergencyHospital={hospitals[0]}
              onNavigate={navigateTo}
              onCheckAttendance={handleCheckAttendance}
              onStartWalk={() => {
                setActiveTab('mission');
                setActiveSubTab('walking');
              }}
              onSelectPrimaryGoal={handleSelectPrimaryGoal}
            />
          )}

          {activeTab === 'mission' && (
            <MissionView
              user={user}
              attendanceDays={attendanceDays}
              walkTarget={walkTarget}
              aiRecommendation={aiRecommendation}
              dailyEarnedPoints={dailyEarnedPoints}
              walkRecords={walkRecords}
              activeSubTab={activeSubTab as any}
              onCheckAttendance={handleCheckAttendance}
              onUpdateWalkTarget={handleUpdateWalkTarget}
              onFinishWalk={handleFinishWalk}
              onOpenGpsCollarModal={() => setIsGpsCollarModalOpen(true)}
              onNavigateToShopCollar={() => {
                setActiveTab('shop');
              }}
            />
          )}

          {activeTab === 'shop' && (
            <ShopView
              user={user}
              points={points}
              orders={orders}
              onPlaceOrder={handlePlaceOrder}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onNavigate={navigateTo}
              cart={cart}
              onAddToCart={handleAddToCart}
              onUpdateCartQty={handleUpdateCartQty}
              onRemoveCartItem={handleRemoveCartItem}
              onClearCart={handleClearCart}
              onOpenCart={() => setIsCartOpen(true)}
              reviews={reviews}
              onAddReview={handleAddProductReview}
              onOpenGpsCollarModal={() => setIsGpsCollarModalOpen(true)}
              rewards={rewards}
              hospitals={hospitals}
              onRedeemReward={handleRedeemReward}
            />
          )}

          {activeTab === 'community' && (
            <CommunityView
              posts={communityPosts}
              emergencyGuides={emergencyGuides}
              activeSubTab={activeSubTab as any}
              onGoToEmergencyHospital={() => {
                setActiveTab('hospital');
                setActiveSubTab('emergency');
              }}
              onAddPost={handleAddPost}
              onToggleLike={handleToggleLike}
            />
          )}

          {activeTab === 'hospital' && (
            <HospitalView
              hospitals={hospitals}
              user={user}
              initialEmergencyMode={activeSubTab === 'emergency'}
              onCallHospital={(h) => showToast(`${h.name} (${h.phone}) 연결을 시도합니다.`)}
              onOpenNavigation={(h) => showToast(`${h.name} 최단 경로 내비게이션을 시작합니다.`)}
              onAddReview={handleAddHospitalReview}
            />
          )}

          {activeTab === 'mypage' && (
            <MyPageView
              user={user}
              points={points}
              medicalGoals={medicalGoals}
              transactions={transactions}
              rewards={rewards}
              medicalRecords={medicalRecords}
              walkRecords={walkRecords}
              activeSubTab={activeSubTab as any}
              onUpdateUserProfile={handleUpdateUserProfile}
              onUpdateMedicalGoals={handleUpdateMedicalGoals}
              onAddMedicalRecord={handleAddMedicalRecord}
              onUpdateMedicalRecord={handleUpdateMedicalRecord}
              onRedeemReward={handleRedeemReward}
              onDepositToGoal={handleDepositToGoal}
              onDeleteGoalWithRefund={handleDeleteGoalWithRefund}
            />
          )}

          {activeTab === 'admin' && (
            isAdmin ? (
              <AdminView
                adminId={session.user.id}
                adminName={session.user.name}
                onBackToApp={() => setActiveTab('home')}
                onLogout={handleLogout}
              />
            ) : (
              <div className="p-10 text-center bg-white rounded-3xl border border-stone-200 space-y-3">
                <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                  🚫
                </div>
                <h3 className="text-base font-bold text-stone-900">관리자 전용 페이지입니다</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  일반 계정은 관리자 페이지에 접근할 수 없습니다. 관리자 계정으로 로그인해 주세요.
                </p>
                <button
                  onClick={() => setActiveTab('home')}
                  className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-xl cursor-pointer"
                >
                  홈으로 돌아가기
                </button>
              </div>
            )
          )}
        </div>
      </main>

      {/* ========================================================
          GLOBAL FOOTER (와이어프레임 최하단 푸터 일치)
          ======================================================== */}
      <footer className="w-full bg-[#18181B] text-stone-300 py-6 px-4 sm:px-8 border-t border-stone-800">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          {/* Left: Brand Logo & Slogan */}
          <div className="flex items-center gap-3">
            <img
              src="/assets/brand/logo_symbol.jpg"
              alt="모으개 로고"
              className="w-7 h-7 rounded-lg object-contain shadow-2xs"
            />
            <div className="flex items-center gap-2">
              <img
                src="/assets/brand/logo_typo.png"
                alt="모으개"
                className="h-5 object-contain brightness-0 invert opacity-90"
              />
              <span className="text-stone-400 text-[11px] hidden sm:inline">우리 아이를 위한 일상의 리워드</span>
            </div>
          </div>

          {/* Center: Legal & Help Policy Links */}
          <div className="flex items-center gap-3 sm:gap-4 text-[11px] text-stone-400 flex-wrap justify-center">
            <button
              onClick={() => showToast('모으개 서비스 이용약관 전문이 적용되어 있습니다.')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              이용약관
            </button>
            <span className="text-stone-700">·</span>
            <button
              onClick={() => showToast('모으개 개인정보처리방침에 따라 사용자 정보가 안전하게 암호화 보관됩니다.')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              개인정보처리방침
            </button>
            <span className="text-stone-700">·</span>
            <button
              onClick={() => showToast('자주 묻는 질문: 산책 포인트는 매일 자정 자동 초기화되며, 축하 포인트는 영구 보관됩니다.')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              자주 묻는 질문(FAQ)
            </button>
            <span className="text-stone-700">·</span>
            <button
              onClick={() => showToast('모으개 고객센터: 1588-0000 (평일 09:00 ~ 18:00)')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              고객센터
            </button>
          </div>

          {/* Right: App Store & Google Play Download Badges */}
          <div className="flex items-center gap-2">
            <div
              onClick={() => showToast('iOS 모바일 앱이 곧 출시됩니다.')}
              className="px-2.5 py-1.5 bg-stone-800/80 hover:bg-stone-700 rounded-lg text-[10px] text-stone-300 flex items-center gap-1.5 border border-stone-700/60 cursor-pointer transition-colors"
              title="App Store 다운로드"
            >
              <span className="text-xs">🍎</span>
              <div className="text-left leading-tight">
                <div className="text-[9px] text-stone-400">App Store에서</div>
                <div className="font-bold text-white">다운로드</div>
              </div>
            </div>
            <div
              onClick={() => showToast('안드로이드 모바일 앱이 곧 출시됩니다.')}
              className="px-2.5 py-1.5 bg-stone-800/80 hover:bg-stone-700 rounded-lg text-[10px] text-stone-300 flex items-center gap-1.5 border border-stone-700/60 cursor-pointer transition-colors"
              title="Google Play 다운로드"
            >
              <span className="text-xs">▶️</span>
              <div className="text-left leading-tight">
                <div className="text-[9px] text-stone-400">Google Play에서</div>
                <div className="font-bold text-white">다운로드</div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={handleProceedToCheckout}
        onGoToShop={() => {
          setIsCartOpen(false);
          setActiveTab('shop');
        }}
        userPoints={points}
      />

      <GpsCollarModal
        isOpen={isGpsCollarModalOpen}
        onClose={() => setIsGpsCollarModalOpen(false)}
        user={user}
        onUpdateCollarStatus={handleUpdateCollarStatus}
        onNavigateToShopCollar={() => {
          setIsGpsCollarModalOpen(false);
          setActiveTab('shop');
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 z-50 animate-bounce px-4 py-2.5 bg-stone-900/90 text-white text-xs font-semibold rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-2 border border-stone-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
