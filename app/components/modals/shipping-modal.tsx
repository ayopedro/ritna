"use client";

import { useForm, Controller } from "react-hook-form";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import PhoneInput, {
  isValidPhoneNumber,
  getCountryCallingCode,
} from "react-phone-number-input";
import en from "react-phone-number-input/locale/en.json";
import "react-phone-number-input/style.css";
import { Modal } from "../modal";

export interface ShippingDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  deliveryNotes?: string;
}

export const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT - Abuja",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
] as const;

const countryLabels: Record<string, string> = {};
for (const [code, name] of Object.entries(en)) {
  try {
    countryLabels[code] = `${name} (+${getCountryCallingCode(code as any)})`;
  } catch {
    countryLabels[code] = name;
  }
}

interface ShippingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (details: ShippingDetails) => Promise<void> | void;
  totalAmount?: number;
}

export function ShippingModal({
  isOpen,
  onClose,
  onConfirm,
  totalAmount,
}: ShippingModalProps) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ShippingDetails>({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "Lagos",
      deliveryNotes: "",
    },
    mode: "onTouched",
  });

  const onSubmit = async (data: ShippingDetails) => {
    try {
      if (onConfirm) {
        await onConfirm(data);
      } else {
        const amountText = totalAmount
          ? ` for ₦${totalAmount.toLocaleString()}`
          : "";
        toast.success(
          `Shipping information confirmed! Proceeding to payment${amountText}`,
        );
      }
      reset();
      onClose();
    } catch {
      toast.error(
        "An error occurred while confirming details. Please try again.",
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Your shipping details">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-3.5 sm:gap-4"
      >
        <div className="flex flex-col">
          <label
            htmlFor="fullName"
            className="text-xs text-gray-500 font-medium mb-1 sm:mb-1.5"
          >
            Full name
          </label>
          <input
            id="fullName"
            type="text"
            placeholder="John Doe"
            aria-invalid={!!errors.fullName}
            {...register("fullName", {
              required: "Please enter your full name",
              minLength: {
                value: 2,
                message: "Full name must be at least 2 characters",
              },
            })}
            className={`w-full px-3.5 py-3 sm:px-4 sm:py-3.5 border rounded-xl text-base sm:text-sm text-slate-900 placeholder:text-gray-400 focus:outline-none transition-colors bg-white ${
              errors.fullName
                ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                : "border-gray-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800"
            }`}
          />
          {errors.fullName && (
            <p className="text-[11px] text-red-500 mt-1 font-medium">
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="email"
            className="text-xs text-gray-500 font-medium mb-1 sm:mb-1.5"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            placeholder="username@example.com"
            aria-invalid={!!errors.email}
            {...register("email", {
              required: "Please enter your email address",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Please enter a valid email address",
              },
            })}
            className={`w-full px-3.5 py-3 sm:px-4 sm:py-3.5 border rounded-xl text-base sm:text-sm text-slate-900 placeholder:text-gray-400 focus:outline-none transition-colors bg-white ${
              errors.email
                ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                : "border-gray-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800"
            }`}
          />
          {errors.email && (
            <p className="text-[11px] text-red-500 mt-1 font-medium">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="phone"
            className="text-xs text-gray-500 font-medium mb-1 sm:mb-1.5"
          >
            Phone number
          </label>
          <Controller
            name="phone"
            control={control}
            rules={{
              validate: (value) => {
                if (!value || !value.trim()) {
                  return "Please enter your phone number";
                }
                if (!isValidPhoneNumber(value)) {
                  if (/^\+\d{1,4}$/.test(value.trim())) {
                    return "Please enter your phone number";
                  }
                  return "Please enter a valid phone number";
                }
                return true;
              },
            }}
            render={({ field: { onChange, value } }) => (
              <PhoneInput
                id="phone"
                international
                defaultCountry="NG"
                labels={countryLabels}
                placeholder="801 234 5678"
                value={value}
                onChange={(val) => onChange(val || "")}
                className={`w-full px-3.5 py-3 sm:px-4 sm:py-3.5 border rounded-xl bg-white transition-colors flex items-center ${
                  errors.phone
                    ? "border-red-400 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500"
                    : "border-gray-200 focus-within:border-slate-800 focus-within:ring-1 focus-within:ring-slate-800"
                }`}
                numberInputProps={{
                  className:
                    "focus:outline-none border-none bg-transparent w-full text-base sm:text-sm text-slate-900 placeholder:text-gray-400 ml-2.5",
                }}
              />
            )}
          />
          {errors.phone && (
            <p className="text-[11px] text-red-500 mt-1 font-medium">
              {errors.phone.message}
            </p>
          )}
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="address"
            className="text-xs text-gray-500 font-medium mb-1 sm:mb-1.5"
          >
            Delivery address
          </label>
          <input
            id="address"
            type="text"
            placeholder="12 Freedom Way"
            aria-invalid={!!errors.address}
            {...register("address", {
              required: "Please enter your delivery address",
              minLength: {
                value: 4,
                message: "Please enter a complete delivery address",
              },
            })}
            className={`w-full px-3.5 py-3 sm:px-4 sm:py-3.5 border rounded-xl text-base sm:text-sm text-slate-900 placeholder:text-gray-400 focus:outline-none transition-colors bg-white ${
              errors.address
                ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                : "border-gray-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800"
            }`}
          />
          {errors.address && (
            <p className="text-[11px] text-red-500 mt-1 font-medium">
              {errors.address.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          <div className="flex flex-col">
            <label
              htmlFor="city"
              className="text-xs text-gray-500 font-medium mb-1 sm:mb-1.5"
            >
              City
            </label>
            <input
              id="city"
              type="text"
              placeholder="Lekki"
              aria-invalid={!!errors.city}
              {...register("city", {
                required: "Please enter your city",
              })}
              className={`w-full px-3.5 py-3 sm:px-4 sm:py-3.5 border rounded-xl text-base sm:text-sm text-slate-900 placeholder:text-gray-400 focus:outline-none transition-colors bg-white ${
                errors.city
                  ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  : "border-gray-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800"
              }`}
            />
            {errors.city && (
              <p className="text-[11px] text-red-500 mt-1 font-medium">
                {errors.city.message}
              </p>
            )}
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="state"
              className="text-xs text-gray-500 font-medium mb-1 sm:mb-1.5"
            >
              State
            </label>
            <select
              id="state"
              aria-invalid={!!errors.state}
              {...register("state", {
                required: "Please select a state",
              })}
              className={`w-full px-3.5 py-3 sm:px-4 sm:py-3.5 border rounded-xl text-base sm:text-sm text-slate-900 focus:outline-none transition-colors bg-white cursor-pointer ${
                errors.state
                  ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  : "border-gray-200 focus:border-slate-800 focus:ring-1 focus:ring-slate-800"
              }`}
            >
              {NIGERIAN_STATES.map((stateName) => (
                <option key={stateName} value={stateName}>
                  {stateName}
                </option>
              ))}
            </select>
            {errors.state && (
              <p className="text-[11px] text-red-500 mt-1 font-medium">
                {errors.state.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="deliveryNotes"
            className="text-xs text-gray-500 font-medium mb-1 sm:mb-1.5"
          >
            Delivery notes (optional)
          </label>
          <textarea
            id="deliveryNotes"
            rows={2}
            {...register("deliveryNotes")}
            className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 border border-gray-200 rounded-xl text-base sm:text-sm text-slate-900 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors bg-white resize-y min-h-[64px] sm:min-h-[80px]"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-black hover:bg-neutral-900 active:scale-[0.98] text-white font-medium py-3.5 sm:py-4 px-6 rounded-full mt-1 sm:mt-2 transition-all duration-150 shadow-sm cursor-pointer flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            "Confirm information"
          )}
        </button>
      </form>
    </Modal>
  );
}

export default ShippingModal;
