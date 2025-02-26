import { Skeleton } from "@/components/ui/skeleton";
export default function Loading() {
  const renderPostSkeleton = () => (
    <div className="p-4  px-6 animate-pulse flex items-start space-x-4">
      <Skeleton className="h-10 w-10 rounded-full mt-2" />
      <div className="flex-1">
        <div className="flex items-center py-2 space-x-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-4 w-full my-2" />
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-[40vh] w-full rounded-xl" />
        <div className="mt-2 flex items-center space-x-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-4" />
        </div>
      </div>
    </div>
  );

  const renderLoadingState = () => (
    <>
      {[1, 2, 3].map((i) => (
        <div key={`skeleton-${i}`}>{renderPostSkeleton()}</div>
      ))}
    </>
  );
  return renderLoadingState();
}
