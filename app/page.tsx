export default function Home() {
  return (
    <main className="hero">
      <div className="flex flex-col items-center justify-center gap-8">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-8xl font-bold">Rumbles In The New Academy</h1>
          <p className="tracking-[20px] font-semibold">RITNA</p>
        </div>
        <p className="text-xl">A story of chaos and travails from the mad house</p>
        <button className="btn btn-secondary">Join Waitlist</button>
      </div>
    </main>
  );
}
