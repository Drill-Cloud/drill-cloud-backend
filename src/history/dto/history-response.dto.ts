export type HistoryPointDto = {
  time: Date;
  min_value: number;
  avg_value: number;
  max_value: number;
  point_count: number;
};

export type HistoryResponseDto = {
  rows: HistoryPointDto[];
};
