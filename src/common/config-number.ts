import { ConfigService } from '@nestjs/config';

/** Читает числовой параметр конфига и использует резервное значение, если он пустой или неверный. */
export function getNumberConfig(
  config: ConfigService,
  key: string,
  fallback: number,
): number {
  const value = config.get<string>(key);
  if (value === undefined || value === '') {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** Читает числовой параметр конфига и округляет вниз для лимитов и размеров пулов. */
export function getIntegerConfig(
  config: ConfigService,
  key: string,
  fallback: number,
): number {
  return Math.floor(getNumberConfig(config, key, fallback));
}
