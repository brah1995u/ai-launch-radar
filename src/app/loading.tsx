import { ResultsSkeleton } from "@/features/discovery/states";

export default function Loading() {
  return (
    <main className="container loading-main" id="main-content">
      <div className="eyebrow">AI LAUNCH RADAR</div>
      <h1>Loading discovery signals…</h1>
      <ResultsSkeleton />
    </main>
  );
}
