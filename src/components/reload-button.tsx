"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { RefreshCw } from "lucide-react";

export function ReloadButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      className="button button-primary"
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => router.refresh())}
    >
      <RefreshCw
        size={15}
        aria-hidden="true"
        className={pending ? "spin" : ""}
      />
      {pending ? "Trying again…" : "Try again"}
    </button>
  );
}
