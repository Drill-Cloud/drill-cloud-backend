export type CurrentItemDto = {
  edge: string;
  tag: string;
  value: number;
  createdAt: Date;
  updatedAt: Date;
  time: Date;
  name: string | null;
  tagGroup: string | null;
  min: number | null;
  max: number | null;
  comment: string | null;
  unitOfMeasurement: string | null;
  precision: number | null;
};

export type CurrentResponseDto = {
  edge: string;
  items: CurrentItemDto[];
};
