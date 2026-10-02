"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import { normalizeDomain } from "@/lib/freeserp/urls";
import type { Site } from "@/lib/freeserp/types";

type Selection = Pick<Site, "domain" | "title">;
interface CompareContextValue {
  selected: Selection[];
  notice: string;
  toggle: (site: Selection) => void;
  clear: () => void;
}
const CompareContext = createContext<CompareContextValue | null>(null);
const STORAGE_KEY = "ai-launch-radar:compare";

export function CompareProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<Selection[]>([]);
  const [notice, setNotice] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Storage is an external system; defer restoration to avoid blocking hydration.
    const id = window.setTimeout(() => {
      try {
        const saved: unknown = JSON.parse(
          sessionStorage.getItem(STORAGE_KEY) ?? "[]",
        );
        if (Array.isArray(saved)) {
          const seen = new Set<string>();
          const restored: Selection[] = [];
          for (const value of saved) {
            const domain = normalizeDomain(value?.domain);
            if (domain && !seen.has(domain)) {
              seen.add(domain);
              restored.push({
                domain,
                title: typeof value.title === "string" ? value.title : domain,
              });
            }
          }
          setSelected(restored.slice(0, 3));
        }
      } catch {
        // Selection still works in memory when browser storage is unavailable.
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
    } catch {
      /* Browser privacy settings can disable storage; selection remains usable. */
    }
  }, [selected, hydrated]);

  const toggle = useCallback(
    (site: Selection) => {
      if (selected.some((item) => item.domain === site.domain)) {
        setSelected(selected.filter((item) => item.domain !== site.domain));
        setNotice("");
      } else if (selected.length === 3) {
        setNotice(
          "You can compare up to 3 products. Remove one to add another.",
        );
      } else {
        setSelected([...selected, site]);
        setNotice("");
      }
    },
    [selected],
  );

  const clear = useCallback(() => {
    setSelected([]);
    setNotice("");
  }, []);

  return (
    <CompareContext value={{ selected, notice, toggle, clear }}>
      {children}
    </CompareContext>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) throw new Error("CompareProvider is required.");
  return context;
}
