"use client";

import { useState } from "react";
import Image from "next/image";
import { Minus, Plus, Info, TriangleAlert, X } from "lucide-react";
import { CartState, EditionId } from "./types";
import { EDITIONS, DELIVERY_FEE, formatPrice } from "./preorder.constants";

interface OrderSummaryProps {
  cart: CartState;
  onUpdateQuantity: (id: EditionId, quantity: number) => void;
  onPayNow: () => void;
}

export function OrderSummary({
  cart,
  onUpdateQuantity,
  onPayNow,
}: OrderSummaryProps) {
  const [showNote, setShowNote] = useState<boolean>(true);

  const activeEntries = (Object.keys(cart) as EditionId[]).filter(
    (id) => cart[id] > 0
  );

  const subtotal = activeEntries.reduce(
    (sum, id) => sum + cart[id] * EDITIONS[id].price,
    0
  );
  const delivery = subtotal > 0 ? DELIVERY_FEE : 0;
  const total = subtotal + delivery;

  return (
    <div className="w-full max-w-md mx-auto lg:mx-0 lg:sticky lg:top-8">
      <div className="bg-[#f8fafc] border border-slate-200/70 rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-xs">
        <h2 className="text-base sm:text-lg font-medium text-slate-950 mb-5">
          Order Summary
        </h2>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs mb-6 flex flex-col gap-4">
          {activeEntries.length > 0 ? (
            activeEntries.map((id) => {
              const edition = EDITIONS[id];
              const qty = cart[id];
              return (
                <div
                  key={id}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/60 shrink-0">
                      <Image
                        src={edition.image}
                        alt={edition.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="text-xs sm:text-sm font-medium text-slate-900 truncate">
                        {edition.name}
                      </span>
                      <div className="flex items-center gap-2 bg-[#f8fafc] rounded-full px-2.5 py-0.5 border border-slate-200/60 w-fit">
                        <button
                          type="button"
                          aria-label={`Decrease ${edition.name} quantity`}
                          onClick={() =>
                            onUpdateQuantity(id, Math.max(0, qty - 1))
                          }
                          className="text-slate-500 hover:text-slate-800 text-xs px-0.5 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-semibold text-slate-800 min-w-3 text-center">
                          {qty}
                        </span>
                        <button
                          type="button"
                          aria-label={`Increase ${edition.name} quantity`}
                          onClick={() => onUpdateQuantity(id, qty + 1)}
                          className="text-slate-500 hover:text-slate-800 text-xs px-0.5 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-900 shrink-0">
                    {formatPrice(qty * edition.price)}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-slate-400 text-center py-2">
              No items selected. Choose an edition below.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600">
            <span>Subtotal</span>
            <span className="font-medium text-slate-900">
              {formatPrice(subtotal)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600">
            <span>Delivery fee</span>
            <span className="font-medium text-slate-900">
              {formatPrice(delivery)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm sm:text-base font-bold text-slate-950 pt-3 border-t border-slate-200/80 mt-1">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onPayNow}
          className="w-full bg-black hover:bg-neutral-900 active:scale-[0.99] text-white font-medium py-3.5 px-4 rounded-full mt-6 transition-all duration-150 shadow-sm cursor-pointer flex items-center justify-center text-sm"
        >
          Pay now
        </button>

        <div className="flex items-center gap-1.5 mt-3 text-[11px] text-slate-500 leading-snug">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>
            Payments are processed securely via Paystack. Your card details
            are never stored on this site.
          </span>
        </div>
      </div>

      {showNote && (
        <div className="mt-5 bg-[#fff5f2] border border-[#fed7aa]/70 rounded-2xl p-4 sm:p-5 relative transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TriangleAlert className="w-4 h-4 text-[#ea580c] shrink-0" />
              <span className="text-xs font-bold text-[#ea580c] tracking-wider uppercase">
                KINDLY NOTE!
              </span>
            </div>
            <button
              type="button"
              aria-label="Dismiss note"
              onClick={() => setShowNote(false)}
              className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs sm:text-[13px] text-stone-600 mt-2 leading-relaxed font-normal">
            Kindly note that delivery is not free. ₦35,000 is for the book only.
            Delivery charges would be collected at checkout
          </p>
        </div>
      )}
    </div>
  );
}

