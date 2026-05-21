import { Skeleton } from "@/components/ui/skeleton"

function CandidateFiltersSkeleton() {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-3" aria-hidden="true">
      <Skeleton className="h-9 min-w-[180px] flex-1 rounded-2xl sm:max-w-xs" />
      <Skeleton className="hidden h-9 w-[180px] rounded-2xl sm:block" />
      <Skeleton className="hidden h-9 w-[132px] rounded-2xl sm:block" />
      <Skeleton className="hidden h-9 w-[132px] rounded-2xl sm:block" />
      <Skeleton className="ml-auto h-4 w-16 rounded-full" />
    </div>
  )
}

function CandidateTableSkeleton() {
  return (
    <div className="border-border bg-card overflow-hidden rounded-2xl border" aria-hidden="true">
      <div className="border-border bg-muted/35 grid grid-cols-[48px_1.5fr_1fr_1fr_96px] gap-3 border-b px-4 py-3">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-3 rounded-full" />
        ))}
      </div>
      <div className="divide-border divide-y">
        {Array.from({ length: 10 }, (_, row) => (
          <div key={row} className="grid grid-cols-[48px_1.5fr_1fr_1fr_96px] items-center gap-3 px-4 py-3">
            <Skeleton className="size-5 rounded-full" />
            <div className="min-w-0 space-y-2">
              <Skeleton className="h-4 w-2/3 rounded-full" />
              <Skeleton className="h-3 w-1/2 rounded-full" />
            </div>
            <Skeleton className="h-4 rounded-full" />
            <Skeleton className="h-7 rounded-xl" />
            <Skeleton className="h-7 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function CandidatesPageSkeleton() {
  return (
    <div className="p-3 sm:p-4 lg:p-6" data-cid="candidates-loading-skeleton" data-testid="candidates-loading-skeleton">
      <CandidateFiltersSkeleton />
      <CandidateTableSkeleton />
    </div>
  )
}
