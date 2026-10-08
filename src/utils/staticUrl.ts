/** Normalize legacy API-prefixed static URLs to sibling kuang_static_resources paths. */
export function staticUrl(url?: string | null): string {
  if (!url) return ''
  return url.replace(/^\/api\/content_ecology(?=\/kuang_static_resources\/)/, '')
}
