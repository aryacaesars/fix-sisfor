import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="p-6">
      <Skeleton className="h-8 w-64 mb-6" />
      <Skeleton className="h-10 w-full max-w-xs mb-6" />
      <div className="flex space-x-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="w-72 flex-shrink-0">
            <Skeleton className="h-10 w-full mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 3 + i }).map((_, j) => (
                <Skeleton key={j} className="h-32 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

