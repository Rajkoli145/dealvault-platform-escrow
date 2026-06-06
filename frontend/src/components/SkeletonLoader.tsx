export function SkeletonProfile() {
  return (
    <div className="space-y-6">
      {/* Profile header skeleton */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 mb-6">
        <div className="flex items-start gap-8 justify-between">
          {/* Profile image skeleton */}
          <div className="flex items-start gap-6">
            <div className="w-32 h-32 rounded-full bg-gray-200 animate-shimmer" />
            <div className="flex-1 space-y-3">
              <div className="h-8 w-48 bg-gray-200 rounded-lg animate-shimmer" />
              <div className="h-4 w-56 bg-gray-200 rounded-lg animate-shimmer" />
              <div className="h-4 w-64 bg-gray-200 rounded-lg animate-shimmer" />
            </div>
          </div>
          {/* Stats skeleton */}
          <div className="space-y-3">
            <div className="h-4 w-24 bg-gray-200 rounded-lg animate-shimmer" />
            <div className="h-4 w-32 bg-gray-200 rounded-lg animate-shimmer" />
          </div>
        </div>
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="h-3 w-24 bg-gray-200 rounded animate-shimmer mb-3" />
            <div className="h-8 w-12 bg-gray-200 rounded animate-shimmer" />
          </div>
        ))}
      </div>

      {/* Section skeletons */}
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="h-6 w-40 bg-gray-200 rounded-lg animate-shimmer" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-gray-200 rounded animate-shimmer" />
            <div className="h-4 w-5/6 bg-gray-200 rounded animate-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonIssues() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-3">
        <div className="h-10 w-64 bg-gray-200 rounded-lg animate-shimmer" />
        <div className="h-4 w-96 bg-gray-200 rounded animate-shimmer" />
      </div>

      {/* Search and filters skeleton */}
      <div className="flex gap-4">
        <div className="flex-1 h-10 bg-gray-200 rounded-lg animate-shimmer" />
        <div className="h-10 w-32 bg-gray-200 rounded-lg animate-shimmer" />
        <div className="h-10 w-32 bg-gray-200 rounded-lg animate-shimmer" />
      </div>

      {/* Issues list skeleton */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 shadow-sm">
          <div className="h-5 w-3/4 bg-gray-200 rounded animate-shimmer" />
          <div className="h-4 w-full bg-gray-200 rounded animate-shimmer" />
          <div className="h-4 w-5/6 bg-gray-200 rounded animate-shimmer" />
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-gray-200 rounded-full animate-shimmer" />
            <div className="h-6 w-20 bg-gray-200 rounded-full animate-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}
