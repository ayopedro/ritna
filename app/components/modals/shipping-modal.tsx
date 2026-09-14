"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

export interface ShippingDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  deliveryNotes?: string;
}

interface ShippingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (details: ShippingDetails) => void;
  totalAmount?: number;
}

export function ShippingModal({
  isOpen,
  onClose,
  onConfirm,
  totalAmount,
}: ShippingModalProps) {
  const [formData, setFormData] = useState<ShippingDetails>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    deliveryNotes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!formData.phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }
    if (!formData.address.trim()) {
      toast.error("Please enter your delivery address");
      return;
    }
    if (!formData.city.trim()) {
      toast.error("Please enter your city");
      return;
    }
    if (!formData.state.trim()) {
      toast.error("Please enter your state");
      return;
    }

    setIsSubmitting(true);

    if (onConfirm) {
      onConfirm(formData);
    } else {
      const amountText = totalAmount
        ? ` for ₦${totalAmount.toLocaleString()}`
        : "";
      toast.success(
        `Shipping information confirmed! Proceeding to payment${amountText}`,
      );
    }

    // Reset shipping details fields
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      deliveryNotes: "",
    });

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shipping-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-[2px] transition-all duration-200 animate-in fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[480px] bg-white rounded-[26px] p-6 sm:p-8 shadow-2xl transition-all duration-200 max-h-[92vh] overflow-y-auto"
      >
        {/* Close Button Top Right */}
        <button
          type="button"
          aria-label="Close modal"
          onClick={onClose}
          className="absolute top-5 right-5 sm:top-6 sm:right-6 w-8 h-8 rounded-full bg-[#505c6e] hover:bg-[#3d4756] text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs z-10"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Modal Heading */}
        <h2
          id="shipping-modal-title"
          className="text-2xl sm:text-[25px] font-bold text-slate-900 tracking-tight mt-1 mb-6 pr-10"
        >
          Your shipping details
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Full Name */}
          <div className="flex flex-col">
            <label
              htmlFor="fullName"
              className="text-xs sm:text-[13px] text-gray-500 font-normal mb-1.5"
            >
              Full name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Ada Lovelace"
              className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm sm:text-base text-slate-900 placeholder:text-gray-400 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors bg-white"
            />
          </div>

          {/* Email Address */}
          <div className="flex flex-col">
            <label
              htmlFor="email"
              className="text-xs sm:text-[13px] text-gray-500 font-normal mb-1.5"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="ada@example.com"
              className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm sm:text-base text-slate-900 placeholder:text-gray-400 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors bg-white"
            />
          </div>

          {/* Phone Number */}
          <div className="flex flex-col">
            <label
              htmlFor="phone"
              className="text-xs sm:text-[13px] text-gray-500 font-normal mb-1.5"
            >
              Phone number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="080 1234 5678"
              className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm sm:text-base text-slate-900 placeholder:text-gray-400 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors bg-white"
            />
          </div>

          {/* Delivery Address */}
          <div className="flex flex-col">
            <label
              htmlFor="address"
              className="text-xs sm:text-[13px] text-gray-500 font-normal mb-1.5"
            >
              Delivery address
            </label>
            <input
              id="address"
              name="address"
              type="text"
              required
              value={formData.address}
              onChange={handleChange}
              placeholder="12 Freedom Way"
              className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm sm:text-base text-slate-900 placeholder:text-gray-400 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors bg-white"
            />
          </div>

          {/* City & State Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="flex flex-col">
              <label
                htmlFor="city"
                className="text-xs sm:text-[13px] text-gray-500 font-normal mb-1.5"
              >
                City
              </label>
              <input
                id="city"
                name="city"
                type="text"
                required
                value={formData.city}
                onChange={handleChange}
                placeholder="Lagos"
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm sm:text-base text-slate-900 placeholder:text-gray-400 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors bg-white"
              />
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="state"
                className="text-xs sm:text-[13px] text-gray-500 font-normal mb-1.5"
              >
                State
              </label>
              <input
                id="state"
                name="state"
                type="text"
                required
                value={formData.state}
                onChange={handleChange}
                placeholder="Lagos"
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm sm:text-base text-slate-900 placeholder:text-gray-400 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors bg-white"
              />
            </div>
          </div>

          {/* Delivery Notes (optional) */}
          <div className="flex flex-col">
            <label
              htmlFor="deliveryNotes"
              className="text-xs sm:text-[13px] text-gray-500 font-normal mb-1.5"
            >
              Delivery notes (optional)
            </label>
            <input
              id="deliveryNotes"
              name="deliveryNotes"
              type="text"
              value={formData.deliveryNotes}
              onChange={handleChange}
              className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm sm:text-base text-slate-900 placeholder:text-gray-400 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors bg-white"
            />
          </div>

          {/* Confirm Information Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-black hover:bg-neutral-900 active:scale-[0.99] text-white font-medium py-4 px-6 rounded-full mt-2 transition-all duration-150 shadow-sm cursor-pointer flex items-center justify-center text-sm sm:text-base disabled:opacity-70 disabled:cursor-not-allowed"
          >
            Confirm information
          </button>
        </form>
      </div>
    </div>
  );
}

export default ShippingModal;
