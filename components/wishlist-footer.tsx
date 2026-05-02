import { Gift, Bell, BookOpen, ArrowRight } from "lucide-react";

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
            Be among the first to experience this deeply moving story. Sign up now
            and get exclusive early access.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
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

          <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 text-left">
            <div className="bg-blue-50 p-2 rounded-lg">
              <BookOpen className="text-blue-600 w-5 h-5" />
            </div>
            <p className="text-slate-600 text-xs font-medium leading-snug">
              Exclusive access to the first 3 chapters
            </p>
          </div>
        </div>

        <form className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <input
            type="email"
            placeholder="Enter your email"
            className="bg-white border border-slate-200 rounded-xl px-4 py-3 w-full sm:max-w-[300px] outline-none text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
            required
          />
          <button
            type="submit"
            className="bg-[#0a1120] text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-[#1a2b3c] transition-colors w-full sm:w-auto justify-center"
          >
            Join Now <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-slate-400 text-[10px] uppercase tracking-widest">
          No spam, ever. Unsubscribe at any time.
        </p>
      </div>
    </section>
  );
}
