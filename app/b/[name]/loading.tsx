import Nav from '@/components/Nav';

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col bg-bg text-t1">
      <Nav />

      <header className="px-5 sm:px-7 py-5 border-b border-[var(--border)]">
        <div className="mx-auto max-w-5xl flex items-start justify-between gap-3">
          <div className="space-y-3">
            <div className="h-6 w-32 rounded-[6px] skeleton" />
            <div className="h-4 w-16 rounded-[5px] skeleton" />
            <div className="h-3 w-56 rounded-[4px] skeleton" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-24 rounded-full skeleton" />
            <div className="h-9 w-20 rounded-full skeleton" />
            <div className="h-9 w-20 rounded-full skeleton" />
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-5 sm:px-7 py-9">
        <div className="h-3 w-48 rounded-[4px] skeleton mb-[10px]" />
        <div className="bg-s1 border border-[var(--border)] rounded-[14px] shadow-card p-5 mb-8">
          <div className="min-h-[200px] space-y-3.5">
            <div className="h-3.5 w-[68%] rounded-[4px] skeleton" />
            <div className="h-3.5 w-[42%] rounded-[4px] skeleton" />
            <div className="h-3.5 w-[57%] rounded-[4px] skeleton" />
            <div className="h-3.5 w-[30%] rounded-[4px] skeleton" />
          </div>
        </div>

        <div className="h-3 w-56 rounded-[4px] skeleton mb-[10px]" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-[10px]">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-s1 border border-[var(--border)] rounded-[14px] shadow-card p-5 min-h-[148px] flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-lg skeleton mt-2" />
              <div className="h-3 w-24 rounded-[4px] skeleton mt-1" />
              <div className="h-2.5 w-32 rounded-[4px] skeleton" />
              <div className="h-7 w-full rounded-[8px] skeleton mt-auto" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
