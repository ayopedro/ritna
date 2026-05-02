import { WaitlistHeader } from "@/app/components/waitlist-header";
import { AboutAuthor } from "@/components/about-author";
import { AboutBook } from "@/components/about-book";
import { Reviews } from "@/components/reviews";
import { WaitlistFooter } from "@/app/components/waitlist-footer";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="w-full bg-[#9fcbda] flex justify-center">
        <WaitlistHeader />
      </div>
      <div className="w-full bg-[#fdfdfc] flex justify-center">
        <AboutAuthor />
      </div>
      <AboutBook />
      <Reviews />
      <WaitlistFooter />
      <Footer />
    </main>
  );
}
