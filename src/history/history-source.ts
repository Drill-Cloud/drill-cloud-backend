import { HistorySource } from './history.types';

export const RAW_HISTORY_SOURCE: HistorySource = {
  name: 'raw',
  table: 'history',
  timeColumn: 'timestamp',
  intervalSeconds: 0,
};

export const AGGREGATE_HISTORY_SOURCES: HistorySource[] = [
  { name: '1m', table: 'history_1m', timeColumn: 'bucket', intervalSeconds: 60 },
  { name: '5m', table: 'history_5m', timeColumn: 'bucket', intervalSeconds: 300 },
  { name: '1h', table: 'history_1h', timeColumn: 'bucket', intervalSeconds: 3600 },
  { name: '1d', table: 'history_1d', timeColumn: 'bucket', intervalSeconds: 86400 },
];

/** Подбирает самый детальный слой, который не превышает целевой бюджет точек. */
export function chooseHistorySource(from: Date, to: Date, targetPoints: number): HistorySource {
  const durationSeconds = Math.max((to.getTime() - from.getTime()) / 1000, 1);
  const desiredSeconds = durationSeconds / Math.max(targetPoints, 1);

  if (desiredSeconds < 60) {
    return RAW_HISTORY_SOURCE;
  }

  return (
    AGGREGATE_HISTORY_SOURCES.find((source) => source.intervalSeconds >= desiredSeconds) ??
    AGGREGATE_HISTORY_SOURCES[AGGREGATE_HISTORY_SOURCES.length - 1]
  );
}
