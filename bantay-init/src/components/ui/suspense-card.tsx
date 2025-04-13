"use client";

import { Suspense, type ReactNode } from "react";
import { CardSkeleton } from "./card-skeleton";

interface SuspenseCardProps {
  children: ReactNode;
  hasHeader?: boolean;
  headerTitle?: string;
  height?: string;
  className?: string;
}

export function SuspenseCard({
  children,
  hasHeader = false,
  headerTitle = "",
  height = "h-[200px]",
  className = "",
}: SuspenseCardProps) {
  return (
    <Suspense
      fallback={
        <CardSkeleton
          hasHeader={hasHeader}
          headerTitle={headerTitle}
          height={height}
          className={className}
        />
      }
    >
      {children}
    </Suspense>
  );
}
