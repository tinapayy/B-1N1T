import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface CardSkeletonProps {
  hasHeader?: boolean;
  headerTitle?: string;
  height?: string;
  className?: string;
}

export function CardSkeleton({
  hasHeader = false,
  headerTitle = "",
  height = "h-[200px]",
  className = "",
}: CardSkeletonProps) {
  return (
    <Card className={`${className} overflow-hidden`}>
      {hasHeader && (
        <CardHeader className="pb-2">
          {headerTitle ? (
            <CardTitle>{headerTitle}</CardTitle>
          ) : (
            <Skeleton className="h-6 w-1/3" />
          )}
        </CardHeader>
      )}
      <CardContent className={`flex flex-col gap-3 ${hasHeader ? "" : "pt-6"}`}>
        <div className={`${height} flex flex-col gap-3`}>
          <Skeleton className="h-full w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
