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
] as const

export type MapCategoryKey = (typeof MAP_CATEGORY_KEYS)[number]

export function getMapCategoryLabel(
  t: (key: string) => string,
  category: string,
): string {
  const normalized = category?.toLowerCase().trim() ?? ''
  const key = `category.${normalized}`
  try {
    const translated = t(key)
    return translated || category || ''
  } catch {
    return category || ''
  }
}
