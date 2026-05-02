import Image from "next/image";
import { Award, PenTool, Globe } from "lucide-react";

export function AboutAuthor() {
  return (
    <section className="w-full max-w-[1200px] mx-auto px-6 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
     
      <div className="w-full flex justify-center lg:justify-start">
        <div className="bg-[#fcf7e8] rounded-3xl p-6 md:p-8 w-full max-w-[500px]">
          <Image
            src="/Lt-kupid-pic.png"
            alt="Olufemi Akinwunmi"
            width={500}
            height={600}
            className="w-full h-auto rounded-2xl object-cover shadow-sm"
          />
        </div>
      </div>

      <div className="flex flex-col pt-4">
        <h3 className="text-xs md:text-sm font-bold text-[#e17d23] tracking-[0.2em] uppercase mb-4">
          About the Author
        </h3>
        
        <h2 className="text-4xl md:text-5xl font-serif text-[#1e2a3b] mb-6 tracking-tight">
          OLUFEMI AKINWUNMI
        </h2>

        <div className="text-[#5e6a75] text-[15px] leading-[1.8] flex flex-col gap-5 mb-12">
          <p>
            &quot;Olufemi Akinwunmi is a serving officer of the Nigerian Navy and a creative whose works sit at the intersection of shared experience and reflective storytelling.
          </p>
          <p>
            A native of Oyo State, he was raised in Mushin, Lagos, he was very well formed at the Nigerian Navy Secondary School, Abeokuta and then proceeded to the prestigious Nigerian Defence Academy (NDA), following a brief academic stint at Obafemi Awolowo University.
          </p>
          <p>
            His writing is informed by the accounts of notable alumni of the NDA and the experiences of cadets who have trained since it was moved to its permanent location in 2007, capturing the defining moments that shape the making of an officer of the Nigerian Armed Forces. He presents military training from a participant&apos;s perspective, with attention to accuracy, detail, and context. His debut work, Rumbles in the New Academy, was developed through extensive research and a collaborative effort with the Rumbles in the New Academy Team, including Ugochukwu Ernest Nwama, Ahmad Nazifi Muktar, and Ayomide Adedokun.
          </p>
          <p>
            Blending fact with fiction, the book preserves the culture, evolution, and enduring spirit of the NDA, offering both military and civilian readers a rare and unfiltered insight into the premier military training institution in West Africa.&quot;
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-2xl p-6 flex flex-col gap-4 transition-transform hover:-translate-y-1">
            <Award className="w-6 h-6 text-[#e17d23]" strokeWidth={2.5} />
            <span className="text-sm font-bold text-[#1e2a3b] leading-snug">
              Booker Prize<br />Longlisted
            </span>
          </div>

          <div className="bg-white border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-2xl p-6 flex flex-col gap-4 transition-transform hover:-translate-y-1">
            <PenTool className="w-6 h-6 text-[#e17d23]" strokeWidth={2.5} />
            <span className="text-sm font-bold text-[#1e2a3b] leading-snug">
              Debut Novel
            </span>
          </div>

          <div className="bg-white border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-2xl p-6 flex flex-col gap-4 transition-transform hover:-translate-y-1">
            <Globe className="w-6 h-6 text-[#e17d23]" strokeWidth={2.5} />
            <span className="text-sm font-bold text-[#1e2a3b] leading-snug">
              Available on<br />Amazon & local<br />bookstores
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
