export type TagItemDto = {
  id: string;
  name: string;
  tagGroup: string | null;
  min: number | null;
  max: number | null;
  comment: string;
  unitOfMeasurement: string;
  precision: number | null;
  color: string;
};

export type TagResponseDto = {
  items: TagItemDto[];
};
