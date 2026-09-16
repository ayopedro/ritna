"use client";

import React from "react";
import {
  Root,
  Portal,
  Overlay,
  Content,
  Title,
  Description,
  Close,
} from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const MAX_WIDTHS = {
  sm: "max-w-[400px]",
  md: "max-w-[480px]",
  lg: "max-w-[640px]",
  xl: "max-w-[800px]",
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "md",
  className,
}: ModalProps) {
  return (
    <Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <Portal>
        <Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] transition-opacity duration-200 animate-in fade-in" />

        <Content
          className={cn(
            "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-1.75rem)] sm:w-full bg-white rounded-[22px] sm:rounded-[26px] p-5 sm:p-8 shadow-2xl transition-all duration-200 max-h-[90vh] sm:max-h-[92vh] overflow-y-auto focus:outline-none",
            MAX_WIDTHS[maxWidth],
            className,
          )}
        >
          <Close asChild>
            <button
              type="button"
              aria-label="Close modal"
              className="absolute top-4 right-4 sm:top-6 sm:right-6 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#505c6e] hover:bg-[#3d4756] text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs z-10"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            </button>
          </Close>

          <Title className="text-xl sm:text-[25px] font-bold text-slate-900 tracking-tight mt-0.5 mb-4 sm:mb-6 pr-8 sm:pr-10">
            {title}
          </Title>

          <Description
            className={
              description
                ? "text-xs sm:text-sm text-slate-500 mb-6 -mt-4 leading-relaxed"
                : "sr-only"
            }
          >
            {description || title}
          </Description>

          {children}
        </Content>
      </Portal>
    </Root>
  );
}

export default Modal;
