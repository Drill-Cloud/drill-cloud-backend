export type HistoryPointDto = {
  t: number;
  v: number;
  min: number;
  avg: number;
  max: number;
  count: number;
};

export type HistorySeriesDto = {
  edge: string;
  tag: string;
  points: HistoryPointDto[];
};

export type HistoryResponseSource = 'empty' | 'latest' | 'raw' | '1m' | '5m' | '1h' | '1d';

export type HistoryResponseDto = {
  edge: string;
  source: HistoryResponseSource;
  targetPoints: number;
  series: HistorySeriesDto[];
  from?: Date;
  to?: Date;
  resolutionSeconds?: number | null;
};
