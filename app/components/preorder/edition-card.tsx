"use client";

import { Minus, Plus } from "lucide-react";
import { EditionConfig } from "./types";
import { formatPrice } from "./preorder.constants";

interface EditionCardProps {
  edition: EditionConfig;
  quantity: number;
  onUpdateQuantity: (quantity: number) => void;
}

export function EditionCard({
  edition,
  quantity,
  onUpdateQuantity,
}: EditionCardProps) {
  return (
    <div className="border border-slate-200 rounded-2xl p-5 flex items-center justify-between gap-4 bg-white hover:border-slate-300 transition-colors shadow-xs">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-950 text-sm tracking-wide">
            {edition.badgeText}
          </span>
          <span className="text-[11px] font-semibold text-blue-600 bg-blue-100/80 px-2 py-0.5 rounded-md">
            {formatPrice(edition.price)}/COPY
          </span>
        </div>
        <p className="text-xs text-slate-500 leading-snug">
          {edition.description}
        </p>
      </div>

      <div className="flex items-center gap-3 bg-[#f8fafc] rounded-full px-3 py-1.5 border border-slate-200/70 shrink-0">
        <button
          type="button"
          aria-label={`Decrease ${edition.name} quantity`}
          onClick={() => onUpdateQuantity(Math.max(0, quantity - 1))}
          disabled={quantity === 0}
          className="text-slate-600 hover:text-slate-950 disabled:opacity-30 transition-opacity p-0.5 cursor-pointer disabled:cursor-not-allowed"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="text-sm font-semibold text-slate-900 min-w-4 text-center">
          {quantity}
        </span>
        <button
          type="button"
          aria-label={`Increase ${edition.name} quantity`}
          onClick={() => onUpdateQuantity(quantity + 1)}
          className="text-slate-600 hover:text-slate-950 transition-colors p-0.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export function InstitutionalCard() {
  return (
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
  );
}

