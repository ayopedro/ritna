import Image from "next/image";
import data from "@/data/data.json";

export function Reviews() {
  return (
    <section className="w-full bg-[#fdfdfc] py-20 px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <h3 className="text-[#4285f4] text-xs font-bold uppercase tracking-[0.3em] mb-4">
            Early Reader Reviews
          </h3>
          <h2 className="text-[#1a2b3c] text-4xl md:text-5xl font-serif">
            What People Are Saying
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {data.reviews.map((review, index) => (
            <div
              key={index}
              className={`relative bg-[#f0f4f8] rounded-2xl p-8 flex flex-col justify-between ${
                index === 4 ? "lg:col-span-1" : ""
              }`}
            >
              <div className="absolute top-4 right-8 text-[#cbd5e1] text-6xl font-serif opacity-50 select-none">
                &ldquo;
              </div>
              
              <div className="mb-8">
                <p className="text-slate-600 leading-relaxed text-[15px]">
                  &ldquo;{review.quote}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={review.avatar}
                    alt={review.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-900 font-bold text-sm">
                    {review.name}
                  </span>
                  <span className="text-slate-500 text-[11px] leading-tight max-w-[300px]">
                    {review.title}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
