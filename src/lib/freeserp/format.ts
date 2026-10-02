import { sources } from "./options";
import { normalizeDate } from "./dates";

export function formatDR(value: number | null): string {
  return value === null ? "Not scored" : String(value);
}

export function formatDate(value: string | null): string {
  const date = normalizeDate(value);
  return date
    ? new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(`${date}T00:00:00Z`))
    : "Not available";
}

export function formatSource(value: string | null): string {
  if (!value) return "Not detected";
  return (
    sources.find((source) => source.value === value)?.label ??
    ({ ai_likely: "AI builder signal", not_ai: "No AI builder signal" }[
      value
    ] ||
      value)
  );
}
