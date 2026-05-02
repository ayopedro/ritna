import { Gift, Bell, BookOpen } from "lucide-react";
import { Button } from "@/components/button";
import Waitlist from "@/components/waitlist";

export function WishlistFooter() {
  return (
    <section className="w-full bg-[#eff6ff] py-24 px-6 text-center">
      <div className="max-w-[1000px] mx-auto">
        <div className="mb-12">
          <h3 className="text-blue-600 text-xs font-bold uppercase tracking-[0.3em] mb-4">
            Don't Miss Out
          </h3>
          <h2 className="text-[#1a2b3c] text-4xl md:text-5xl font-serif mb-6">
            Join the Waitlist Today
          </h2>
          <p className="text-slate-500 text-sm md:text-base max-w-[600px] mx-auto leading-relaxed">
            Be among the first to experience this deeply moving story. Sign up
            now and get exclusive early access.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 text-left">
            <div className="bg-blue-50 p-2 rounded-lg">
              <Gift className="text-blue-600 w-5 h-5" />
            </div>
            <p className="text-slate-600 text-xs font-medium leading-snug">
              Signed first edition for early supporters
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 text-left">
            <div className="bg-blue-50 p-2 rounded-lg">
              <Bell className="text-blue-600 w-5 h-5" />
            </div>
            <p className="text-slate-600 text-xs font-medium leading-snug">
              Be notified before the public launch
            </p>
          </div>

        </div>

        <form className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <Button
            type="submit"
            text="Join Now"
            className="bg-[#0a1120] text-white hover:bg-[#1a2b3c] px-8 py-3 w-full sm:w-auto"
          />
          <Waitlist />
        </form>

        <p className="text-slate-400 text-[10px] uppercase tracking-widest">
          No spam, ever. Unsubscribe at any time.
        </p>
      </div>
    </section>
  );
}
