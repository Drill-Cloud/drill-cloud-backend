export type HistoryRow = {
  time: Date;
  min_value: number;
  avg_value: number;
  max_value: number;
  point_count: number;
};

export type HistorySeriesRow = Omit<HistoryRow, 'time'> & {
  tag: string;
  time: string;
};
