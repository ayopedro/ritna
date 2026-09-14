"use client";

import { useState } from "react";
import Image from "next/image";
import { Minus, Plus, Info, TriangleAlert, X } from "lucide-react";
import toast from "react-hot-toast";

const BOOK_IMAGES = [
  { src: "/assets/preorder-books.png", alt: "Rumbles in the New Academy - Editions" },
  { src: "/assets/book-blue.png", alt: "Rumbles in the New Academy - Hardcover" },
  { src: "/assets/ritna-bg.jpeg", alt: "Rumbles in the New Academy - Special Edition" },
  { src: "/assets/preorder-books.png", alt: "Rumbles in the New Academy - Back Cover" },
];

export function Preorder() {
  const [hardcoverQty, setHardcoverQty] = useState<number>(0);
  const [softcoverQty, setSoftcoverQty] = useState<number>(0);
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [showNote, setShowNote] = useState<boolean>(true);

  const HARDCOVER_PRICE = 35000;
  const SOFTCOVER_PRICE = 25000;
  const DELIVERY_FEE = 5000;

  const subtotal = hardcoverQty * HARDCOVER_PRICE + softcoverQty * SOFTCOVER_PRICE;
  // Tax is 6% or 2,100 base for single hardcover
  const tax = subtotal > 0 ? Math.round(subtotal * 0.06) : 0;
  const delivery = subtotal > 0 ? DELIVERY_FEE : 0;
  const total = subtotal + tax + delivery;

  const handlePayNow = () => {
    if (hardcoverQty === 0 && softcoverQty === 0) {
      toast.error("Please select at least one copy to preorder.");
      return;
    }
    toast.success(
      `Proceeding to secure Paystack checkout for ₦${total.toLocaleString()}`,
      { duration: 4000 }
    );
  };

  return (
    <section id="preorder" className="w-full bg-white text-slate-900 scroll-mt-6">
      {/* Top Bar Header */}
      <header className="w-full border-b border-slate-200/80 px-6 sm:px-12 py-4">
        
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 lg:gap-14 items-start">
          {/* Left Column: Title, Book Showcase, Edition Selection */}
          <div className="flex flex-col">
            <h1 className="text-3xl sm:text-4xl lg:text-[2.65rem] font-bold text-slate-950 tracking-tight leading-[1.18] mb-3">
              Reserve your copy of RITNA <br className="hidden sm:inline" />
              before launch day
            </h1>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed mb-8 max-w-xl">
              Choose your edition, tell us where to send it, and secure your pre-order in under
              two minutes.
            </p>

            {/* Book Image Presentation */}
            <div className="w-full max-w-xl mx-auto lg:mx-0">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-xs border border-slate-100 bg-slate-900">
                <Image
                  src={BOOK_IMAGES[activeSlide].src}
                  alt={BOOK_IMAGES[activeSlide].alt}
                  fill
                  className="object-cover transition-opacity duration-300"
                  priority
                />
              </div>

              {/* Carousel Dots */}
              <div className="flex items-center justify-center gap-2 mt-4">
                {BOOK_IMAGES.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`View slide ${idx + 1}`}
                    onClick={() => setActiveSlide(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                      activeSlide === idx
                        ? "bg-slate-500 w-3"
                        : "bg-slate-200 hover:bg-slate-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Choose your edition section */}
            <div className="mt-12 max-w-xl mx-auto lg:mx-0 w-full">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 text-center mb-6">
                Choose your edition
              </h2>

              <div className="flex flex-col gap-4">
                {/* Hardcover Card */}
                <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 flex items-center justify-between bg-white hover:border-slate-300 transition-colors shadow-xs">
                  <div className="flex flex-col gap-1 pr-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs sm:text-sm tracking-wide text-slate-900 uppercase">
                        Hardcover
                      </span>
                      <span className="bg-blue-100 text-blue-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                        ₦35,000/COPY
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-snug">
                      Premium print hardcover edition, shipped to your delivery address
                    </p>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-3 bg-slate-100/90 rounded-full px-3 py-1.5 shrink-0 border border-slate-200/60">
                    <button
                      type="button"
                      aria-label="Decrease Hardcover quantity"
                      onClick={() => setHardcoverQty((prev) => Math.max(0, prev - 1))}
                      disabled={hardcoverQty === 0}
                      className="text-slate-600 hover:text-slate-950 disabled:opacity-30 transition-opacity p-0.5"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs sm:text-sm font-semibold text-slate-900 min-w-3 text-center select-none">
                      {hardcoverQty}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase Hardcover quantity"
                      onClick={() => setHardcoverQty((prev) => prev + 1)}
                      className="text-slate-600 hover:text-slate-950 transition-opacity p-0.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Softcover Card */}
                <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 flex items-center justify-between bg-white hover:border-slate-300 transition-colors shadow-xs">
                  <div className="flex flex-col gap-1 pr-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs sm:text-sm tracking-wide text-slate-900 uppercase">
                        Softcover
                      </span>
                      <span className="bg-blue-100 text-blue-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                        ₦25,000/COPY
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-snug">
                      Premium print softcover edition, shipped to your delivery address
                    </p>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-3 bg-slate-100/90 rounded-full px-3 py-1.5 shrink-0 border border-slate-200/60">
                    <button
                      type="button"
                      aria-label="Decrease Softcover quantity"
                      onClick={() => setSoftcoverQty((prev) => Math.max(0, prev - 1))}
                      disabled={softcoverQty === 0}
                      className="text-slate-600 hover:text-slate-950 disabled:opacity-30 transition-opacity p-0.5"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs sm:text-sm font-semibold text-slate-900 min-w-3 text-center select-none">
                      {softcoverQty}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase Softcover quantity"
                      onClick={() => setSoftcoverQty((prev) => prev + 1)}
                      className="text-slate-600 hover:text-slate-950 transition-opacity p-0.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Institutional Copy Card */}
                <div className="border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex items-center justify-between bg-white/70 shadow-xs">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-xs sm:text-sm text-slate-800">
                        Institutional copy
                      </span>
                      <span className="bg-slate-200/80 text-slate-600 text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md uppercase">
                        Coming Soon
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-snug">
                      Bulk licensing for schools, libraries & organizations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary Card & Warning Alert */}
          <div className="w-full lg:sticky lg:top-8 flex flex-col">
            {/* Order summary container */}
            <div className="bg-[#f8fafc] border border-slate-200/60 rounded-2xl p-6 sm:p-7 shadow-xs">
              <h2 className="text-lg font-bold text-slate-950 mb-6">Order summary</h2>

              {/* Items List */}
              <div className="flex flex-col gap-4">
                {/* RITNA Hardcover Item */}
                <div className="flex items-center justify-between gap-4 py-2 border-b border-slate-100">
                  <div className="flex items-center gap-3.5">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/60 shrink-0">
                      <Image
                        src="/assets/preorder-books.png"
                        alt="RITNA Hardcover thumbnail"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-sm font-semibold text-slate-900">
                        RITNA Hardcover
                      </span>
                      <div className="flex items-center gap-2.5 bg-slate-100/90 rounded-full px-2.5 py-0.5 w-fit border border-slate-200/50">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => setHardcoverQty((p) => Math.max(0, p - 1))}
                          disabled={hardcoverQty === 0}
                          className="text-slate-500 hover:text-slate-800 disabled:opacity-30 p-0.5"
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
                          className="text-slate-500 hover:text-slate-800 p-0.5"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-slate-900 shrink-0">
                    ₦{(hardcoverQty * HARDCOVER_PRICE).toLocaleString()}
                  </span>
                </div>

                {/* RITNA Softcover Item */}
                <div className="flex items-center justify-between gap-4 py-2">
                  <div className="flex items-center gap-3.5">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/60 shrink-0">
                      <Image
                        src="/assets/preorder-books.png"
                        alt="RITNA Softcover thumbnail"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-sm font-semibold text-slate-900">
                        RITNA Softcover
                      </span>
                      <div className="flex items-center gap-2.5 bg-slate-100/90 rounded-full px-2.5 py-0.5 w-fit border border-slate-200/50">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => setSoftcoverQty((p) => Math.max(0, p - 1))}
                          disabled={softcoverQty === 0}
                          className="text-slate-500 hover:text-slate-800 disabled:opacity-30 p-0.5"
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
                          className="text-slate-500 hover:text-slate-800 p-0.5"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-slate-900 shrink-0">
                    ₦{(softcoverQty * SOFTCOVER_PRICE).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Price Calculations */}
              <div className="border-t border-slate-200/80 pt-5 mt-4 flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-900">
                    ₦{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Tax</span>
                  <span className="font-medium text-slate-900">
                    ₦{tax.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Delivery fee</span>
                  <span className="font-medium text-slate-900">
                    ₦{delivery.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-base font-bold text-slate-950 pt-3 border-t border-slate-200/80 mt-1">
                  <span>Total</span>
                  <span>₦{total.toLocaleString()}</span>
                </div>
              </div>

              {/* Pay Now Button */}
              <button
                type="button"
                onClick={handlePayNow}
                className="w-full bg-[#0a0f1d] hover:bg-black active:scale-[0.99] text-white font-medium py-3.5 px-4 rounded-xl mt-6 transition-all duration-150 shadow-sm cursor-pointer flex items-center justify-center text-sm"
              >
                Pay now
              </button>

              {/* Paystack Security Notice */}
              <div className="flex items-start gap-1.5 mt-3 text-[11px] text-slate-500 leading-snug">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  Payments are processed securely via Paystack. Your card details are never
                  stored on this site.
                </span>
              </div>
            </div>

            {/* Kindly Note Alert Banner */}
            {showNote && (
              <div className="mt-4 bg-[#fff5f2] border border-[#fed7aa]/60 rounded-xl p-4 relative transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <TriangleAlert className="w-4 h-4 text-[#ea580c] shrink-0" />
                    <span className="text-xs font-bold text-[#ea580c] tracking-wider uppercase">
                      Kindly Note!
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
                <p className="text-xs text-stone-600 mt-2 leading-relaxed font-normal">
                  Kindly note that delivery is not free. ₦35,000 is for the book only. Delivery
                  charges would be collected at checkout
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Preorder;
