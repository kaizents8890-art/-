import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  ShoppingCart,
  Truck,
  CheckCircle2,
  Tag,
  Star,
  ShieldCheck,
  ChevronRight,
  Plus,
  Minus,
  Trash2,
  X,
  MapPin,
  Coins,
  CreditCard,
  ExternalLink,
  PackageCheck,
  Sparkles,
  Info,
  Clock,
  ArrowRight,
  Edit3,
  ThumbsUp,
  AlertCircle,
  Filter,
  Check,
  Building,
  HeartPulse,
  Award
} from 'lucide-react';
import { ShopProduct, CartItem, ShopOrder, UserProfile, ProductReview, RewardItem, Hospital } from '../types';
import { initialShopProducts, initialProductReviews } from '../data/shopData';
import { initialRewardItems, initialHospitals } from '../data/mockData';
import { triggerConfetti } from '../utils/confetti';

interface ShopViewProps {
  user?: UserProfile;
  points: number;
  orders: ShopOrder[];
  rewards?: RewardItem[];
  hospitals?: Hospital[];
  onRedeemReward?: (reward: RewardItem) => void;
  onPlaceOrder: (order: ShopOrder, pointsUsed: number) => void;
  onUpdateOrderStatus?: (orderId: string, status: ShopOrder['status']) => void;
  onNavigateToMission?: () => void;
  onNavigate?: (tab: any, subTab?: string) => void;
  cart: CartItem[];
  onAddToCart: (item: CartItem, directCheckout?: boolean) => void;
  onUpdateCartQty: (id: string, delta: number) => void;
  onRemoveCartItem: (id: string) => void;
  onClearCart: () => void;
  onOpenCart: () => void;
  reviews: Record<string, ProductReview[]>;
  onAddReview: (productId: string, review: Omit<ProductReview, 'id' | 'date'>) => void;
  onOpenGpsCollarModal?: () => void;
}

export const ShopView: React.FC<ShopViewProps> = ({
  user,
  points,
  orders,
  rewards,
  hospitals,
  onRedeemReward,
  onPlaceOrder,
  onUpdateOrderStatus,
  onNavigateToMission,
  onNavigate,
  cart,
  onAddToCart,
  onUpdateCartQty,
  onRemoveCartItem,
  onClearCart,
  onOpenCart,
  reviews,
  onAddReview,
  onOpenGpsCollarModal,
}) => {
  const [activeTab, setActiveTab] = useState<'goods' | 'hospital' | 'shop_benefit' | 'orders'>('goods');
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');

  // Benefit Detail Modal & Voucher Success State
  const [selectedRewardBenefit, setSelectedRewardBenefit] = useState<RewardItem | null>(null);
  const [redeemedVoucher, setRedeemedVoucher] = useState<{ reward: RewardItem; code: string } | null>(null);

  // Subfilters for partner benefits
  const [hospitalSubFilter, setHospitalSubFilter] = useState<'all' | 'checkup' | 'vaccine' | 'voucher' | 'hospitals'>('all');
  const [brandSubFilter, setBrandSubFilter] = useState<string>('all');

  // Product Detail Modal State
  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(null);
  const [modalTab, setModalTab] = useState<'detail' | 'reviews'>('detail');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState<number>(1);

  // Review Sorting & Writing State
  const [reviewSort, setReviewSort] = useState<'latest' | 'highest' | 'lowest'>('latest');
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [showBuyerOnlyNotice, setShowBuyerOnlyNotice] = useState(false);
  const [newReviewForm, setNewReviewForm] = useState({
    rating: 5,
    title: '',
    content: '',
  });

  // Checkout State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
  const [shippingForm, setShippingForm] = useState({
    recipientName: user?.guardianName || '김영석',
    phone: '010-8630-1234',
    roadAddress: user?.guardianRegion || '서울특별시 마포구 월드컵북로 120',
    detailAddress: '101동 502호',
    memo: '부재 시 문 앞에 놓아주세요.',
  });
  const [pointsToUse, setPointsToUse] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'points' | 'pay' | 'vbank'>('card');
  const [orderSuccess, setOrderSuccess] = useState<ShopOrder | null>(null);

  // Delivery Tracking Modal
  const [trackingOrder, setTrackingOrder] = useState<ShopOrder | null>(null);

  // 5대 카테고리 구성 (GPS 산책 목걸이, 사료 및 간식, 산책 용품, 건강관리 용품, 기타)
  const categories = ['전체', 'GPS 산책 목걸이', '사료 및 간식', '산책 용품', '건강관리 용품', '기타'];

  const filteredProducts = initialShopProducts.filter((p) => {
    if (selectedCategory === '전체') return true;
    if (selectedCategory === 'GPS 산책 목걸이') {
      return p.isGpsCollar || p.name.includes('GPS') || p.category === '스마트 IoT';
    }
    if (selectedCategory === '사료 및 간식') {
      return p.category === '사료' || p.category === '간식';
    }
    if (selectedCategory === '산책 용품') {
      return p.category === '산책용품';
    }
    if (selectedCategory === '건강관리 용품') {
      return p.category === '위생용품' || p.name.includes('관절') || p.name.includes('영양');
    }
    if (selectedCategory === '기타') {
      return p.category === '장난감' || (!['스마트 IoT', '사료', '간식', '산책용품', '위생용품'].includes(p.category));
    }
    return p.category === selectedCategory;
  });

  const allRewards = rewards || initialRewardItems;
  const allHospitals = hospitals || initialHospitals;

  // 제휴 혜택 교환 처리 핸들러
  const handleRedeemBenefit = (reward: RewardItem) => {
    if (points < reward.requiredPoints) {
      alert(`포인트가 부족합니다. (필요: ${reward.requiredPoints.toLocaleString()}P / 현재: ${points.toLocaleString()}P)`);
      return;
    }
    if (onRedeemReward) {
      onRedeemReward(reward);
    }
    setSelectedRewardBenefit(null);
    setRedeemedVoucher({
      reward,
      code: `VOUCHER-MGG-${Date.now().toString().slice(-6)}`,
    });
    triggerConfetti();
  };

  // Helper to get reviews for a product
  const getProductReviews = (productId: string): ProductReview[] => {
    return reviews[productId] || initialProductReviews[productId] || [];
  };

  // Helper to calculate average rating and total reviews
  const getProductRatingSummary = (product: ShopProduct) => {
    const list = getProductReviews(product.id);
    if (list.length === 0) {
      return { rating: product.rating, count: product.reviewCount };
    }
    const sum = list.reduce((acc, r) => acc + r.rating, 0);
    const avg = Number((sum / list.length).toFixed(1));
    return { rating: avg, count: list.length };
  };

  // Open Product Detail Modal
  const handleOpenProduct = (product: ShopProduct, initialTab: 'detail' | 'reviews' = 'detail') => {
    setSelectedProduct(product);
    setModalTab(initialTab);
    setQuantity(1);
    setIsWritingReview(false);
    setShowBuyerOnlyNotice(false);

    // Init default options
    const defaults: Record<string, string> = {};
    if (product.options) {
      product.options.forEach((opt) => {
        defaults[opt.name] = opt.choices[0];
      });
    }
    setSelectedOptions(defaults);
  };

  // Add To Cart / Direct Checkout
  const handleAddToCartClick = (product: ShopProduct, directCheckout = false) => {
    const itemKey = `${product.id}-${JSON.stringify(selectedOptions)}`;
    const newItem: CartItem = {
      id: itemKey,
      productId: product.id,
      product,
      quantity,
      selectedOptions: { ...selectedOptions },
    };

    if (directCheckout) {
      setSelectedProduct(null);
      setCheckoutItems([newItem]);
      setPointsToUse(0);
      setIsCheckoutOpen(true);
      return;
    }

    onAddToCart(newItem, false);
    setSelectedProduct(null);
  };

  // Check if current user has actually purchased selected product
  const hasUserPurchasedProduct = (productId: string): boolean => {
    return orders.some((ord) => ord.items.some((it) => it.productId === productId));
  };

  // Handle Review Write Button Click
  const handleOpenReviewWriter = () => {
    if (!selectedProduct) return;
    const purchased = hasUserPurchasedProduct(selectedProduct.id);
    if (!purchased) {
      setShowBuyerOnlyNotice(true);
      return;
    }
    setIsWritingReview(true);
    setNewReviewForm({
      rating: 5,
      title: '',
      content: '',
    });
  };

  // Submit Review
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    if (!newReviewForm.title.trim() || !newReviewForm.content.trim()) return;

    const optString = Object.entries(selectedOptions)
      .map(([k, v]) => `${k}: ${v}`)
      .join(' / ');

    onAddReview(selectedProduct.id, {
      productId: selectedProduct.id,
      authorName: user?.guardianName ? `${user.guardianName[0]}*${user.guardianName.slice(2) || '석'}` : '김*석',
      authorPetBreed: user ? `${user.petBreed} ${user.petName} 보호자` : '토이푸들 초코 보호자',
      rating: newReviewForm.rating,
      title: newReviewForm.title.trim(),
      content: newReviewForm.content.trim(),
      isVerifiedPurchase: true,
      isSampleData: false, // Real buyer review
      selectedOptionsText: optString || '기본 구매',
      likesCount: 0,
    });

    setIsWritingReview(false);
    triggerConfetti();
  };

  // Checkout calculations
  const checkoutGoodsTotal = checkoutItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const checkoutShippingFee = checkoutGoodsTotal >= 30000 || checkoutGoodsTotal === 0 ? 0 : 3000;
  const maxPointsUsable = Math.min(points, checkoutGoodsTotal);
  const finalPaid = Math.max(0, checkoutGoodsTotal + checkoutShippingFee - pointsToUse);

  // Submit Order
  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkoutItems.length === 0) return;

    const now = new Date();
    const dateStr = `${now.getFullYear()}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now
      .getDate()
      .toString()
      .padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

    const orderNum = `MGG-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now
      .getDate()
      .toString()
      .padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: ShopOrder = {
      id: `ord_${Date.now()}`,
      orderNumber: orderNum,
      date: dateStr,
      items: checkoutItems.map((ci) => ({
        productId: ci.productId,
        productName: ci.product.name,
        productImage: ci.product.image,
        priceAtOrder: ci.product.price,
        quantity: ci.quantity,
        selectedOptions: ci.selectedOptions,
        isGpsCollar: ci.product.isGpsCollar,
      })),
      totalGoodsPrice: checkoutGoodsTotal,
      shippingFee: checkoutShippingFee,
      pointsDiscount: pointsToUse,
      finalPaidAmount: finalPaid,
      shippingAddress: {
        recipientName: shippingForm.recipientName,
        phone: shippingForm.phone,
        roadAddress: shippingForm.roadAddress,
        detailAddress: shippingForm.detailAddress,
        memo: shippingForm.memo,
      },
      status: '배송 준비중',
      courierName: 'CJ대한통운',
      trackingNumber: `68${Math.floor(10000000 + Math.random() * 90000000)}`,
      trackingHistory: [
        {
          date: dateStr.split(' ')[0],
          time: dateStr.split(' ')[1],
          status: '주문 접수 및 결제 완료',
          location: '모으개 공식 물류센터',
        },
        {
          date: dateStr.split(' ')[0],
          time: '18:00',
          status: '상품 포장 및 발송 대기',
          location: '김포 스마트 물류 허브',
        },
      ],
    };

    onPlaceOrder(newOrder, pointsToUse);
    onClearCart();
    setIsCheckoutOpen(false);
    setOrderSuccess(newOrder);
    triggerConfetti();
  };

  const gpsCollarProduct = initialShopProducts.find((p) => p.isGpsCollar);
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Active reviews for modal
  const currentProductReviews = useMemo(() => {
    if (!selectedProduct) return [];
    const list = getProductReviews(selectedProduct.id);
    return [...list].sort((a, b) => {
      if (reviewSort === 'highest') return b.rating - a.rating;
      if (reviewSort === 'lowest') return a.rating - b.rating;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [selectedProduct, reviews, reviewSort]);

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* ========================================================
          SHOP HERO BANNER: GPS Collar Featured Highlight
          ======================================================== */}
      {gpsCollarProduct && (
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-stone-900 via-stone-800 to-amber-950 text-white p-6 sm:p-8 shadow-xl border border-amber-500/20">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>모으개 공식 인증 스마트 IoT 디바이스</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-snug">
                모으개 스마트 GPS <span className="text-amber-400">안심 산책 목걸이</span>
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                산책 미션 중 <strong>반려동물의 실제 동행 여부를 실시간 검증</strong>하고 
                부정 적립을 방지하는 필수 스마트 목걸이입니다. 
                IP68 방수, 22g 초경량, 야간 안전 LED 탑재!
              </p>
              <div className="flex items-center justify-center md:justify-start gap-4 pt-1">
                <div className="text-left">
                  <span className="text-xs text-stone-400 line-through">정가 49,000원</span>
                  <div className="text-2xl font-black text-amber-400 tabular-nums">
                    39,000 <span className="text-sm font-bold text-white">원</span>
                    <span className="ml-2 text-xs font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded">
                      20% OFF
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenProduct(gpsCollarProduct)}
                  className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>상세보기 및 구매</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Visual Icon Badge */}
            <div className="relative shrink-0 flex items-center justify-center">
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center text-6xl sm:text-7xl shadow-2xl backdrop-blur-xs relative group">
                <span className="animate-pulse">🛰️</span>
                <span className="absolute -bottom-2 -right-2 px-2.5 py-1 bg-amber-500 text-white text-[11px] font-black rounded-xl shadow-md flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  동행 인증
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SHOP NAVIGATION TABS & CART BUTTON
          ======================================================== */}
      {/* ========================================================
          SHOP NAVIGATION TABS & CART BUTTON
          ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setActiveTab('goods')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'goods'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>반려동물 용품</span>
          </button>
          <button
            onClick={() => setActiveTab('hospital')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'hospital'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <HeartPulse className="w-4 h-4" />
            <span>동물병원 제휴 혜택</span>
          </button>
          <button
            onClick={() => setActiveTab('shop_benefit')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'shop_benefit'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>반려동물 샵 제휴 혜택</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>주문 내역 & 배송 조회 ({orders.length})</span>
          </button>
        </div>

        {/* Floating Cart Button */}
        <button
          onClick={onOpenCart}
          className="relative px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer self-end sm:self-auto shrink-0"
        >
          <img
            src="/assets/brand/cart_shopping_box.png"
            alt="장바구니"
            className="w-4 h-4 object-contain shrink-0"
          />
          <span>장바구니</span>
          {totalCartCount > 0 && (
            <span className="w-5 h-5 bg-amber-500 text-white text-[11px] font-black rounded-full flex items-center justify-center">
              {totalCartCount}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================
          TAB 1: PET GOODS (반려동물 용품 5대 카테고리)
          ======================================================== */}
      {activeTab === 'goods' && (
        <div className="space-y-5">
          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => {
              const ratingSummary = getProductRatingSummary(product);
              return (
                <div
                  key={product.id}
                  onClick={() => handleOpenProduct(product)}
                  className={`bg-white rounded-3xl p-5 shadow-xs hover:shadow-lg transition-all border flex flex-col justify-between cursor-pointer group ${
                    product.isGpsCollar
                      ? 'border-amber-300 ring-2 ring-amber-100 bg-amber-50/10'
                      : 'border-stone-100 hover:border-amber-200'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Badges & Image Frame */}
                    <div className="relative w-full aspect-square rounded-2xl bg-stone-50 group-hover:bg-amber-50/50 transition-colors flex items-center justify-center text-6xl shadow-inner border border-stone-100">
                      <span>{product.image}</span>
                      {product.discountBadge && (
                        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded-lg shadow-xs">
                          {product.discountBadge}
                        </span>
                      )}
                      {product.isGpsCollar && (
                        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-lg shadow-xs flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          동행 인증
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div>
                      <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                        {product.category}
                      </span>
                      <h4 className="text-sm font-bold text-stone-900 mt-1 line-clamp-1 group-hover:text-amber-700 transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                        {product.shortDesc}
                      </p>
                    </div>
                  </div>

                  {/* Price & Rating */}
                  <div className="pt-3 border-t border-stone-100 mt-3 flex items-end justify-between">
                    <div>
                      {product.originalPrice > product.price && (
                        <div className="text-[11px] text-stone-400 line-through">
                          {product.originalPrice.toLocaleString()}원
                        </div>
                      )}
                      <div className="text-base font-black text-amber-600 tabular-nums">
                        {product.price.toLocaleString()} <span className="text-xs font-bold text-stone-700">원</span>
                      </div>
                    </div>

                    {/* Review Rating Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenProduct(product, 'reviews');
                      }}
                      className="flex items-center gap-1 text-[11px] text-stone-500 hover:text-amber-600 font-semibold cursor-pointer py-1 px-1.5 rounded-lg hover:bg-amber-50 transition-colors"
                      title="구매자 후기 바로가기"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="font-bold text-stone-800">{ratingSummary.rating}</span>
                      <span>({ratingSummary.count})</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: ANIMAL HOSPITAL BENEFITS (동물병원 제휴 혜택)
          ======================================================== */}
      {activeTab === 'hospital' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-linear-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
            <div className="relative z-10 max-w-2xl space-y-2">
              <span className="px-2.5 py-1 bg-white/20 backdrop-blur-xs text-white text-[11px] font-bold rounded-full inline-flex items-center gap-1">
                <HeartPulse className="w-3.5 h-3.5" />
                모으개 제휴 병원 EMR 네트워크
              </span>
              <h3 className="text-xl font-black">동물병원 제휴 의료비 & 검진 혜택</h3>
              <p className="text-xs text-emerald-100 leading-relaxed">
                산책과 미션으로 모은 포인트를 정기 종합건강검진, 필수 예방접종, 병원 진료비 할인권으로 즉시 교환하세요.
                전국 제휴 동물병원 내원 시 바우처 코드를 제시하면 현장에서 즉시 차감됩니다.
              </p>
            </div>
            <div className="absolute right-4 bottom-2 text-7xl opacity-20 pointer-events-none">
              🏥
            </div>
          </div>

          {/* Sub Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setHospitalSubFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                hospitalSubFilter === 'all'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              전체 혜택 ({allRewards.filter((r) => r.category === '병원비·검진').length}건)
            </button>
            <button
              onClick={() => setHospitalSubFilter('checkup')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                hospitalSubFilter === 'checkup'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              정기 건강검진 지원
            </button>
            <button
              onClick={() => setHospitalSubFilter('vaccine')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                hospitalSubFilter === 'vaccine'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              예방접종 혜택
            </button>
            <button
              onClick={() => setHospitalSubFilter('voucher')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                hospitalSubFilter === 'voucher'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              진료비 할인 & 포인트 사용
            </button>
            <button
              onClick={() => setHospitalSubFilter('hospitals')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                hospitalSubFilter === 'hospitals'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              제휴 동물병원 목록 ({allHospitals.length}곳)
            </button>
          </div>

          {/* Hospital Rewards Grid */}
          {hospitalSubFilter !== 'hospitals' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {allRewards
                .filter((r) => r.category === '병원비·검진')
                .filter((r) => {
                  if (hospitalSubFilter === 'checkup') return r.subCategory === '종합검진지원';
                  if (hospitalSubFilter === 'vaccine') return r.subCategory === '예방접종지원';
                  if (hospitalSubFilter === 'voucher') return r.subCategory === '진료비바우처';
                  return true;
                })
                .map((reward) => (
                  <div
                    key={reward.id}
                    className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl shadow-inner border border-emerald-100">
                          {reward.image}
                        </div>
                        {reward.discountBadge && (
                          <span className="px-2.5 py-0.5 bg-emerald-500 text-white text-[11px] font-bold rounded-full">
                            {reward.discountBadge}
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                          {reward.provider}
                        </div>
                        <h4 className="text-base font-bold text-stone-900 mt-1">
                          {reward.name}
                        </h4>
                        <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                          {reward.description}
                        </p>
                      </div>

                      {/* Coverage / Benefit highlight */}
                      {reward.coverageScope && (
                        <div className="bg-stone-50 rounded-xl p-2.5 text-[11px] text-stone-600 space-y-1 border border-stone-100">
                          <div className="font-bold text-stone-800 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            지원 범위
                          </div>
                          <div className="line-clamp-2 text-stone-500">{reward.coverageScope}</div>
                        </div>
                      )}

                      {/* Price / Points */}
                      <div className="pt-2 border-t border-stone-100 flex items-baseline justify-between">
                        <span className="text-xs text-stone-400 line-through">
                          {reward.originalPrice.toLocaleString()}원 상당
                        </span>
                        <div className="text-lg font-black text-emerald-600">
                          {reward.requiredPoints.toLocaleString()} <span className="text-xs font-bold text-stone-700">P</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 border-t border-stone-100 mt-4 flex items-center gap-2">
                      <button
                        onClick={() => setSelectedRewardBenefit(reward)}
                        className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                      >
                        이용조건 상세
                      </button>
                      <button
                        onClick={() => handleRedeemBenefit(reward)}
                        className={`flex-1 py-2 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs ${
                          points >= reward.requiredPoints
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-stone-200 text-stone-400 hover:bg-stone-200 cursor-not-allowed'
                        }`}
                      >
                        {points >= reward.requiredPoints ? '포인트 즉시 교환' : '포인트 부족'}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Affiliated Animal Hospital Directory */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <Building className="w-5 h-5 text-emerald-600" />
                  모으개 제휴 동물병원 안내
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  현장에서 모으개 바우처 및 포인트 혜택을 즉시 사용할 수 있는 인증 의료기관입니다.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                실시간 EMR 전산 연동
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allHospitals.map((hosp) => (
                <div
                  key={hosp.id}
                  className="bg-stone-50 hover:bg-emerald-50/40 transition-colors rounded-2xl p-4 border border-stone-200/80 space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 text-sm">{hosp.name}</span>
                        {hosp.isEmergency24h && (
                          <span className="px-1.5 py-0.5 bg-rose-500 text-white text-[10px] font-black rounded-md">
                            24시 응급
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        {hosp.address}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg shrink-0">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>{hosp.rating}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 text-[11px]">
                    {hosp.departments.slice(0, 3).map((dept, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white border border-stone-200 text-stone-600 rounded-md">
                        {dept}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                      {hosp.pointDiscountRate}
                    </span>
                    <a
                      href={`tel:${hosp.phone}`}
                      className="text-stone-500 hover:text-stone-800 font-medium"
                    >
                      {hosp.phone}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: PET BRAND SHOP BENEFITS (반려동물 샵 제휴 혜택)
          ======================================================== */}
      {activeTab === 'shop_benefit' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-linear-to-r from-amber-600 via-orange-500 to-amber-700 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
            <div className="relative z-10 max-w-2xl space-y-2">
              <span className="px-2.5 py-1 bg-white/20 backdrop-blur-xs text-white text-[11px] font-bold rounded-full inline-flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                모으개 파트너 프리미엄 브랜드
              </span>
              <h3 className="text-xl font-black">반려동물 샵 & 전문 브랜드 제휴 혜택</h3>
              <p className="text-xs text-amber-100 leading-relaxed">
                디팡(Dfang), 닥터힐메딕스, 바른산책 등 엄선된 반려동물 브랜드의 관절 케어 용품, 처방 영양제, 맞춤 하네스를
                모으개 포인트로 파격적인 할인가에 교환하거나 제휴 전용 쿠폰으로 구매하세요.
              </p>
            </div>
            <div className="absolute right-4 bottom-2 text-7xl opacity-20 pointer-events-none">
              🛍️
            </div>
          </div>

          {/* Brand Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setBrandSubFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                brandSubFilter === 'all'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              전체 브랜드 혜택
            </button>
            <button
              onClick={() => setBrandSubFilter('디팡')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                brandSubFilter === '디팡'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              디팡 (관절보호 매트·슬라이드)
            </button>
            <button
              onClick={() => setBrandSubFilter('닥터힐메딕스')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                brandSubFilter === '닥터힐메딕스'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              닥터힐메딕스 (수의사 처방 영양제)
            </button>
            <button
              onClick={() => setBrandSubFilter('바른산책')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                brandSubFilter === '바른산책'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              바른산책 연구소 (충격분산 하네스)
            </button>
          </div>

          {/* Partner Brands Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {allRewards
              .filter((r) => r.category === '반려용품')
              .filter((r) => {
                if (brandSubFilter === 'all') return true;
                return r.brandName.includes(brandSubFilter);
              })
              .map((reward) => (
                <div
                  key={reward.id}
                  className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl shadow-inner border border-amber-100">
                        {reward.image}
                      </div>
                      {reward.discountBadge && (
                        <span className="px-2.5 py-0.5 bg-amber-600 text-white text-[11px] font-bold rounded-full">
                          {reward.discountBadge}
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md inline-block">
                        {reward.brandName}
                      </div>
                      <h4 className="text-base font-bold text-stone-900 mt-1">
                        {reward.name}
                      </h4>
                      <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                        {reward.description}
                      </p>
                    </div>

                    {/* Features list */}
                    {reward.usageConditions && (
                      <div className="bg-stone-50 rounded-xl p-2.5 text-[11px] text-stone-600 space-y-1 border border-stone-100">
                        <div className="font-bold text-stone-800 flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5 text-amber-600" />
                          혜택 및 상품 안내
                        </div>
                        <div className="text-stone-500 line-clamp-2">
                          {reward.usageConditions[0]}
                        </div>
                      </div>
                    )}

                    {/* Price / Points */}
                    <div className="pt-2 border-t border-stone-100 flex items-baseline justify-between">
                      <span className="text-xs text-stone-400 line-through">
                        {reward.originalPrice.toLocaleString()}원
                      </span>
                      <div className="text-lg font-black text-amber-600">
                        {reward.requiredPoints.toLocaleString()} <span className="text-xs font-bold text-stone-700">P</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: View Details, External Link, Redeem */}
                  <div className="pt-4 border-t border-stone-100 mt-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedRewardBenefit(reward)}
                        className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                      >
                        상세 조건 보기
                      </button>
                      {reward.externalUrl && (
                        <a
                          href={reward.externalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 bg-white border border-stone-200 hover:border-amber-400 text-stone-600 text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1 shrink-0"
                          title="공식 스토어로 이동"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>공식몰</span>
                        </a>
                      )}
                    </div>
                    <button
                      onClick={() => handleRedeemBenefit(reward)}
                      className={`w-full py-2 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs ${
                        points >= reward.requiredPoints
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                      }`}
                    >
                      {points >= reward.requiredPoints ? '포인트로 교환하기' : '포인트 부족'}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: ORDER HISTORY & DELIVERY TRACKING
          ======================================================== */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-stone-700 px-1">
            <span>내 주문 및 배송 상태 ({orders.length}건)</span>
            <span className="text-[11px] text-stone-400 font-normal">
              실제 주문 내역이 있는 상품에 한해 구매 후기(리뷰)를 작성할 수 있습니다.
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center space-y-3 border border-stone-100 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto text-2xl">
                📦
              </div>
              <h4 className="text-base font-bold text-stone-900">주문 내역이 없습니다.</h4>
              <p className="text-xs text-stone-500">
                모으개 SHOP에서 GPS 산책 목걸이와 다양한 반려동물 용품을 주문해 보세요.
              </p>
              <button
                onClick={() => setActiveTab('goods')}
                className="mt-2 px-4 py-2 bg-amber-500 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                상품 보러 가기
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-3xl p-5 shadow-xs border border-stone-100 space-y-4"
                >
                  {/* Order Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-stone-900 font-mono">{ord.orderNumber}</span>
                      <span className="text-xs text-stone-400">· {ord.date}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-xl shadow-2xs ${
                          ord.status === '배송 완료'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === '배송중'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        🚚 {ord.status}
                      </span>
                      <button
                        onClick={() => setTrackingOrder(ord)}
                        className="px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                      >
                        배송 조회
                      </button>
                    </div>
                  </div>

                  {/* Items List with Direct Review Writing Button */}
                  <div className="space-y-3">
                    {ord.items.map((it, idx) => {
                      const matchedProd = initialShopProducts.find((p) => p.id === it.productId);
                      return (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-3xl shrink-0">
                            {it.productImage}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-bold text-stone-900 truncate">{it.productName}</h5>
                            <div className="text-xs text-stone-500 mt-0.5 flex items-center gap-2 flex-wrap">
                              <span>수량: {it.quantity}개</span>
                              {Object.entries(it.selectedOptions).map(([k, v]) => (
                                <span key={k} className="text-stone-400">
                                  {k}: <strong className="text-stone-700">{v}</strong>
                                </span>
                              ))}
                            </div>
                            {it.isGpsCollar && (
                              <span className="inline-block mt-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                                🛰️ GPS 목걸이 산책 미션 연동 상품
                              </span>
                            )}
                          </div>
                          <div className="text-right flex flex-col items-end gap-1">
                            <span className="text-sm font-extrabold text-stone-900 tabular-nums">
                              {(it.priceAtOrder * it.quantity).toLocaleString()}원
                            </span>
                            {matchedProd && (
                              <button
                                type="button"
                                onClick={() => handleOpenProduct(matchedProd, 'reviews')}
                                className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Edit3 className="w-3 h-3 text-amber-600" />
                                <span>후기 작성/보기</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Destination & Payment Summary */}
                  <div className="bg-stone-50/80 p-3.5 rounded-2xl text-xs space-y-1.5 text-stone-600">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">받는 분:</span>
                      <span className="font-bold text-stone-800">{ord.shippingAddress.recipientName} ({ord.shippingAddress.phone})</span>
                    </div>
                    <div className="flex items-start justify-between">
                      <span className="text-stone-400 shrink-0">배송지:</span>
                      <span className="text-right text-stone-800">{ord.shippingAddress.roadAddress} {ord.shippingAddress.detailAddress}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-stone-200/60 font-semibold">
                      <span>최종 결제 금액 (포인트 할인 {ord.pointsDiscount.toLocaleString()}P):</span>
                      <span className="text-amber-600 font-black text-sm tabular-nums">
                        {ord.finalPaidAmount.toLocaleString()}원
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          MODAL 1: PRODUCT DETAIL & REVIEWS (Comprehensive Tabs)
          ======================================================== */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-stone-100 flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-3xl shrink-0">
                  {selectedProduct.image}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                      {selectedProduct.category}
                    </span>
                    {selectedProduct.isGpsCollar && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                        GPS 동행 인증 기기
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-stone-900 mt-0.5">{selectedProduct.name}</h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs: [상품 상세 정보] vs [구매자 상품 후기 (리뷰)] */}
            <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
              <button
                type="button"
                onClick={() => setModalTab('detail')}
                className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  modalTab === 'detail'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                상품 상세 정보
              </button>
              <button
                type="button"
                onClick={() => setModalTab('reviews')}
                className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  modalTab === 'reviews'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>구매자 상품 후기 ({currentProductReviews.length})</span>
              </button>
            </div>

            {/* TAB CONTENT: 1. Detail Tab */}
            {modalTab === 'detail' && (
              <div className="space-y-4 text-xs overflow-y-auto">
                <p className="text-stone-700 leading-relaxed bg-stone-50 p-4 rounded-2xl whitespace-pre-line text-xs sm:text-sm">
                  {selectedProduct.fullDesc}
                </p>

                {/* Feature Points */}
                <div className="space-y-2 p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
                  <span className="font-bold text-amber-900 block text-xs">✨ 제품 주요 특징</span>
                  <ul className="space-y-1.5 text-stone-600 list-disc list-inside">
                    {selectedProduct.features.map((feat, idx) => (
                      <li key={idx} className="leading-snug">{feat}</li>
                    ))}
                  </ul>
                </div>

                {/* Options selection */}
                {selectedProduct.options && selectedProduct.options.length > 0 && (
                  <div className="space-y-2 pt-1">
                    {selectedProduct.options.map((opt) => (
                      <div key={opt.name} className="space-y-1">
                        <label className="block text-stone-700 font-bold">{opt.name}</label>
                        <select
                          value={selectedOptions[opt.name] || opt.choices[0]}
                          onChange={(e) =>
                            setSelectedOptions({ ...selectedOptions, [opt.name]: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
                        >
                          {opt.choices.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quantity selector */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                  <span className="font-bold text-stone-800">구매 수량</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-bold text-sm tabular-nums">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Price calculation */}
                <div className="p-4 bg-stone-900 text-white rounded-2xl flex items-center justify-between">
                  <span className="text-stone-300">총 상품 금액:</span>
                  <span className="text-lg font-black text-amber-400 tabular-nums">
                    {(selectedProduct.price * quantity).toLocaleString()} <span className="text-xs text-white">원</span>
                  </span>
                </div>

                {/* Actions: Cart or Buy */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleAddToCartClick(selectedProduct, false)}
                    className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4 text-amber-600" />
                    <span>장바구니 담기</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddToCartClick(selectedProduct, true)}
                    className="flex-1 py-3 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  >
                    <span>바로 구매하기</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 2. Reviews Tab (Requirement 4) */}
            {modalTab === 'reviews' && (
              <div className="space-y-4 overflow-y-auto">
                {/* Rating Overview Summary Box */}
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-center sm:text-left">
                    <div>
                      <div className="text-3xl sm:text-4xl font-black text-amber-600 tabular-nums">
                        {getProductRatingSummary(selectedProduct).rating}
                      </div>
                      <div className="flex items-center justify-center sm:justify-start gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= Math.round(getProductRatingSummary(selectedProduct).rating)
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-stone-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] text-stone-500 mt-1 block">
                        총 {currentProductReviews.length}개의 실제 구매자 및 검증 후기
                      </span>
                    </div>
                  </div>

                  {/* Write Review Button */}
                  <div className="text-center sm:text-right">
                    <button
                      type="button"
                      onClick={handleOpenReviewWriter}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>구매 후기 작성하기</span>
                    </button>
                    <span className="text-[10px] text-stone-400 mt-1 block">
                      실제 구매 고객 전용 · 작성 시 +200P
                    </span>
                  </div>
                </div>

                {/* Non-buyer restriction alert */}
                {showBuyerOnlyNotice && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-2 animate-fadeIn">
                    <div className="flex items-center gap-2 font-bold text-rose-700">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>실제 구매 고객 전용 리뷰 작성 안내</span>
                    </div>
                    <p className="leading-relaxed text-rose-800">
                      모으개 SHOP에서는 신뢰할 수 있는 솔직한 후기 생태계를 유지하기 위해, <strong>해당 상품의 실제 주문 및 결제 내역이 확인된 회원만 리뷰를 작성</strong>하실 수 있습니다.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setShowBuyerOnlyNotice(false);
                          setSelectedProduct(null);
                          setActiveTab('orders');
                        }}
                        className="px-3 py-1.5 bg-rose-600 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                      >
                        내 주문내역 확인
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowBuyerOnlyNotice(false)}
                        className="px-3 py-1.5 bg-white border border-rose-300 text-rose-700 rounded-lg font-medium text-[11px] cursor-pointer"
                      >
                        닫기
                      </button>
                    </div>
                  </div>
                )}

                {/* Inline Write Review Form for Verified Buyers */}
                {isWritingReview && (
                  <form onSubmit={handleSubmitReview} className="p-4 rounded-2xl bg-stone-50 border border-amber-300 space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                        <Edit3 className="w-4 h-4 text-amber-600" />
                        구매 후기 등록
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsWritingReview(false)}
                        className="text-stone-400 hover:text-stone-600 text-xs"
                      >
                        취소
                      </button>
                    </div>

                    {/* Star selector */}
                    <div>
                      <label className="text-[11px] font-bold text-stone-700 block mb-1">별점 선택</label>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewReviewForm((prev) => ({ ...prev, rating: star }))}
                            className="cursor-pointer p-1"
                          >
                            <Star
                              className={`w-6 h-6 transition-colors ${
                                star <= newReviewForm.rating
                                  ? 'text-amber-500 fill-amber-500'
                                  : 'text-stone-300'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="text-xs font-bold text-stone-700 ml-2">{newReviewForm.rating}점</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-700 block mb-1">후기 제목</label>
                      <input
                        type="text"
                        value={newReviewForm.title}
                        onChange={(e) => setNewReviewForm((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="예: 기대 이상으로 튼튼하고 아이가 너무 편해해요!"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-700 block mb-1">후기 내용</label>
                      <textarea
                        rows={3}
                        value={newReviewForm.content}
                        onChange={(e) => setNewReviewForm((prev) => ({ ...prev, content: e.target.value }))}
                        placeholder="실제 사용 후기와 다른 반려인들에게 도움될 만한 팁을 자유롭게 작성해 주세요."
                        className="w-full px-3 py-2 bg-white rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
                        required
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsWritingReview(false)}
                        className="px-3 py-1.5 rounded-lg bg-stone-200 text-stone-700 text-xs font-semibold"
                      >
                        작성 취소
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs cursor-pointer"
                      >
                        후기 등록 완료 (+200P)
                      </button>
                    </div>
                  </form>
                )}

                {/* Sort Controls */}
                <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
                  <span>후기 {currentProductReviews.length}개</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setReviewSort('latest')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                        reviewSort === 'latest' ? 'bg-stone-900 text-white font-bold' : 'hover:bg-stone-100'
                      }`}
                    >
                      최신순
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewSort('highest')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                        reviewSort === 'highest' ? 'bg-stone-900 text-white font-bold' : 'hover:bg-stone-100'
                      }`}
                    >
                      별점 높은순
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewSort('lowest')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                        reviewSort === 'lowest' ? 'bg-stone-900 text-white font-bold' : 'hover:bg-stone-100'
                      }`}
                    >
                      별점 낮은순
                    </button>
                  </div>
                </div>

                {/* Review Cards List */}
                <div className="space-y-3">
                  {currentProductReviews.length === 0 ? (
                    <div className="py-12 text-center text-stone-400 space-y-2 bg-stone-50 rounded-2xl">
                      <span className="text-3xl block">✍️</span>
                      <p className="font-bold text-stone-600">첫 번째 후기를 작성해보세요.</p>
                      <p className="text-xs">이 상품을 구매하신 보호자님의 솔직한 후기가 큰 도움이 됩니다.</p>
                    </div>
                  ) : (
                    currentProductReviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-4 rounded-2xl bg-white border border-stone-200/80 space-y-2 shadow-2xs hover:border-amber-300 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            {/* Stars */}
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3.5 h-3.5 ${
                                    star <= rev.rating ? 'text-amber-500 fill-amber-500' : 'text-stone-200'
                                  }`}
                                />
                              ))}
                              <span className="text-xs font-bold text-stone-800 ml-1">{rev.rating}점</span>
                            </div>
                            <h5 className="text-xs sm:text-sm font-bold text-stone-900 mt-1">{rev.title}</h5>
                          </div>

                          {/* Verification and Sample Tags */}
                          <div className="flex flex-col items-end gap-1">
                            {rev.isVerifiedPurchase && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                실제 구매 인증
                              </span>
                            )}
                            {rev.isSampleData && (
                              <span className="text-[10px] font-semibold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                                [체험단/초기 검증 샘플 리뷰]
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Options Tag */}
                        {rev.selectedOptionsText && (
                          <div className="text-[11px] text-stone-400 font-medium">
                            [구매옵션: {rev.selectedOptionsText}]
                          </div>
                        )}

                        {/* Content */}
                        <p className="text-xs text-stone-700 leading-relaxed whitespace-pre-line">
                          {rev.content}
                        </p>

                        {/* Author & Date Footer */}
                        <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1 border-t border-stone-100">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-stone-600">{rev.authorName}</span>
                            {rev.authorPetBreed && (
                              <span>· {rev.authorPetBreed}</span>
                            )}
                          </div>
                          <span>{rev.date}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: CHECKOUT & POINTS USAGE MODAL
          ======================================================== */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-stone-100">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-stone-900">주문서 작성 및 결제</h3>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmOrder} className="space-y-4 text-xs">
              {/* Order Items Summary */}
              <div className="p-3 bg-stone-50 rounded-2xl space-y-2">
                <span className="font-bold text-stone-700 block">주문 상품 정보 ({checkoutItems.length}종류)</span>
                {checkoutItems.map((ci, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs text-stone-600">
                    <span className="truncate max-w-[200px]">{ci.product.name} ({ci.quantity}개)</span>
                    <span className="font-bold text-stone-800 tabular-nums">
                      {(ci.product.price * ci.quantity).toLocaleString()}원
                    </span>
                  </div>
                ))}
              </div>

              {/* Shipping Address Inputs */}
              <div className="space-y-2">
                <span className="font-bold text-stone-800 block text-xs">📦 배송지 정보</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={shippingForm.recipientName}
                    onChange={(e) => setShippingForm({ ...shippingForm, recipientName: e.target.value })}
                    placeholder="받는 사람 이름"
                    className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                    required
                  />
                  <input
                    type="text"
                    value={shippingForm.phone}
                    onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                    placeholder="연락처 (010-XXXX-XXXX)"
                    className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                    required
                  />
                </div>
                <input
                  type="text"
                  value={shippingForm.roadAddress}
                  onChange={(e) => setShippingForm({ ...shippingForm, roadAddress: e.target.value })}
                  placeholder="도로명 주소"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  required
                />
                <input
                  type="text"
                  value={shippingForm.detailAddress}
                  onChange={(e) => setShippingForm({ ...shippingForm, detailAddress: e.target.value })}
                  placeholder="상세 주소 (동/호수)"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  required
                />
              </div>

              {/* Points Discount Box */}
              <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-amber-600" />
                    모으개 포인트 사용
                  </span>
                  <span className="text-[11px] text-amber-700">보유: {points.toLocaleString()}P</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={maxPointsUsable}
                    value={pointsToUse === 0 ? '' : pointsToUse}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setPointsToUse(Math.min(maxPointsUsable, Math.max(0, val)));
                    }}
                    placeholder="0"
                    className="flex-1 p-2 bg-white border border-stone-200 rounded-xl text-right font-bold text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setPointsToUse(maxPointsUsable)}
                    className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    전액 사용
                  </button>
                </div>
              </div>

              {/* Total Summary */}
              <div className="p-3 bg-stone-900 text-white rounded-2xl space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-300">
                  <span>총 상품금액</span>
                  <span>{checkoutGoodsTotal.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-stone-300">
                  <span>배송비</span>
                  <span>{checkoutShippingFee === 0 ? '무료' : `+${checkoutShippingFee.toLocaleString()}원`}</span>
                </div>
                {pointsToUse > 0 && (
                  <div className="flex justify-between text-amber-400 font-bold">
                    <span>포인트 할인</span>
                    <span>-{pointsToUse.toLocaleString()}P</span>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-stone-800 text-sm font-black">
                  <span>최종 결제 금액</span>
                  <span className="text-amber-400 text-base tabular-nums">
                    {finalPaid.toLocaleString()}원
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>{finalPaid.toLocaleString()}원 결제 및 주문 완료</span>
                <Check className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 4: DELIVERY REAL-TIME TRACKING MODAL
          ======================================================== */}
      {trackingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto border border-stone-100">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-stone-900">실시간 배송 조회</h3>
              </div>
              <button
                onClick={() => setTrackingOrder(null)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-2xl space-y-1">
                <div className="flex justify-between text-stone-500">
                  <span>운송장 번호</span>
                  <span className="font-mono font-bold text-stone-900">{trackingOrder.courierName} {trackingOrder.trackingNumber}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>배송 상태</span>
                  <span className="font-bold text-amber-600">{trackingOrder.status}</span>
                </div>
              </div>

              {/* Tracking Timeline */}
              <div className="space-y-3 pl-2 border-l-2 border-amber-200">
                {trackingOrder.trackingHistory.map((h, idx) => (
                  <div key={idx} className="relative pl-3 space-y-0.5">
                    <span className="absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <div className="text-stone-400 text-[10px]">{h.date} {h.time}</div>
                    <div className="font-bold text-stone-900">{h.status}</div>
                    <div className="text-stone-500 text-[11px]">{h.location}</div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setTrackingOrder(null)}
              className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl cursor-pointer"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 5: BENEFIT DETAIL MODAL (제휴 혜택 상세 정보)
          ======================================================== */}
      {selectedRewardBenefit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-lg shadow-2xl space-y-5 max-h-[88vh] overflow-y-auto border border-stone-100">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-3xl shadow-inner border border-amber-100">
                  {selectedRewardBenefit.image}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                      {selectedRewardBenefit.brandName}
                    </span>
                    {selectedRewardBenefit.discountBadge && (
                      <span className="text-[10px] font-bold bg-rose-500 text-white px-2 py-0.5 rounded-full">
                        {selectedRewardBenefit.discountBadge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 mt-1">
                    {selectedRewardBenefit.name}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedRewardBenefit(null)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description & Cost */}
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/60 space-y-2">
              <p className="text-xs text-stone-700 leading-relaxed">
                {selectedRewardBenefit.description}
              </p>
              <div className="pt-2 border-t border-stone-200/60 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-stone-400 line-through mr-2">
                    {selectedRewardBenefit.originalPrice.toLocaleString()}원 상당
                  </span>
                  <span className="text-xs font-bold text-amber-600">혜택 교환 포인트</span>
                </div>
                <div className="text-xl font-black text-amber-600">
                  {selectedRewardBenefit.requiredPoints.toLocaleString()} <span className="text-xs font-bold text-stone-700">P</span>
                </div>
              </div>
            </div>

            {/* Coverage Scope (if hospital) */}
            {selectedRewardBenefit.coverageScope && (
              <div className="space-y-1.5">
                <h5 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  진료 및 검진 지원 범위
                </h5>
                <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-xs text-stone-700 leading-relaxed">
                  {selectedRewardBenefit.coverageScope}
                </div>
              </div>
            )}

            {/* Usage Conditions */}
            {selectedRewardBenefit.usageConditions && (
              <div className="space-y-1.5">
                <h5 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-600" />
                  상세 이용 조건 및 주의사항
                </h5>
                <ul className="p-3 bg-stone-50 rounded-2xl space-y-1.5 text-xs text-stone-600 border border-stone-100">
                  {selectedRewardBenefit.usageConditions.map((cond, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{cond}</span>
                    </li>
                  ))}
                  {selectedRewardBenefit.terms && (
                    <li className="flex items-start gap-2 text-stone-500 pt-1 border-t border-stone-200/60">
                      <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                      <span>{selectedRewardBenefit.terms}</span>
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Available Hospitals */}
            {selectedRewardBenefit.availableHospitals && (
              <div className="space-y-1.5">
                <h5 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-stone-700" />
                  이용 가능 제휴 병원
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRewardBenefit.availableHospitals.map((h, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-stone-100 border border-stone-200 text-stone-700 rounded-xl text-xs font-medium"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* External URL link if partner shop */}
            {selectedRewardBenefit.externalUrl && (
              <div className="pt-2">
                <a
                  href={selectedRewardBenefit.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{selectedRewardBenefit.brandName} 공식 브랜드몰 바로가기</span>
                </a>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-3 border-t border-stone-100 flex items-center gap-2">
              <button
                onClick={() => setSelectedRewardBenefit(null)}
                className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-2xl cursor-pointer"
              >
                닫기
              </button>
              <button
                onClick={() => handleRedeemBenefit(selectedRewardBenefit)}
                className={`flex-2 py-3 font-bold text-xs rounded-2xl shadow-xs transition-all cursor-pointer ${
                  points >= selectedRewardBenefit.requiredPoints
                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
              >
                {points >= selectedRewardBenefit.requiredPoints
                  ? `${selectedRewardBenefit.requiredPoints.toLocaleString()}P로 즉시 교환`
                  : `포인트 부족 (보유: ${points.toLocaleString()}P)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 6: REDEEMED VOUCHER SUCCESS MODAL (바우처 발급 완료)
          ======================================================== */}
      {redeemedVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl space-y-5 text-center border border-stone-100">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto shadow-inner">
              🎉
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                포인트 교환 완료
              </span>
              <h3 className="text-lg font-bold text-stone-900 mt-2">
                제휴 혜택 바우처가 발급되었습니다!
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                {redeemedVoucher.reward.name}
              </p>
            </div>

            {/* Voucher Card Simulation */}
            <div className="bg-linear-to-br from-amber-500 to-orange-600 text-white p-5 rounded-2xl shadow-md text-left space-y-3">
              <div className="flex items-center justify-between text-xs text-amber-100 font-bold">
                <span>MOGEGAE PARTNER VOUCHER</span>
                <span>{redeemedVoucher.reward.discountBadge || '공식 인증'}</span>
              </div>
              <div className="font-mono text-xl font-black tracking-widest text-center py-2 bg-black/20 rounded-xl backdrop-blur-xs">
                {redeemedVoucher.code}
              </div>
              <div className="text-[11px] text-amber-100 space-y-0.5">
                <div>제공처: {redeemedVoucher.reward.provider || redeemedVoucher.reward.brandName}</div>
                <div>유효기간: 발급일로부터 90일 (제휴 병원/매장 현장 제시)</div>
              </div>
            </div>

            <div className="bg-stone-50 rounded-2xl p-3 text-[11px] text-stone-600 space-y-1 text-left border border-stone-100">
              <div className="font-bold text-stone-800">이용 안내</div>
              <div>• 제휴 동물병원 내원 시 데스크에 모바일 바우처 코드를 제시하세요.</div>
              <div>• 온라인 브랜드몰 상품은 교환 시 배송 안내 문자가 함께 발송됩니다.</div>
              <div>• 발급된 바우처 내역은 마이페이지 포인트 내역에서 언제든 다시 조회할 수 있습니다.</div>
            </div>

            <button
              onClick={() => setRedeemedVoucher(null)}
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-2xl cursor-pointer"
            >
              확인 완료
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
