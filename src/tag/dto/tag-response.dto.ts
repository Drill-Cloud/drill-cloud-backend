export type TagItemDto = {
  id: string;
  name: string;
  tagGroup: string | null;
  min: number;
  max: number;
  comment: string;
  unitOfMeasurement: string;
  edgeIds: string[];
  precision: number | null;
};

export type TagResponseDto = {
  items: TagItemDto[];
};
