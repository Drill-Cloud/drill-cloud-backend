// Поддерживает оба формата: ?tags=a,b и ?tags=a&tags=b; дубликаты убираются.
/** Приводит повторяющиеся или разделенные запятыми query-параметры к чистому массиву строк. */
export function parseCommaSeparatedList(value: unknown): string[] | undefined {
  if (value == null || value === '') {
    return undefined;
  }

  const rawItems = Array.isArray(value)
    ? value.flatMap((item) => String(item).split(','))
    : String(value).split(',');

  const items = rawItems.map((item) => item.trim()).filter(Boolean);
  return items.length ? Array.from(new Set(items)) : undefined;
}
