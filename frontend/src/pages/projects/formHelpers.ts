type RawLink = string | { label?: string; url: string }
type NormalizedLink = { label: string; url: string }

export function normalizeAdditionalLinks(
  links: RawLink[] | undefined | null
): NormalizedLink[] {
  if (!links?.length) return [{ label: '', url: '' }]
  return links.map((v) =>
    typeof v === 'string'
      ? { label: '', url: v }
      : { label: v.label ?? '', url: v.url ?? '' }
  )
}

export function buildAdditionalLinksPayload(
  links: NormalizedLink[] | undefined
): NormalizedLink[] {
  return (
    links
      ?.filter((l) => l.url.trim())
      .map((l) => ({ label: l.label?.trim() ?? '', url: l.url.trim() })) ?? []
  )
}
