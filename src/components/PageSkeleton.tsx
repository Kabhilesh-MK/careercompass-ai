/** Full-page skeleton shown while lazy-loaded page chunks are loading. */
export default function PageSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center animate-pulse">
          <div className="w-6 h-6 rounded-lg bg-primary/50" />
        </div>
        <div className="space-y-2 text-center">
          <div className="h-3 w-32 skeleton rounded-full mx-auto" />
          <div className="h-2.5 w-24 skeleton rounded-full mx-auto" />
        </div>
      </div>
    </div>
  );
}
