export function redactProviderDetail(
  value: unknown,
  sensitiveValues: string[] = [],
): string | undefined {
  if (typeof value !== 'string') return undefined;
  let detail = value;
  for (const sensitive of sensitiveValues
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)) {
    detail = detail.split(sensitive).join('[redacted]');
  }
  return detail
    .replace(/\b(?:sk|pk|whsec)_[A-Za-z0-9_-]+\b/g, '[redacted]')
    .replace(/Bearer\s+[^\s,;]+/gi, 'Bearer [redacted]')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email]')
    .replace(/https?:\/\/[^\s"'<>]+/gi, '[url]')
    .replace(/\b\+?\d[\d ()-]{7,}\d\b/g, '[number]')
    .replace(/[\r\n\t]/g, ' ')
    .slice(0, 500);
}
