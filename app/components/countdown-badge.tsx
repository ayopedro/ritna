"use client";

import type { TimeLeft } from "@/lib/types";

import { BOOK_LAUNCH_DATE, COUNTDOWN_INTERVAL_MS } from "@/lib/constants";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

function getTimeRemaining(): TimeLeft {
  const total = new Date(BOOK_LAUNCH_DATE).getTime() - Date.now();
  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }
  return {
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / 1000 / 60) % 60),
    seconds: Math.floor((total / 1000) % 60),
    isExpired: false,
  };
}

export function CountdownBadge() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTimeLeft(getTimeRemaining());
    const interval = setInterval(() => {
      setTimeLeft(getTimeRemaining());
    }, COUNTDOWN_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full text-sm font-medium text-[#187296] shadow-sm mb-8">
      <Clock className="w-4 h-4 shrink-0 text-[#187296]" />
      {timeLeft ? (
        timeLeft.isExpired ? (
          <span>Out Now</span>
        ) : (
          <span className="tabular-nums">
            Launching in {timeLeft.days}d{" "}
            {String(timeLeft.hours).padStart(2, "0")}h{" "}
            {String(timeLeft.minutes).padStart(2, "0")}m{" "}
            {String(timeLeft.seconds).padStart(2, "0")}s
          </span>
        )
      ) : (
        <span>Launching in...</span>
      )}
    </div>
  );
}

