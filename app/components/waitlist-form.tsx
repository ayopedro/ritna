"use client";

import { waitlistSchema } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm, Controller } from "react-hook-form";
import { Button } from "./button";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import toast from "react-hot-toast";
import { useJoinWaitlistMutation } from "../services/mutations/waitlist";

export type JoinWaitlistFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  category: "civilian" | "military";
};

const WaitlistForm = () => {
  const initialFormData: JoinWaitlistFormData = {
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    category: "civilian",
  };
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
    reset,
  } = useForm<JoinWaitlistFormData>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: initialFormData,
  });

  const { mutate, isPending } = useJoinWaitlistMutation();

  const submitForm: SubmitHandler<JoinWaitlistFormData> = async (formData) => {
    mutate(formData, {
      onSuccess() {
        toast.success("Successfully added to the waitlist");
        reset();
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmit(submitForm)}
      className="form w-full p-4"
      autoComplete="off"
    >
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="form-group">
          <label htmlFor="firstName">
            First Name<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("firstName")}
            placeholder="John"
            required
            className="form-input"
          />
          {errors.firstName && (
            <p className="form-error">{errors.firstName.message}</p>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="lastName">
            Last Name<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("lastName")}
            placeholder="Doe"
            className="form-input"
          />
          {errors.lastName && (
            <p className="form-error">{errors.lastName.message}</p>
          )}
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="form-group">
          <label htmlFor="email">
            Email<span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            {...register("email")}
            placeholder="email@example.com"
            required
            className="form-input"
          />
          {errors.email && <p className="form-error">{errors.email.message}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="phone">
            WhatsApp Number<span className="text-red-500">*</span>
          </label>
          <Controller
            name="phone"
            control={control}
            render={({ field: { onChange, value } }) => (
              <PhoneInput
                id="phone"
                placeholder="802 123 4567"
                value={value as string}
                onChange={onChange}
                defaultCountry="NG"
                className="form-input focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500"
                numberInputProps={{
                  className:
                    "focus:outline-none border-none bg-transparent w-full ml-2",
                }}
              />
            )}
          />
          {errors.phone && <p className="form-error">{errors.phone.message}</p>}
        </div>
      </div>
      <div className="form-group">
        <label className="block mb-2">
          Category<span className="text-red-500">*</span>
        </label>
        {errors.category && (
          <p className="form-error">{errors.category.message}</p>
        )}
        <div className="flex flex-row items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="radio"
              {...register("category")}
              value="civilian"
              required
              className="h-4 w-4 accent-blue-500"
            />
            <label htmlFor="category-civilian" className="cursor-pointer">
              Civilian
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="category-military"
              {...register("category")}
              value="military"
              required
              className="h-4 w-4 accent-blue-500"
            />
            <label htmlFor="category-military" className="cursor-pointer">
              Military
            </label>
          </div>
        </div>
      </div>
      <Button
        type="submit"
        text={isPending ? "Please wait..." : "Join Now"}
        className="bg-[#0a1120] text-white hover:bg-[#1a2b3c] px-8 py-3 w-full sm:w-auto mt-4"
        disabled={isPending || !isValid}
      />
    </form>
  );
};

export default WaitlistForm;
