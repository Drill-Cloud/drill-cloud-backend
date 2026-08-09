export type CameraItemDto = {
  name: string;
  protocol: string;
  source: string;
};

export type CameraResponseDto = {
  edge: string;
  items: CameraItemDto[];
};
