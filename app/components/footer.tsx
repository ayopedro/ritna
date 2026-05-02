import { BookOpen } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-[#0a1120] py-12 px-6">
      <div className="max-w-300 mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-2 text-white">
          <BookOpen className="text-[#4fc3f7] w-5 h-5" />
          <span className="font-serif text-lg tracking-tight">
            Rumbles in the New Academy
          </span>
        </div>

        <div className="flex items-center gap-8">
          <Link
            href="#"
            className="text-slate-400 hover:text-white transition-colors text-sm"
          >
            Privacy
          </Link>
          <Link
            href="#"
            className="text-slate-400 hover:text-white transition-colors text-sm"
          >
            Terms
          </Link>
          <Link
            href="#"
            className="text-slate-400 hover:text-white transition-colors text-sm"
          >
            Contact
          </Link>
        </div>

        <div className="text-slate-500 text-sm">
          © {new Date().getFullYear()} Olufemi Akinwunmi. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
