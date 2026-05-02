import { toast } from "sonner";
import { waitlistSchema } from "@/lib/validators";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface WaitlistProps {
  onSuccess?: () => void;
}

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  category: "civilian" | "military";
};

const Waitlist = ({ onSuccess }: WaitlistProps) => {
  const initialFormData: FormData = {
    firstName: "",
    lastName: "",
    email: "",
    category: "civilian",
  };
  const {
    register,
    handleSubmit,
    formState: { isSubmitting: isPending, errors },
  } = useForm<FormData>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: initialFormData,
  });

  const submitForm: SubmitHandler<FormData> = async (formData) => {
    toast.promise(
      async () => {
        const response = await fetch("/api/waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to join waitlist");
        }

        onSuccess?.();
        return result;
      },
      {
        loading: "Adding you to the list...",
        success: "You have been added to the waitlist!",
        error: (err) => err.message,
      },
    );
  };

  return (
    <form
      onSubmit={handleSubmit(submitForm)}
      className="form"
      autoComplete="off"
    >
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
      <input
        type="submit"
        value={isPending ? "Please wait..." : "Join Waitlist"}
        className="btn btn-secondary mt-8"
        disabled={isPending}
      />
    </form>
  );
};

export default Waitlist;
