import React from 'react';
import {
  X,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  cart: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart?: () => void;
  onStartCheckout: (items: CartItem[]) => void;
  onNavigateToShop: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  cart,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onStartCheckout,
  onNavigateToShop,
}) => {
  if (!isOpen) return null;

  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const goodsTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingFee = goodsTotal >= 30000 || goodsTotal === 0 ? 0 : 3000;
  const grandTotal = goodsTotal + shippingFee;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop click to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-slideLeft z-10 border-l border-stone-200/80">
        {/* Drawer Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-stone-900">장바구니</h3>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                  {totalItemsCount}개
                </span>
              </div>
              <p className="text-[11px] text-stone-400">모으개 SHOP에서 담은 상품 목록입니다.</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {cart.length > 0 && onClearCart && (
              <button
                type="button"
                onClick={onClearCart}
                className="text-[11px] text-stone-400 hover:text-stone-700 px-2 py-1 rounded-lg hover:bg-stone-50 cursor-pointer transition-colors"
                title="장바구니 비우기"
              >
                전체 삭제
              </button>
            )}
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-100 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cart Items List or Empty State */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-20 h-20 rounded-3xl bg-amber-50 text-amber-500 flex items-center justify-center text-3xl shadow-inner">
                <ShoppingCart className="w-10 h-10 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-stone-900">장바구니가 비어 있습니다</h4>
                <p className="text-xs text-stone-400 max-w-xs leading-relaxed">
                  모으개 스마트 GPS 목걸이와 건강 맞춤 사료, 산책 용품을 둘러보고 장바구니에 담아보세요.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToShop();
                }}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>모으개 SHOP 둘러보기</span>
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="p-3.5 bg-stone-50/70 border border-stone-200/80 rounded-2xl space-y-2.5 hover:border-amber-200 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-xl bg-white border border-stone-200/60 flex items-center justify-center text-2xl shrink-0 shadow-2xs">
                    {item.product.image}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-stone-900 truncate">{item.product.name}</h4>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        className="text-stone-300 hover:text-rose-500 p-0.5 cursor-pointer transition-colors"
                        title="상품 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Options list */}
                    {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                      <div className="text-[11px] text-stone-500 mt-0.5 flex flex-wrap gap-1">
                        {Object.entries(item.selectedOptions).map(([key, val]) => (
                          <span key={key} className="bg-white px-1.5 py-0.2 rounded border border-stone-200 text-stone-600 text-[10px]">
                            {key}: {val}
                          </span>
                        ))}
                      </div>
                    )}

                    {item.product.isGpsCollar && (
                      <span className="inline-block mt-1 text-[10px] font-bold text-amber-800 bg-amber-100/70 px-1.5 py-0.2 rounded">
                        🛰️ GPS 산책 미션 연동 목걸이
                      </span>
                    )}

                    <div className="flex items-center justify-between mt-2 pt-1">
                      <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-stone-600 hover:bg-stone-100 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-stone-900 tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-stone-600 hover:bg-stone-100 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-extrabold text-stone-900 tabular-nums">
                          {(item.product.price * item.quantity).toLocaleString()}원
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer with Price Summary and Checkout Button */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-stone-100 bg-white space-y-3 shadow-lg">
            <div className="space-y-1.5 text-xs text-stone-600">
              <div className="flex items-center justify-between">
                <span>총 상품 금액</span>
                <span className="font-semibold tabular-nums">{goodsTotal.toLocaleString()}원</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <span>배송비</span>
                  <span className="text-[10px] text-stone-400">(3만원 이상 무료)</span>
                </span>
                <span className="font-semibold tabular-nums">
                  {shippingFee === 0 ? <strong className="text-emerald-600">무료</strong> : `${shippingFee.toLocaleString()}원`}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-sm">
                <span className="font-bold text-stone-900">총 결제 예정 금액</span>
                <span className="font-black text-amber-600 text-base tabular-nums">
                  {grandTotal.toLocaleString()} <span className="text-xs font-bold text-stone-800">원</span>
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onStartCheckout(cart);
              }}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-[0.99]"
            >
              <span>총 {totalItemsCount}개 상품 주문하기</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
