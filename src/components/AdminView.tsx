import React, { useState } from 'react';
import {
  Users,
  Coins,
  LayoutDashboard,
  TrendingUp,
  ShieldAlert,
  Search,
  Filter,
  ArrowUpRight,
  CheckCircle,
  Plus,
  Minus,
  Activity,
  HeartPulse,
  Building2,
  LogOut,
  Sparkles,
  Smartphone,
  Eye,
  Calendar,
  Award,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  X
} from 'lucide-react';
import { initialAdminUsers, AdminUserRecord } from '../data/mockData';
import {
  getAllMembersForAdmin,
  deleteMemberByAdmin,
  isSuperAdmin,
  AdminMemberItem
} from '../services/authService';

interface AdminViewProps {
  adminId: string;
  adminName: string;
  onBackToApp?: () => void;
  onLogout: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  adminId,
  adminName,
  onBackToApp,
  onLogout,
}) => {
  // 4 Core Admin Menus matching user specification:
  // 1. 서비스 이용 현황 (usage)
  // 2. 회원 관리 (members)
  // 3. 포인트 관리 (points)
  // 4. 반려동물 및 병원 관련 데이터 확인 (pet_hospital)
  const [adminTab, setAdminTab] = useState<'usage' | 'members' | 'points' | 'pet_hospital'>('usage');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Real-time registered member list from localStorage
  const [members, setMembers] = useState<AdminMemberItem[]>(() => getAllMembersForAdmin());
  const [selectedMember, setSelectedMember] = useState<AdminMemberItem | null>(null);

  // Deletion Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState<AdminMemberItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Manual point adjustment state
  const [adjustAmount, setAdjustAmount] = useState<number>(1000);
  const [adjustReason, setAdjustReason] = useState('병원비 지원 특별 프로모션');

  // Verify super admin status
  const canDeleteAccounts = isSuperAdmin(adminId);

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.petBreed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdjustPoints = (isAdd: boolean) => {
    if (!selectedMember) return;
    const delta = isAdd ? adjustAmount : -adjustAmount;
    const newPoints = Math.max(0, selectedMember.points + delta);

    setMembers((prev) =>
      prev.map((m) => (m.id === selectedMember.id ? { ...m, points: newPoints } : m))
    );
    setSelectedMember((prev) => (prev ? { ...prev, points: newPoints } : null));

    // Also update in user's localStorage if exists
    try {
      const raw = localStorage.getItem(`mogege_user_data_v2_${selectedMember.id}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        parsed.points = newPoints;
        localStorage.setItem(`mogege_user_data_v2_${selectedMember.id}`, JSON.stringify(parsed));
      }
    } catch {
      // ignore
    }

    alert(`${selectedMember.name} 회원님께 ${Math.abs(delta).toLocaleString()}P가 ${isAdd ? '지급' : '차감'}되었습니다.`);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    try {
      deleteMemberByAdmin(adminId, deleteTarget.id);
      // Refresh member list
      const updated = getAllMembersForAdmin();
      setMembers(updated);
      setIsDeleteModalOpen(false);
      if (selectedMember?.id === deleteTarget.id) setSelectedMember(null);

      alert(`[${deleteTarget.name} (${deleteTarget.id})] 회원 계정 및 연결된 모든 데이터가 영구 삭제되었습니다.`);
      setDeleteTarget(null);
    } catch (err: any) {
      alert(err.message || '회원 삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* Admin Top Header (Clean dark card without harsh borders) */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-stone-800 p-1 flex items-center justify-center shrink-0 shadow-inner">
            <img src="/assets/aistudio/mogege_brand_logo.png" alt="모으개 로고" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight">모으개 관리자 전용 대시보드</h2>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-mono font-semibold">
                ADMIN ACCESS
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              접속 관리자: <strong className="text-amber-400 font-bold">{adminName} 님</strong> (계정 ID: {adminId})
              {canDeleteAccounts && (
                <span className="ml-2 text-[11px] text-emerald-400 font-semibold bg-emerald-500/15 px-2 py-0.5 rounded-full">
                  회원 탈퇴 및 계정 삭제 권한 보유
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onBackToApp && (
            <button
              onClick={onBackToApp}
              className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-xs font-semibold rounded-xl text-stone-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="사용자 화면 레이아웃 미리보기"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>사용자 화면 보기</span>
            </button>
          )}
          <button
            onClick={onLogout}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>로그아웃</span>
          </button>
        </div>
      </div>

      {/* 4 Core Admin Tabs (Border removed, soft shadow and clean white pill active state) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1.5 bg-stone-100 rounded-2xl text-xs font-semibold shadow-2xs">
        <button
          onClick={() => setAdminTab('usage')}
          className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            adminTab === 'usage'
              ? 'bg-white text-stone-900 shadow-xs font-bold'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-amber-600" />
          <span>서비스 이용 현황</span>
        </button>
        <button
          onClick={() => {
            setAdminTab('members');
            setMembers(getAllMembersForAdmin());
          }}
          className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            adminTab === 'members'
              ? 'bg-white text-stone-900 shadow-xs font-bold'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-blue-600" />
          <span>회원 관리</span>
          <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded-full font-bold ml-1">
            {members.length}
          </span>
        </button>
        <button
          onClick={() => setAdminTab('points')}
          className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            adminTab === 'points'
              ? 'bg-white text-stone-900 shadow-xs font-bold'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Coins className="w-3.5 h-3.5 text-emerald-600" />
          <span>포인트 관리</span>
        </button>
        <button
          onClick={() => setAdminTab('pet_hospital')}
          className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            adminTab === 'pet_hospital'
              ? 'bg-white text-stone-900 shadow-xs font-bold'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-purple-600" />
          <span>반려동물 및 병원 데이터</span>
        </button>
      </div>

      {/* =========================================
          TAB 1: 서비스 이용 현황 (Usage Status)
          ========================================= */}
      {adminTab === 'usage' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-3xl p-5 shadow-xs space-y-1">
              <span className="text-xs text-stone-400 font-medium">총 누적 가입 회원</span>
              <div className="text-2xl font-black text-stone-900 tabular-nums">
                {(members.length + 1284).toLocaleString()}{' '}
                <span className="text-xs text-emerald-600 font-bold">+12%</span>
              </div>
              <p className="text-[11px] text-stone-500">실시간 등록 회원 {members.length}명 포함</p>
            </div>
            <div className="bg-white rounded-3xl p-5 shadow-xs space-y-1">
              <span className="text-xs text-stone-400 font-medium">오늘 산책 완료 횟수</span>
              <div className="text-2xl font-black text-amber-600 tabular-nums">
                912 <span className="text-xs text-stone-400 font-normal">건</span>
              </div>
              <p className="text-[11px] text-stone-500">평균 산책 시간 34분</p>
            </div>
            <div className="bg-white rounded-3xl p-5 shadow-xs space-y-1">
              <span className="text-xs text-stone-400 font-medium">오늘 출석체크 완료</span>
              <div className="text-2xl font-black text-blue-600 tabular-nums">
                1,048 <span className="text-xs text-stone-400 font-normal">명</span>
              </div>
              <p className="text-[11px] text-stone-500">당일 활성 유저(DAU) 81%</p>
            </div>
            <div className="bg-white rounded-3xl p-5 shadow-xs space-y-1">
              <span className="text-xs text-stone-400 font-medium">병원비 바우처 교환액</span>
              <div className="text-2xl font-black text-emerald-600 tabular-nums">
                2.76 <span className="text-xs text-stone-400 font-normal">백만원</span>
              </div>
              <p className="text-[11px] text-stone-500">당월 총 누적 정산</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-stone-900">최근 7일간 서비스 활성 지표 추이</h4>
              <span className="text-xs text-stone-400">일일 산책 건수 및 출석률</span>
            </div>

            <div className="grid grid-cols-7 gap-2 pt-2 text-center text-xs">
              {[
                { day: '10/19 (일)', walks: 840, checkins: 920, rate: '82%' },
                { day: '10/20 (월)', walks: 690, checkins: 880, rate: '75%' },
                { day: '10/21 (화)', walks: 720, checkins: 905, rate: '77%' },
                { day: '10/22 (수)', walks: 750, checkins: 910, rate: '79%' },
                { day: '10/23 (목)', walks: 790, checkins: 935, rate: '81%' },
                { day: '10/24 (금)', walks: 820, checkins: 960, rate: '84%' },
                { day: '10/25 (오늘)', walks: 910, checkins: 1040, rate: '88%' },
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-stone-50 rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] text-stone-400">{item.day}</span>
                  <div className="my-2">
                    <div className="text-xs font-black text-amber-600 tabular-nums">{item.walks}건</div>
                    <div className="text-[10px] text-stone-500 tabular-nums">출석 {item.checkins}</div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-white rounded-md py-0.5 shadow-2xs">
                    {item.rate}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          TAB 2: 회원 관리 (Member Management & Deletion)
          ========================================= */}
      {adminTab === 'members' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-900">회원 계정 및 권한 관리</h3>
              <p className="text-xs text-stone-500">
                가입된 전체 회원 목록 조회, 포인트 수동 조정, 회원 탈퇴 및 계정 영구 삭제
              </p>
            </div>
            <div className="text-xs text-stone-500 font-medium">
              총 <strong className="text-stone-900 font-bold">{members.length}</strong>명 등록됨
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="회원 아이디, 보호자 이름, 반려견 견종, 거주지역 검색..."
              className="w-full pl-10 pr-3.5 py-2.5 bg-white rounded-2xl text-xs placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-xs"
            />
          </div>

          {/* Members Table (Clean White Card without harsh borders) */}
          <div className="bg-white rounded-3xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50/80 text-stone-500 font-semibold border-b border-stone-100">
                  <tr>
                    <th className="py-3 px-4">회원 아이디</th>
                    <th className="py-3 px-4">보호자 이름</th>
                    <th className="py-3 px-4">등록 반려견</th>
                    <th className="py-3 px-4">거주 지역</th>
                    <th className="py-3 px-4">가입일</th>
                    <th className="py-3 px-4 text-right">보유 포인트</th>
                    <th className="py-3 px-4 text-center">계정 상태</th>
                    <th className="py-3 px-4 text-center">계정 관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {filteredMembers.map((member) => (
                    <tr
                      key={member.id}
                      onClick={() => setSelectedMember(member)}
                      className={`hover:bg-amber-50/40 transition-colors cursor-pointer ${
                        selectedMember?.id === member.id ? 'bg-amber-50/60 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                        {member.id}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-stone-800">
                        {member.name}
                      </td>
                      <td className="py-3.5 px-4 text-stone-600">
                        {member.petName} ({member.petBreed})
                      </td>
                      <td className="py-3.5 px-4 text-stone-500">
                        {member.region}
                      </td>
                      <td className="py-3.5 px-4 text-stone-400 tabular-nums">
                        {member.registeredAt}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-amber-600 tabular-nums">
                        {member.points.toLocaleString()} P
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {member.status === '관리자' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                            <ShieldCheck className="w-3 h-3 text-rose-600" />
                            최고 관리자
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            정상
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        {member.canDelete ? (
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteTarget(member);
                              setIsDeleteModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                            title="회원 계정 및 데이터 영구 삭제"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>계정 삭제</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-stone-400 font-medium">
                            관리자 (보호됨)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}

                  {filteredMembers.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-xs text-stone-400">
                        검색 조건과 일치하는 회원이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Member Details & Point Grant Drawer */}
          {selectedMember && (
            <div className="bg-white rounded-3xl p-6 shadow-xs space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-stone-900">
                    [{selectedMember.name} / {selectedMember.id}] 상세 회원 정보 및 포인트 조정
                  </h4>
                  {selectedMember.canDelete && (
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteTarget(selectedMember);
                        setIsDeleteModalOpen(true);
                      }}
                      className="px-2.5 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[11px] font-bold rounded-md transition-colors cursor-pointer ml-2"
                    >
                      회원 탈퇴 처리
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="text-xs text-stone-400 hover:text-stone-700 cursor-pointer p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-stone-50 p-4 rounded-2xl">
                <div>
                  <span className="text-stone-400 block mb-0.5">보유 포인트</span>
                  <strong className="text-amber-600 text-sm">{selectedMember.points.toLocaleString()} P</strong>
                </div>
                <div>
                  <span className="text-stone-400 block mb-0.5">등록 반려견</span>
                  <strong className="text-stone-800 text-sm">{selectedMember.petName} ({selectedMember.petBreed})</strong>
                </div>
                <div>
                  <span className="text-stone-400 block mb-0.5">보호자 거주지역</span>
                  <strong className="text-stone-800">{selectedMember.region}</strong>
                </div>
                <div>
                  <span className="text-stone-400 block mb-0.5">계정 상태 / 가입일</span>
                  <strong className="text-emerald-700">{selectedMember.status} · {selectedMember.registeredAt}</strong>
                </div>
              </div>

              {/* Point Adjustment Box */}
              <div className="space-y-3 pt-1">
                <div className="text-xs font-bold text-stone-800">관리자 수동 포인트 지급 / 차감</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-stone-500 mb-1">조정 포인트 (P)</label>
                    <input
                      type="number"
                      step="500"
                      value={adjustAmount}
                      onChange={(e) => setAdjustAmount(Number(e.target.value))}
                      className="w-full px-3.5 py-2 bg-stone-50 rounded-xl text-xs font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-500 mb-1">조정 사유</label>
                    <input
                      type="text"
                      value={adjustReason}
                      onChange={(e) => setAdjustReason(e.target.value)}
                      className="w-full px-3.5 py-2 bg-stone-50 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAdjustPoints(true)}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+{adjustAmount.toLocaleString()}P 즉시 지급</span>
                  </button>
                  <button
                    onClick={() => handleAdjustPoints(false)}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                    <span>-{adjustAmount.toLocaleString()}P 회수 차감</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================
          TAB 3: 포인트 관리 (Point Management)
          ========================================= */}
      {adminTab === 'points' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-stone-900">제휴 병원 및 용품 바우처 정산 현황</h4>
                <p className="text-xs text-stone-400">사용자가 적립한 포인트를 병원비로 환전한 실시간 집계</p>
              </div>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl">
                총 정산액: 2,760,000원
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl">
                <div>
                  <div className="font-bold text-stone-800">24시 마포 센트럴 동물의료원</div>
                  <div className="text-[11px] text-stone-400 mt-0.5">38건 바우처 환전 (진료비 3만원권, 검진 5만원권)</div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-stone-900">1,140,000원</div>
                  <span className="text-[10px] text-emerald-600 font-semibold">정산 지급 완료</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl">
                <div>
                  <div className="font-bold text-stone-800">신촌 24시 스마트 동물의료센터</div>
                  <div className="text-[11px] text-stone-400 mt-0.5">26건 바우처 환전 (야간 응급 진료 할인권)</div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-stone-900">820,000원</div>
                  <span className="text-[10px] text-emerald-600 font-semibold">정산 지급 완료</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl">
                <div>
                  <div className="font-bold text-stone-800">연남 바른 동물병원</div>
                  <div className="text-[11px] text-stone-400 mt-0.5">18건 바우처 환전 (정기 접종 지원권)</div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-stone-900">450,000원</div>
                  <span className="text-[10px] text-emerald-600 font-semibold">정산 지급 완료</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          TAB 4: 반려동물 및 병원 데이터 (Pet & Hospital Data)
          ========================================= */}
      {adminTab === 'pet_hospital' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-3xl p-6 shadow-xs space-y-3">
              <h4 className="text-sm font-bold text-stone-900">등록 반려견 질환/지병 분포</h4>
              <div className="space-y-2 text-xs">
                {[
                  { name: '슬개골 탈구 및 관절 질환', count: '42%', color: 'bg-amber-500' },
                  { name: '아토피 및 피부 알레르기', count: '28%', color: 'bg-rose-500' },
                  { name: '치주 질환 및 구강 건강', count: '18%', color: 'bg-blue-500' },
                  { name: '심장 및 순환기 질환', count: '12%', color: 'bg-purple-500' },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-stone-700">
                      <span>{item.name}</span>
                      <span className="font-bold">{item.count}</span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: item.count }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-xs space-y-3">
              <h4 className="text-sm font-bold text-stone-900">인기 견종 순위</h4>
              <div className="space-y-2.5 text-xs">
                {[
                  { rank: 1, breed: '말티즈', count: '312마리' },
                  { rank: 2, breed: '토이푸들', count: '284마리' },
                  { rank: 3, breed: '포메라니안', count: '196마리' },
                  { rank: 4, breed: '비숑 프리제', count: '175마리' },
                  { rank: 5, breed: '믹스견', count: '142마리' },
                ].map((item) => (
                  <div key={item.rank} className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-[10px]">
                        {item.rank}
                      </span>
                      <span className="font-bold text-stone-800">{item.breed}</span>
                    </div>
                    <span className="text-stone-500">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: 관리자 전용 회원 계정 및 데이터 영구 삭제 확인
          ======================================================== */}
      {isDeleteModalOpen && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-stone-900">회원 계정 영구 삭제</h3>
              <p className="text-xs text-stone-500">
                선택한 회원의 계정과 모든 연결 데이터를 완전히 삭제합니다.
              </p>
            </div>

            {/* Target Account Summary */}
            <div className="p-4 bg-rose-50 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-rose-700">회원 아이디:</span>
                <strong className="text-rose-950 font-mono">{deleteTarget.id}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-rose-700">보호자 이름:</span>
                <strong className="text-rose-950">{deleteTarget.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-rose-700">등록 반려견:</span>
                <strong className="text-rose-950">{deleteTarget.petName} ({deleteTarget.petBreed})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-rose-700">보유 포인트:</span>
                <strong className="text-rose-950 tabular-nums">{deleteTarget.points.toLocaleString()} P</strong>
              </div>
            </div>

            {/* Warning Details */}
            <div className="p-3 bg-stone-50 rounded-xl space-y-1 text-[11px] text-stone-600 leading-relaxed">
              <span className="font-bold text-stone-800 block">⚠️ 삭제 시 처리 내용:</span>
              <ul className="list-disc list-inside space-y-0.5 text-stone-500">
                <li>해당 회원의 로그인 세션이 즉시 만료되며 재로그인이 영구 차단됩니다.</li>
                <li>회원의 프로필, 포인트 잔액, 의료비 적립 목표, 산책 및 건강 기록이 로컬 저장소에서 모두 제거됩니다.</li>
                <li>이 작업은 실행 후 되돌릴 수 없습니다.</li>
              </ul>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteTarget(null);
                }}
                className="flex-1 py-2.5 text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>영구 삭제 실행</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
