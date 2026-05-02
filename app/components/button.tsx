import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
}

export function Button({ text = "Join Waitlist", className, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        "transition-all flex items-center justify-center gap-2 whitespace-nowrap rounded-xl px-6 py-3.5 font-medium shadow-md cursor-pointer disabled:cursor-not-allowed",
        className
      )}
    >
      {text} <ArrowRight className="w-4 h-4" />
    </button>
  );
}
