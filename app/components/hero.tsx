"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { CountdownBadge } from "./countdown-badge";
import { Button } from "./button";

export function Hero() {
  const router = useRouter();

  return (
    <section className="w-full max-w-350 mx-auto px-6 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-12 lg:gap-16 items-center">
      <div className="flex flex-col items-start lg:pr-12">
        <CountdownBadge />

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
            onClick={() => router.push("/preorder")}
          />
        </div>
      </div>

      <div className="relative flex justify-center lg:justify-end mt-8 lg:mt-0">
        <Image
          src="/assets/book-blue.png"
          alt="Rumbles in the New Academy Book"
          width={1000}
          height={1000}
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="w-full max-w-225 h-auto object-contain drop-shadow-[0_25px_25px_rgba(0,0,0,0.15)]"
          priority
        />
      </div>
    </section>
  );
}
