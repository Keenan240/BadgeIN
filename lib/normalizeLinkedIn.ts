export function normalizeLinkedIn(raw: string): string {
  let url = (raw ?? "").trim();
  if (!url) return "";

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }
  url = url.replace(/^http:\/\//, "https://");
  url = url.replace(/^https:\/\/linkedin\.com/, "https://www.linkedin.com");
  url = url.replace(/\/+$/, "");

  return url;
}

export function isLikelyLinkedIn(url: string): boolean {
  if (!url) return false;
  return /linkedin\.com\/in\//i.test(url);
}
