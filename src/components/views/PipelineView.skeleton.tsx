import { Skeleton } from "@/components/ui/skeleton"

export function PipelineViewSkeleton() {
  return (
    <div className="grid gap-3 md:grid-cols-3" data-cid="pipeline-loading-skeleton" data-testid="pipeline-loading-skeleton" aria-hidden="true">
      {Array.from({ length: 3 }, (_, column) => (
        <div key={column} className="border-border bg-card rounded-2xl border p-3">
          <div className="mb-3 flex items-center justify-between">
            <Skeleton className="h-4 w-28 rounded-full" />
            <Skeleton className="size-6 rounded-full" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 4 }, (_, card) => (
              <div key={card} className="border-border/70 rounded-xl border p-3">
                <Skeleton className="mb-2 h-4 w-3/4 rounded-full" />
                <Skeleton className="mb-3 h-3 w-1/2 rounded-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-xl" />
                  <Skeleton className="h-6 w-20 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
