import React, { useState } from 'react';
import {
  MessageSquare,
  AlertTriangle,
  Heart,
  PlusCircle,
  Share2,
  ShieldAlert,
  ArrowRight,
  Check,
  XCircle,
  FileText,
  Clock,
  Sparkles,
  Search
} from 'lucide-react';
import { CommunityPost, EmergencyGuide } from '../types';

interface CommunityViewProps {
  posts: CommunityPost[];
  emergencyGuides: EmergencyGuide[];
  activeSubTab?: 'living' | 'emergency';
  onGoToEmergencyHospital: () => void;
  onAddPost: (newPost: Omit<CommunityPost, 'id' | 'date' | 'likes' | 'commentsCount' | 'views'>) => void;
  onToggleLike: (postId: string) => void;
}

export const CommunityView: React.FC<CommunityViewProps> = ({
  posts,
  emergencyGuides,
  activeSubTab = 'living',
  onGoToEmergencyHospital,
  onAddPost,
  onToggleLike,
}) => {
  const [subTab, setSubTab] = useState<'living' | 'emergency'>(activeSubTab);
  const [categoryFilter, setCategoryFilter] = useState<string>('전체');
  const [emergencyFilter, setEmergencyFilter] = useState<string>('전체');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected items for modal view
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<EmergencyGuide | null>(null);
  
  // New Post Form
  const [isWritingPost, setIsWritingPost] = useState(false);
  const [newPostCategory, setNewPostCategory] = useState<'건강관리 및 예방' | '예방접종·검진' | '제품 후기' | '자유질문'>('건강관리 및 예방');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTags, setNewPostTags] = useState('');

  // Comment input
  const [commentInput, setCommentInput] = useState('');

  const filteredPosts = posts.filter((p) => {
    const matchCat = categoryFilter === '전체' || p.category.includes(categoryFilter);
    const matchSearch =
      searchQuery === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const filteredGuides = emergencyGuides.filter((g) => {
    if (emergencyFilter === '전체') return true;
    return g.category.includes(emergencyFilter);
  });

  const handleSubmitNewPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    onAddPost({
      category: newPostCategory,
      title: newPostTitle.trim(),
      content: newPostContent.trim(),
      author: '김민서 (보호자)',
      authorPetBreed: '토이푸들 4세',
      tags: newPostTags.split(',').map((t) => t.trim()).filter(Boolean),
    });

    setIsWritingPost(false);
    setNewPostTitle('');
    setNewPostContent('');
    setNewPostTags('');
  };

  const handleAddComment = () => {
    if (!commentInput.trim() || !selectedPost) return;
    const newComment = {
      id: `c_${Date.now()}`,
      author: '김민서 (보호자)',
      content: commentInput.trim(),
      date: '방금 전',
    };
    selectedPost.comments = [...(selectedPost.comments || []), newComment];
    selectedPost.commentsCount += 1;
    setCommentInput('');
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-6">
      {/* Sub Tabs matching IA: 반려생활 정보 / 긴급상황 대처 가이드 */}
      <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-2xl">
        <button
          onClick={() => setSubTab('living')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            subTab === 'living'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>반려생활 정보</span>
        </button>
        <button
          onClick={() => setSubTab('emergency')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            subTab === 'emergency'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-rose-700 hover:bg-rose-50'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>긴급상황 대처 가이드</span>
        </button>
      </div>

      {/* =========================================
          TAB 1: 반려생활 정보
          - 건강관리 및 예방 정보
          - 예방접종·건강검진 안내
          - 제품 후기 및 정보 공유
          ========================================= */}
      {subTab === 'living' && (
        <div className="space-y-4">
          {/* Header & Write Button */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-900">반려생활 정보 광장</h3>
              <p className="text-xs text-stone-500">수의사 가이드와 보호자들의 리얼 케어 노하우</p>
            </div>
            <button
              onClick={() => setIsWritingPost(true)}
              className="py-2 px-3 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>글쓰기</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="슬개골 관리, 건강검진 주기, 하네스 후기 검색..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {/* Category Filter Chips matching IA */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {['전체', '건강관리 및 예방', '예방접종·검진', '제품 후기'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition-all ${
                  categoryFilter === cat
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Post Feed */}
          <div className="space-y-3">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="bg-white rounded-2xl p-4 border border-stone-200 hover:border-amber-300 transition-all cursor-pointer shadow-xs"
              >
                {/* Quiet unboxed metadata */}
                <div className="flex items-center gap-2 text-[11px] text-stone-400 mb-1.5">
                  <span className="font-semibold text-amber-600">{post.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{post.author}</span>
                  <span aria-hidden="true">·</span>
                  <span>{post.authorPetBreed}</span>
                  <span aria-hidden="true">·</span>
                  <span>{post.date}</span>
                </div>

                <h4 className="text-sm font-bold text-stone-900 leading-snug line-clamp-1">
                  {post.title}
                </h4>

                <p className="text-xs text-stone-600 mt-1.5 line-clamp-2 leading-relaxed">
                  {post.content}
                </p>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                    {post.tags.map((t) => (
                      <span key={t} className="text-[11px] text-stone-500 hover:text-amber-700">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Card Footer */}
                <div className="flex items-center justify-between pt-3 mt-2 border-t border-stone-100 text-[11px] text-stone-400">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleLike(post.id);
                      }}
                      className={`flex items-center gap-1 hover:text-rose-500 transition-colors ${
                        post.isLiked ? 'text-rose-500 font-semibold' : ''
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${post.isLiked ? 'fill-rose-500' : ''}`} />
                      <span>{post.likes}</span>
                    </button>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{post.commentsCount || (post.comments ? post.comments.length : 0)}</span>
                    </span>
                  </div>

                  <span className="text-amber-700 font-medium">자세히 보기 &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================
          TAB 2: 긴급상황 대처 가이드
          - 응급처치 및 금지 행동
          - 증상별 응급 대처법
          - 병원 방문 전 준비사항
          ========================================= */}
      {subTab === 'emergency' && (
        <div className="space-y-4">
          {/* Emergency Alert Banner */}
          <div className="bg-rose-600 text-white rounded-3xl p-5 shadow-lg shadow-rose-600/20 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-200" />
              <h3 className="text-sm font-bold">응급 상황 골든타임 수칙</h3>
            </div>
            <p className="text-xs text-rose-100 leading-relaxed">
              호흡곤란, 5분 이상의 지속 경련, 독성 물질(초콜릿, 자일리톨, 포도) 섭취 시에는 자가 처치로 지체하지 마시고 즉시 24시 응급 동물병원으로 이송해야 합니다.
            </p>
            <button
              onClick={onGoToEmergencyHospital}
              className="w-full py-2.5 bg-white text-rose-700 font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 hover:bg-rose-50 transition-colors"
            >
              <span>🚨 0.4km 인근 24시 응급 동물병원 찾기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Sub-categories matching IA */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {['전체', '응급처치 및 금지 행동', '증상별 응급 대처법', '병원 방문 전 준비사항'].map((cat) => (
              <button
                key={cat}
                onClick={() => setEmergencyFilter(cat)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition-all ${
                  emergencyFilter === cat
                    ? 'bg-rose-700 text-white shadow-xs'
                    : 'bg-white border border-rose-200 text-rose-900 hover:bg-rose-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Emergency Guide Cards */}
          <div className="space-y-3">
            {filteredGuides.map((guide) => (
              <div
                key={guide.id}
                onClick={() => setSelectedGuide(guide)}
                className="bg-white rounded-2xl p-4 border border-stone-200 hover:border-rose-300 transition-all cursor-pointer shadow-xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                    {guide.urgencyLevel}
                  </span>
                  <span className="text-[11px] text-stone-400">{guide.category}</span>
                </div>

                <h4 className="text-sm font-bold text-stone-900 leading-snug">
                  {guide.title}
                </h4>

                <p className="text-xs text-stone-600 mt-1 leading-relaxed line-clamp-2">
                  {guide.summary}
                </p>

                {/* DO & DONT Quick Snippets */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-emerald-50/70 border border-emerald-200/60 p-2 rounded-xl text-emerald-900 flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="truncate">{guide.doList[0]}</span>
                  </div>
                  <div className="bg-rose-50/70 border border-rose-200/60 p-2 rounded-xl text-rose-900 flex items-start gap-1.5">
                    <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                    <span className="truncate">{guide.dontList[0]}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                  <span>증상 키워드: {guide.applicableSymptoms.join(', ')}</span>
                  <span className="text-rose-700 font-semibold">대처 가이드 전문 &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guide Detail Modal */}
      {selectedGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl border border-stone-200 p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                  {selectedGuide.urgencyLevel}
                </span>
                <h3 className="text-base font-bold text-stone-900 mt-2">{selectedGuide.title}</h3>
                <p className="text-xs text-stone-500 mt-0.5">{selectedGuide.category}</p>
              </div>
              <button
                onClick={() => setSelectedGuide(null)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                닫기
              </button>
            </div>

            <div className="bg-stone-50 p-3 rounded-2xl text-xs text-stone-700 leading-relaxed border border-stone-200">
              {selectedGuide.summary}
            </div>

            {/* DO LIST */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                반드시 해야 할 응급 행동 (DO)
              </h4>
              <ul className="space-y-1.5 text-xs text-stone-700">
                {selectedGuide.doList.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                    <span className="text-emerald-700 font-bold shrink-0">{i + 1}.</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* DONT LIST */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-rose-600" />
                절대 하지 말아야 할 금지 행동 (DON'T)
              </h4>
              <ul className="space-y-1.5 text-xs text-stone-700">
                {selectedGuide.dontList.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 bg-rose-50/50 p-2.5 rounded-xl border border-rose-100">
                    <span className="text-rose-700 font-bold shrink-0">✕</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* PREPARATION NOTES */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-600" />
                병원 방문 전 챙겨야 할 준비사항
              </h4>
              <ul className="list-disc list-inside space-y-1 text-xs text-stone-600 bg-amber-50/40 p-3 rounded-xl border border-amber-100">
                {selectedGuide.preparationNotes.map((note, i) => (
                  <li key={i}>{note}</li>
                ))}
              </ul>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setSelectedGuide(null);
                  onGoToEmergencyHospital();
                }}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <span>현재 위치 기준 24시 응급 동물병원 찾기</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl border border-stone-200 p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs text-amber-600 font-bold">{selectedPost.category}</span>
                <h3 className="text-base font-bold text-stone-900 mt-1">{selectedPost.title}</h3>
                <div className="text-xs text-stone-400 mt-1 flex items-center gap-2">
                  <span>{selectedPost.author}</span>
                  <span>·</span>
                  <span>{selectedPost.authorPetBreed}</span>
                  <span>·</span>
                  <span>{selectedPost.date}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                닫기
              </button>
            </div>

            <div className="text-xs text-stone-700 leading-relaxed whitespace-pre-line py-2 border-y border-stone-100">
              {selectedPost.content}
            </div>

            {/* Comments List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-stone-800">
                댓글 {selectedPost.comments ? selectedPost.comments.length : 0}개
              </h4>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedPost.comments && selectedPost.comments.length > 0 ? (
                  selectedPost.comments.map((c) => (
                    <div key={c.id} className="p-2.5 bg-stone-50 rounded-xl text-xs space-y-0.5">
                      <div className="flex items-center justify-between text-stone-500 font-semibold text-[11px]">
                        <span>{c.author}</span>
                        <span className="font-normal">{c.date}</span>
                      </div>
                      <p className="text-stone-700">{c.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-stone-400 text-center py-2">첫 번째 댓글을 남겨보세요!</p>
                )}
              </div>

              {/* Add Comment Input */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  placeholder="따뜻한 댓글을 남겨주세요..."
                  className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <button
                  onClick={handleAddComment}
                  className="px-3 py-2 bg-amber-500 text-white text-xs font-semibold rounded-xl hover:bg-amber-600 transition-colors"
                >
                  등록
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Write New Post Modal */}
      {isWritingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-stone-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-stone-900">새 이야기 쓰기</h3>
              <button
                onClick={() => setIsWritingPost(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                취소
              </button>
            </div>

            <form onSubmit={handleSubmitNewPost} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">카테고리</label>
                <select
                  value={newPostCategory}
                  onChange={(e: any) => setNewPostCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="건강관리 및 예방">건강관리 및 예방 정보</option>
                  <option value="예방접종·검진">예방접종·건강검진 안내</option>
                  <option value="제품 후기">제품 후기 및 정보 공유</option>
                  <option value="자유질문">자유 질문</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">제목</label>
                <input
                  type="text"
                  required
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  placeholder="예: 슬개골 탈구에 도움된 영양제 복용 후기"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">내용</label>
                <textarea
                  required
                  rows={5}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="반려가족들과 나누고 싶은 경험이나 질문을 작성해 주세요..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">태그 (쉼표로 구분)</label>
                <input
                  type="text"
                  value={newPostTags}
                  onChange={(e) => setNewPostTags(e.target.value)}
                  placeholder="슬개골, 영양제, 관절관리"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWritingPost(false)}
                  className="px-4 py-2 border border-stone-200 text-stone-600 text-xs font-medium rounded-xl hover:bg-stone-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                >
                  등록하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
