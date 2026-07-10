export function getSafeRedirectPath(value: string | null | undefined) {
  if (!value) {
    return "/";
  }

  const trimmed = value.trim();

  if (!trimmed || !trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return "/";
  }

  try {
    const parsed = new URL(trimmed, "http://localhost");

    if (parsed.origin !== "http://localhost") {
      return "/";
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return "/";
  }
}

export function getLoginRedirectHref(path: string) {
  return `/login?redirect=${encodeURIComponent(getSafeRedirectPath(path))}`;
}
