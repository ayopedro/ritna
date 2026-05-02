"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import data from "../../lib/data/data.json";

export function AboutBook() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleChapter = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full bg-[#0a1120] py-20 px-6">
      <div className="max-w-200 mx-auto">
        <div className="text-center mb-16">
          <h3 className="text-[#4fc3f7] text-xs font-bold uppercase tracking-[0.3em] mb-4">
            A Glimpse Inside
          </h3>
          <h2 className="text-white text-4xl md:text-5xl font-serif">
            The Story Within
          </h2>
        </div>

        <div className="flex flex-col gap-6">
          {data.chapters.map((chapter, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="border border-slate-700/50 rounded-xl overflow-hidden shadow-2xl shadow-black/20"
              >
                <button
                  onClick={() => toggleChapter(index)}
                  className="w-full bg-[#374151] px-6 py-4 flex items-center justify-between hover:bg-[#3f4b5c] transition-colors"
                >
                  <h4 className="text-white font-medium text-sm md:text-base">
                    {chapter.title}
                  </h4>
                  <ChevronDown
                    className={`text-slate-400 w-5 h-5 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`bg-[#e3ecf8] transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? "max-h-250 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="p-8">
                    <ul className="flex flex-col gap-3">
                      {chapter.items.map((item, itemIndex) => (
                        <li
                          key={itemIndex}
                          className="flex items-start gap-3 text-slate-700 italic font-serif text-sm md:text-base"
                        >
                          <span className="text-slate-900 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
