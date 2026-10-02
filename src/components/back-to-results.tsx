"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { safeReturnTo } from "@/lib/freeserp/urls";

export function BackToResults() {
  const params = useSearchParams();
  return (
    <Link
      href={safeReturnTo(params.get("returnTo") ?? undefined)}
      className="back-link"
    >
      <ArrowLeft size={15} aria-hidden="true" />
      Back to results
    </Link>
  );
}
