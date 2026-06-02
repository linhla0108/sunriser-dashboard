import { Skeleton } from "@/components/ui/skeleton"

export function GalleryViewSkeleton() {
  return (
    <div
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
      data-cid="gallery-loading-skeleton"
      data-testid="gallery-loading-skeleton"
      aria-hidden="true"
    >
      {Array.from({ length: 9 }, (_, index) => (
        <div key={index} className="border-border bg-card rounded-2xl border p-4">
          <div className="mb-4 flex items-start gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3 rounded-full" />
              <Skeleton className="h-3 w-1/2 rounded-full" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-full rounded-full" />
            <Skeleton className="h-3 w-5/6 rounded-full" />
            <Skeleton className="h-8 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  )
}
