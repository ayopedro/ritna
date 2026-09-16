"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { BOOK_IMAGES } from "./preorder.constants";

export function BookCarousel() {
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % BOOK_IMAGES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <div
      className="w-full max-w-xl mx-auto lg:mx-0"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Book preview gallery"
    >
      <div className="relative aspect-square w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs border border-slate-100 bg-slate-900">
        <div
          className="flex h-full w-full transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${activeSlide * 100}%)` }}
        >
          {BOOK_IMAGES.map((img, idx) => (
            <div key={idx} className="relative min-w-full h-full shrink-0">
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

      <div
        className="flex items-center justify-center gap-2 mt-4 mb-10"
        role="tablist"
        aria-label="Slides"
      >
        {BOOK_IMAGES.map((_, idx) => (
          <button
            key={idx}
            type="button"
            role="tab"
            aria-selected={activeSlide === idx}
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
  );
}

