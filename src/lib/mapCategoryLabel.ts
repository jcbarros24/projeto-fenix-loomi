export const MAP_CATEGORY_KEYS = [
  'sports',
  'transport',
  'heritage',
  'education',
  'tourism',
  'health',
  'park',
  'food',
  'commerce',
  'entertainment',
] as const

export type MapCategoryKey = (typeof MAP_CATEGORY_KEYS)[number]

export function getMapCategoryLabel(
  t: (key: string) => string,
  category: string,
): string {
  const normalized = category?.toLowerCase().trim() ?? ''
  if (!normalized) return category || ''
  const isKnown = MAP_CATEGORY_KEYS.includes(normalized as MapCategoryKey)
  if (!isKnown) {
    return t('others') || category || ''
  }
  try {
    const translated = t(`category.${normalized}`)
    return translated || category || ''
  } catch {
    return category || ''
  }
}
