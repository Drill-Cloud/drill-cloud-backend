export type EdgeItemDto = {
  id: string;
  name: string;
  parentId: string | null;
};

export type EdgeResponseDto = {
  items: EdgeItemDto[];
};
