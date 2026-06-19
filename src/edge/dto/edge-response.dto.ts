export type EdgeItemDto = {
  id: string;
  name: string;
  parentId: string | null;
  tagIds: string[];
  tagCount: number;
};

export type EdgeResponseDto = {
  items: EdgeItemDto[];
};
