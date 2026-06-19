import { BadRequestException } from '@nestjs/common';

// Единая нормализация обязательных строк: trim + понятная 400-ошибка для API.
/** Обрезает обязательное текстовое поле и возвращает 400, если оно стало пустым. */
export function normalizeRequiredText(value: string, fieldName: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new BadRequestException(`${fieldName} is required.`);
  }

  return normalized;
}

/** Обрезает необязательный query-текст и превращает пустые строки в undefined. */
export function normalizeOptionalText(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  const normalized = String(value).trim();
  return normalized || undefined;
}
