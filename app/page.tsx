import { Hero } from "@/app/components/hero";
import { AboutAuthor } from "@/components/about-author";
import { AboutBook } from "@/components/about-book";
import { Reviews } from "@/components/reviews";
import { Waitlist } from "@/app/components/waitlist";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="w-full bg-[#9fcbda] flex justify-center">
        <Hero />
      </div>
      <div className="w-full bg-[#fdfdfc] flex justify-center">
        <AboutAuthor />
      </div>
      <AboutBook />
      <Reviews />
      <Waitlist />
      <Footer />
    </main>
  );
}
