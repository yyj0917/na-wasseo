import { Skeleton } from "@/components/ui/skeleton";

export default function MentorLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <div className="bg-card border-b border-border/50 h-16 flex items-center px-6">
        <Skeleton className="h-6 w-32" />
      </div>

      {/* Content skeleton */}
      <main className="max-w-[1400px] mx-auto px-6 py-6">
        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            <Skeleton className="h-[600px] w-full rounded-xl" />
          </div>
          <div className="w-72 shrink-0">
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </main>
    </div>
  );
}
