export type HistoryPointDto = {
  t: number;
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

export type HistoryResponseDto = {
  edge: string;
  tag: string;
  from: Date;
  to: Date;
  granulate: string;
  series: HistorySeriesDto[];
};
