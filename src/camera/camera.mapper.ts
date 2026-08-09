import { CameraResponseDto } from './dto/camera-response.dto';
import { CameraRow } from './camera.types';

export function createCameraResponse(edge: string, rows: CameraRow[]): CameraResponseDto {
  return {
    edge,
    items: rows.map((row) => ({
      name: row.name,
      protocol: row.protocol,
      source: row.source,
    })),
  };
}
