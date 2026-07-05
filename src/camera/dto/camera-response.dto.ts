export type CameraItemDto = {
  protocol: string;
  source: string;
};

export type CameraResponseDto = {
  edge: string;
  items: CameraItemDto[];
};
