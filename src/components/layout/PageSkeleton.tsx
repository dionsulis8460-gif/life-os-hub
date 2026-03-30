import { Skeleton } from "@/components/ui/skeleton";

/**
 * Generic page-level loading skeleton shown while the first Supabase fetch
 * is in progress. Rendered by each module page via the `isLoading` flag from
 * the relevant React Query hook.
 */
export function PageSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-4 w-72 rounded-lg" />
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-3xl" />
        ))}
      </div>

      {/* Row cards */}
      <div className="space-y-3">
        {[...Array(rows)].map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
