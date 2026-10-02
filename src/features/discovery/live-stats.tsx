"use client";

import { useEffect, useState } from "react";
import { Activity, Database, Sparkles } from "lucide-react";
import type { LiveStats } from "@/lib/freeserp/types";

export function LiveStatsStrip() {
  const [stats, setStats] = useState<LiveStats | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/stats", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) return;
        const result = await response.json();
        if (result.ok) setStats(result.data);
      })
      .catch(() => {
        /* Optional statistics never block discovery. */
      });
    return () => controller.abort();
  }, []);
  // Reserve height while the independent request runs, preventing a results layout shift.
  return (
    <div className="stats-reservation">
      {stats && (
        <div className="stats-strip">
          <span>
            <Database size={15} aria-hidden="true" />
            <strong>{stats.total.toLocaleString("en")}</strong>AI sites
            indexed
          </span>
          <span>
            <Sparkles size={15} aria-hidden="true" />
            <strong>{stats.today.toLocaleString("en")}</strong>New today
          </span>
          <span className="stats-updated">
            <Activity size={15} aria-hidden="true" />
            Snapshot updated
            <time dateTime={stats.generatedAt}>
              {new Intl.DateTimeFormat("en", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "UTC",
              }).format(new Date(stats.generatedAt))}{" "}
              UTC
            </time>
          </span>
        </div>
      )}
    </div>
  );
}
