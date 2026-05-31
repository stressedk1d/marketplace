/** Публичные пути с пробелами/кириллицей — безопасный src для next/image. */
export function publicImageSrc(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return normalized
    .split("/")
    .map((segment, index) => (index === 0 && segment === "" ? "" : encodeURIComponent(segment)))
    .join("/");
}
