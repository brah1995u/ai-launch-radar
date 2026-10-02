export function normalizeDomain(value: unknown): string | null {
  if (typeof value !== "string") return null;
  let input = value.trim().toLowerCase().replace(/\.$/, "");
  if (input.startsWith("www.") && input.split(".").length > 2)
    input = input.slice(4);
  if (!input || /[\s/:?#@\\]/.test(input)) return null;
  try {
    const hostname = new URL(`https://${input}`).hostname;
    const labels = hostname.split(".");
    if (
      hostname.length > 253 ||
      labels.length < 2 ||
      !/[a-z]/.test(labels.at(-1)!)
    )
      return null;
    if (
      labels.some(
        (label) => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label),
      )
    )
      return null;
    return hostname;
  } catch {
    return null;
  }
}

export function safeExternalUrl(value: unknown): string | null {
  if (
    typeof value !== "string" ||
    !value.trim() ||
    /[\u0000-\u001f\u007f]/.test(value)
  )
    return null;
  try {
    const url = new URL(value);
    if (
      !["https:", "http:"].includes(url.protocol) ||
      url.username ||
      url.password
    )
      return null;
    return url.href;
  } catch {
    return null;
  }
}

export function safeReturnTo(value: string | undefined): string {
  if (!value || (value !== "/" && !value.startsWith("/?"))) return "/";
  try {
    const url = new URL(value, "https://radar.invalid");
    return url.origin === "https://radar.invalid" && url.pathname === "/"
      ? `${url.pathname}${url.search}`
      : "/";
  } catch {
    return "/";
  }
}
