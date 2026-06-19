export type EdgeItemDto = {
  id: string;
  name: string;
  parentId: string | null;
  tagIds: string[];
  tagCount: number;
  currentTagCount: number;
  liveTagCount: number;
  lastDataAt: Date | null;
};

export type EdgeResponseDto = {
  items: EdgeItemDto[];
};
