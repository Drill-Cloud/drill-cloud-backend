export type HistorySourceName = 'raw' | '1m' | '5m' | '1h' | '1d';

export type HistorySource = {
  name: HistorySourceName;
  table: string;
  timeColumn: string;
  intervalSeconds: number;
};

export type HistoryRow = {
  edge: string;
  tag: string;
  time: Date;
  value: number;
  min_value: number;
  avg_value: number;
  max_value: number;
  point_count: number;
};
