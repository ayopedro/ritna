"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Minus, Plus, Info, TriangleAlert, X } from "lucide-react";
import toast from "react-hot-toast";
import { ShippingModal, type ShippingDetails } from "./modals";

const BOOK_IMAGES = [
  {
    src: "/assets/ritna4.jpg",
    alt: "Rumbles in the New Academy - Slide 1",
  },
  {
    src: "/assets/ritna1.jpg",
    alt: "Rumbles in the New Academy - Slide 2",
  },
  {
    src: "/assets/ritna2.jpg",
    alt: "Rumbles in the New Academy - Slide 3",
  },
  {
    src: "/assets/ritna3.jpg",
    alt: "Rumbles in the New Academy - Slide 4",
  },
  {
    src: "/assets/ritna5.jpg",
    alt: "Rumbles in the New Academy - Slide 5",
  },
  {
    src: "/assets/ritna6.jpg",
    alt: "Rumbles in the New Academy - Slide 6",
  },
  {
    src: "/assets/ritna7.jpg",
    alt: "Rumbles in the New Academy - Slide 7",
  },
];

export function Preorder() {
  const [hardcoverQty, setHardcoverQty] = useState<number>(0);
  const [softcoverQty, setSoftcoverQty] = useState<number>(0);
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showNote, setShowNote] = useState<boolean>(true);
  const [isShippingModalOpen, setIsShippingModalOpen] =
    useState<boolean>(false);


  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % BOOK_IMAGES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const HARDCOVER_PRICE = 35000;
  const SOFTCOVER_PRICE = 25000;
  const DELIVERY_FEE = 5000;

  const subtotal =
    hardcoverQty * HARDCOVER_PRICE + softcoverQty * SOFTCOVER_PRICE;
  const delivery = subtotal > 0 ? DELIVERY_FEE : 0;
  const total = subtotal + delivery;

  const handlePayNow = () => {
    if (hardcoverQty === 0 && softcoverQty === 0) {
      toast.error("Please select at least one copy to preorder.");
      return;
    }
    setIsShippingModalOpen(true);
  };

  const handleConfirmShipping = (details: ShippingDetails) => {
    toast.success(
      `Order confirmed for ${details.fullName}! Total: ₦${total.toLocaleString()}`,
      { duration: 4500 },
    );
    setHardcoverQty(0);
    setSoftcoverQty(0);
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

            <div
              className="w-full max-w-xl mx-auto lg:mx-0"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="relative aspect-square w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs border border-slate-100 bg-slate-900">
                <div
                  className="flex h-full w-full transition-transform duration-700 ease-out"
                  style={{ transform: `translateX(-${activeSlide * 100}%)` }}
                >
                  {BOOK_IMAGES.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative min-w-full h-full shrink-0"
                    >
                      <Image
                        src={img.src}
                        alt={img.alt}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                        className="object-cover select-none"
                        priority={idx === 0}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 mt-4 mb-10">
                {BOOK_IMAGES.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`View slide ${idx + 1}`}
                    onClick={() => setActiveSlide(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                      activeSlide === idx
                        ? "bg-slate-600 w-4"
                        : "bg-slate-200 hover:bg-slate-300 w-2.5"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="max-w-xl mx-auto lg:mx-0 w-full">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 text-center mb-6">
                Choose your edition
              </h2>

              <div className="flex flex-col gap-4">
                {/* Hardcover Card */}
                <div className="border border-slate-200 rounded-2xl p-5 flex items-center justify-between gap-4 bg-white hover:border-slate-300 transition-colors shadow-xs">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-950 text-sm tracking-wide">
                        HARDCOVER
                      </span>
                      <span className="text-[11px] font-semibold text-blue-600 bg-blue-100/80 px-2 py-0.5 rounded-md">
                        ₦35,000/COPY
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-snug">
                      Premium print hardcover edition, shipped to your delivery
                      address
                    </p>
                  </div>

                  <div className="flex items-center gap-3 bg-[#f8fafc] rounded-full px-3 py-1.5 border border-slate-200/70 shrink-0">
                    <button
                      type="button"
                      aria-label="Decrease Hardcover quantity"
                      onClick={() =>
                        setHardcoverQty((prev) => Math.max(0, prev - 1))
                      }
                      disabled={hardcoverQty === 0}
                      className="text-slate-600 hover:text-slate-950 disabled:opacity-30 transition-opacity p-0.5 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-sm font-semibold text-slate-900 min-w-4 text-center">
                      {hardcoverQty}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase Hardcover quantity"
                      onClick={() => setHardcoverQty((prev) => prev + 1)}
                      className="text-slate-600 hover:text-slate-950 transition-colors p-0.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-2xl p-5 flex items-center justify-between gap-4 bg-white hover:border-slate-300 transition-colors shadow-xs">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-950 text-sm tracking-wide">
                        SOFTCOVER
                      </span>
                      <span className="text-[11px] font-semibold text-blue-600 bg-blue-100/80 px-2 py-0.5 rounded-md">
                        ₦25,000/COPY
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-snug">
                      Premium print softcover edition, shipped to your delivery
                      address
                    </p>
                  </div>

                  <div className="flex items-center gap-3 bg-[#f8fafc] rounded-full px-3 py-1.5 border border-slate-200/70 shrink-0">
                    <button
                      type="button"
                      aria-label="Decrease Softcover quantity"
                      onClick={() =>
                        setSoftcoverQty((prev) => Math.max(0, prev - 1))
                      }
                      disabled={softcoverQty === 0}
                      className="text-slate-600 hover:text-slate-950 disabled:opacity-30 transition-opacity p-0.5 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-sm font-semibold text-slate-900 min-w-4 text-center">
                      {softcoverQty}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase Softcover quantity"
                      onClick={() => setSoftcoverQty((prev) => prev + 1)}
                      className="text-slate-600 hover:text-slate-950 transition-colors p-0.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-2xl p-5 flex items-center justify-between gap-4 bg-white hover:border-slate-300 transition-colors shadow-xs">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-sm">
                        Institutional copy
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        COMING SOON
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-snug">
                      Bulk licensing for schools, libraries & organizations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-md mx-auto lg:mx-0 lg:sticky lg:top-8">
            {/* Order summary container */}
            <div className="bg-[#f8fafc] border border-slate-200/70 rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-xs">
              <h2 className="text-base sm:text-lg font-medium text-slate-950 mb-5">
                Order Summary
              </h2>

              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs mb-6 flex flex-col gap-4">
                {/* RITNA Hardcover */}
                {hardcoverQty > 0 ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/60 shrink-0">
                        <Image
                          src={BOOK_IMAGES[0].src}
                          alt="RITNA Hardcover"
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-xs sm:text-sm font-medium text-slate-900 truncate">
                          RITNA Hardcover
                        </span>
                        <div className="flex items-center gap-2 bg-[#f8fafc] rounded-full px-2.5 py-0.5 border border-slate-200/60 w-fit">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() =>
                              setHardcoverQty((p) => Math.max(0, p - 1))
                            }
                            className="text-slate-500 hover:text-slate-800 text-xs px-0.5 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-semibold text-slate-800 min-w-3 text-center">
                            {hardcoverQty}
                          </span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() => setHardcoverQty((p) => p + 1)}
                            className="text-slate-500 hover:text-slate-800 text-xs px-0.5 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-slate-900 shrink-0">
                      ₦{(hardcoverQty * HARDCOVER_PRICE).toLocaleString()}
                    </span>
                  </div>
                ) : null}

                {softcoverQty > 0 ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/60 shrink-0">
                        <Image
                          src={BOOK_IMAGES[3].src}
                          alt="RITNA Softcover"
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-xs sm:text-sm font-medium text-slate-900 truncate">
                          RITNA Softcover
                        </span>
                        <div className="flex items-center gap-2 bg-[#f8fafc] rounded-full px-2.5 py-0.5 border border-slate-200/60 w-fit">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() =>
                              setSoftcoverQty((p) => Math.max(0, p - 1))
                            }
                            className="text-slate-500 hover:text-slate-800 text-xs px-0.5 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-semibold text-slate-800 min-w-3 text-center">
                            {softcoverQty}
                          </span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() => setSoftcoverQty((p) => p + 1)}
                            className="text-slate-500 hover:text-slate-800 text-xs px-0.5 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-slate-900 shrink-0">
                      ₦{(softcoverQty * SOFTCOVER_PRICE).toLocaleString()}
                    </span>
                  </div>
                ) : null}

                {hardcoverQty === 0 && softcoverQty === 0 && (
                  <p className="text-xs text-slate-400 text-center py-2">
                    No items selected. Choose an edition below.
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-900">
                    ₦{subtotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600">
                  <span>Delivery fee</span>
                  <span className="font-medium text-slate-900">
                    ₦{delivery.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm sm:text-base font-bold text-slate-950 pt-3 border-t border-slate-200/80 mt-1">
                  <span>Total</span>
                  <span>₦{total.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePayNow}
                className="w-full bg-black hover:bg-neutral-900 active:scale-[0.99] text-white font-medium py-3.5 px-4 rounded-full mt-6 transition-all duration-150 shadow-sm cursor-pointer flex items-center justify-center text-sm"
              >
                Pay now
              </button>

              <div className="flex items-center gap-1.5 mt-3 text-[11px] text-slate-500 leading-snug">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  Payments are processed securely via Paystack. Your card
                  details are never stored on this site.
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
                  Kindly note that delivery is not free. ₦35,000 is for the book
                  only. Delivery charges would be collected at checkout
                </p>
              </div>
            )}
          </div>
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
