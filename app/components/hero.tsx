"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Clock } from "lucide-react";
import { Button } from "./button";
import { useGetWaitlistCount } from "../services/queries/waitlist";

const TARGET_DATE = new Date("2026-11-07T00:00:00");

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

function getTimeRemaining(): TimeLeft {
  const total = TARGET_DATE.getTime() - Date.now();
  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  return { days, hours, minutes, seconds, isExpired: false };
}

export function Hero() {
  const { data } = useGetWaitlistCount();
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTimeLeft(getTimeRemaining());
    const interval = setInterval(() => {
      setTimeLeft(getTimeRemaining());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full max-w-350 mx-auto px-6 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-12 lg:gap-16 items-center">
      <div className="flex flex-col items-start lg:pr-12">
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

        <h1 className="text-5xl md:text-6xl lg:text-[4.5rem] font-serif text-gray-900 leading-[1.1] mb-6 tracking-tight">
          Rumbles in the <br />
          <span className="text-[#20667e]">New Academy</span>
        </h1>

        <p className="text-[#1c2c36] text-lg max-w-md leading-relaxed font-medium">
          History. Humour. Discipline. Camaraderie. Indelible Memories.
        </p>
        <p className="text-[#1c2c36] text-lg max-w-md mb-10 leading-relaxed font-medium">
          Join the waitlist to be the first to read it.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full mb-8">
          <Button
            type="button"
            text="Preorder Now"
            className="bg-[#157a97] hover:bg-[#12647c] text-white"
            onClick={() => {
              document.getElementById("preorder")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
          />
        </div>

        {data?.totalSubscribers > 3 ? (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-3">
              <Image
                src="https://i.pravatar.cc/100?img=44"
                alt="Reader"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full border-2 border-[#9fcbda] object-cover"
              />
              <Image
                src="https://i.pravatar.cc/100?img=47"
                alt="Reader"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full border-2 border-[#9fcbda] object-cover"
              />
              <Image
                src="https://i.pravatar.cc/100?img=48"
                alt="Reader"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full border-2 border-[#9fcbda] object-cover"
              />
            </div>
            <span className="text-sm font-medium text-[#2d404d]">
              {data?.totalSubscribers} readers on the waitlist
            </span>
          </div>
        ) : null}
      </div>

      <div className="relative flex justify-center lg:justify-end mt-8 lg:mt-0">
        <Image
          src="/assets/book-blue.png"
          alt="Rumbles in the New Academy Book"
          width={1000}
          height={1000}
          className="w-full max-w-225 h-auto object-contain drop-shadow-[0_25px_25px_rgba(0,0,0,0.15)]"
          priority
        />
      </div>
    </section>
  );
}
