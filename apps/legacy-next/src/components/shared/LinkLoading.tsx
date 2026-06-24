"use client";

import { Loader } from "lucide-react";
import { useLinkStatus } from "next/link";

interface LinkLoadingProps {
    children?: React.ReactNode;
}

export function LinkLoading({children}: LinkLoadingProps) {
  const { pending } = useLinkStatus();
  if (pending) {
    return <Loader className="animate-spin size-8 text-base-content/70" />;
  }
  return <>{children}</>;
}
