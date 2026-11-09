import React from 'react';
import {
  X,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Coins,
  Truck
} from 'lucide-react';
import { CartItem } from '../types';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
  onGoToShop: () => void;
  userPoints?: number;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
  onGoToShop,
  userPoints = 0,
}) => {
  if (!isOpen) return null;

  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const goodsTotal = cart.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );
  const shippingFee = goodsTotal >= 30000 || goodsTotal === 0 ? 0 : 3000;
  const grandTotal = goodsTotal + shippingFee;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-linear-to-r from-amber-50 to-orange-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100/70 p-1 flex items-center justify-center shadow-xs">
              <img
                src="/assets/brand/cart_shopping_box.png"
                alt="장바구니"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-stone-900 tracking-tight">장바구니</h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                총 {totalItemCount}개
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/80 flex items-center justify-center text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {cart.length === 0 ? (
            /* Empty Cart View */
            <div className="text-center py-12 px-4 space-y-4">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-stone-800">장바구니가 비어 있습니다</h4>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  모으개 맞춤 영양제, 안심 GPS 목걸이, 수제 간식을 둘러보고 장바구니에 담아보세요!
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onGoToShop();
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                <span>모으개 SHOP 상품 둘러보기</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Item List */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-500 pb-1 border-b border-stone-100">
                <span>담긴 상품 ({cart.length}종류)</span>
                <button
                  onClick={onClearCart}
                  className="text-stone-400 hover:text-rose-600 transition-colors cursor-pointer underline"
                >
                  전체 삭제
                </button>
              </div>

              {cart.map((item) => {
                const itemTotal = (item.product?.price || 0) * item.quantity;
                const optionsString = Object.entries(item.selectedOptions || {})
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(' / ');

                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center gap-3.5 transition-all hover:bg-stone-100/60"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-xl bg-white border border-stone-200 overflow-hidden flex items-center justify-center shrink-0">
                      {item.product.image.startsWith('http') || item.product.image.startsWith('/') ? (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl">{item.product.image}</span>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-1.5 py-0.5 rounded">
                          {item.product.category}
                        </span>
                        {item.product.isGpsCollar && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                            GPS 디바이스
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-stone-900 truncate mt-0.5">
                        {item.product.name}
                      </h4>
                      {optionsString && (
                        <p className="text-[11px] text-stone-500 truncate mt-0.5">
                          {optionsString}
                        </p>
                      )}
                      <div className="text-xs font-black text-amber-600 mt-1">
                        {item.product.price.toLocaleString()}원
                      </div>
                    </div>

                    {/* Quantity & Item Subtotal */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-stone-400 hover:text-rose-500 transition-colors p-1"
                        title="상품 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center gap-1.5 bg-white border border-stone-300 rounded-lg p-0.5">
                        <button
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="w-6 h-6 flex items-center justify-center text-stone-600 hover:bg-stone-100 rounded text-xs font-bold cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-stone-800 tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="w-6 h-6 flex items-center justify-center text-stone-600 hover:bg-stone-100 rounded text-xs font-bold cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs font-black text-stone-900 tabular-nums">
                        {itemTotal.toLocaleString()}원
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Delivery info badge */}
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-600" />
                  <span>
                    {goodsTotal >= 30000
                      ? '30,000원 이상 구매로 무료배송 적용!'
                      : `${(30000 - goodsTotal).toLocaleString()}원 더 담으면 무료배송!`}
                  </span>
                </div>
                <span className="font-bold">
                  {shippingFee === 0 ? '무료' : '3,000원'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-stone-100 bg-stone-50 space-y-3">
            <div className="space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>총 상품금액</span>
                <span className="font-bold text-stone-900 tabular-nums">
                  {goodsTotal.toLocaleString()}원
                </span>
              </div>
              <div className="flex justify-between">
                <span>배송비</span>
                <span className="font-bold text-stone-900 tabular-nums">
                  {shippingFee === 0 ? '무료' : `+${shippingFee.toLocaleString()}원`}
                </span>
              </div>
              <div className="flex justify-between items-center text-stone-500 pt-1 border-t border-stone-200/80">
                <span className="flex items-center gap-1.5">
                  <img
                    src="/assets/brand/point_coin.png"
                    alt="포인트"
                    className="w-4 h-4 object-contain inline-block shrink-0"
                  />
                  보유 포인트 사용 가능
                </span>
                <span className="font-bold text-amber-600">
                  최대 {Math.min(userPoints, goodsTotal).toLocaleString()} P
                </span>
              </div>
              <div className="flex justify-between items-center text-sm font-black text-stone-900 pt-2 border-t border-stone-200">
                <span>총 결제 예상 금액</span>
                <span className="text-base text-amber-600 tabular-nums">
                  {grandTotal.toLocaleString()}원
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => {
                  onClose();
                  onGoToShop();
                }}
                className="flex-1 py-2.5 rounded-2xl bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
              >
                쇼핑 계속하기
              </button>
              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="flex-2 py-2.5 rounded-2xl bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>주문서 작성 / 결제하기</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
