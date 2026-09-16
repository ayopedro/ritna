"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { ShippingModal, type ShippingDetails } from "./modals";
import {
  EDITIONS,
  DELIVERY_FEE,
  formatPrice,
  BookCarousel,
  EditionCard,
  InstitutionalCard,
  OrderSummary,
  type CartState,
  type EditionId,
} from "./preorder/index";

export function Preorder() {
  const [cart, setCart] = useState<CartState>({
    hardcover: 0,
    softcover: 0,
  });
  const [isShippingModalOpen, setIsShippingModalOpen] =
    useState<boolean>(false);

  const subtotal = (Object.keys(cart) as EditionId[]).reduce(
    (sum: number, id: EditionId) => sum + cart[id] * EDITIONS[id].price,
    0,
  );
  const delivery = subtotal > 0 ? DELIVERY_FEE : 0;
  const total = subtotal + delivery;

  const handleUpdateQuantity = (id: EditionId, quantity: number) => {
    setCart((prev: CartState) => ({
      ...prev,
      [id]: Math.max(0, quantity),
    }));
  };

  const handlePayNow = () => {
    const totalItems = Object.values(cart).reduce(
      (sum: number, qty: number) => sum + qty,
      0,
    );
    if (totalItems === 0) {
      toast.error("Please select at least one copy to preorder.");
      return;
    }
    setIsShippingModalOpen(true);
  };

  const handleConfirmShipping = (details: ShippingDetails) => {
    toast.success(
      `Order confirmed for ${details.fullName}! Total: ${formatPrice(total)}`,
      { duration: 4500 },
    );
    setCart({
      hardcover: 0,
      softcover: 0,
    });
  };

  return (
    <section
      id="preorder"
      className="w-full bg-white text-slate-900 scroll-mt-6 border-t border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1.18fr_0.82fr] gap-10 lg:gap-14 items-start">
          <div className="flex flex-col">
            <h1 className="text-3xl sm:text-4xl lg:text-[2.65rem] font-medium text-slate-950 tracking-tight leading-[1.18] mb-3">
              Reserve your copy of RITNA <br className="hidden sm:inline" />
              before launch day
            </h1>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed mb-8 max-w-xl">
              Choose your edition, tell us where to send it, and secure your
              pre-order in under two minutes.
            </p>

            <BookCarousel />

            <div className="max-w-xl mx-auto lg:mx-0 w-full">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 text-center mb-6">
                Choose your edition
              </h2>

              <div className="flex flex-col gap-4">
                {(Object.keys(EDITIONS) as EditionId[]).map((id) => (
                  <EditionCard
                    key={id}
                    edition={EDITIONS[id]}
                    quantity={cart[id]}
                    onUpdateQuantity={(qty: number) =>
                      handleUpdateQuantity(id, qty)
                    }
                  />
                ))}

                <InstitutionalCard />
              </div>
            </div>
          </div>

          <OrderSummary
            cart={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onPayNow={handlePayNow}
          />
        </div>
      </div>

      <ShippingModal
        isOpen={isShippingModalOpen}
        onClose={() => setIsShippingModalOpen(false)}
        onConfirm={handleConfirmShipping}
        totalAmount={total}
      />
    </section>
  );
}

export default Preorder;
