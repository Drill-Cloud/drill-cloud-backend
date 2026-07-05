import { Injectable } from '@nestjs/common';
import { CameraResponseDto } from './dto/camera-response.dto';
import { GetCamerasDto } from './dto/get-cameras.dto';
import { createCameraResponse } from './camera.mapper';
import { CameraRepository } from './camera.repository';

@Injectable()
export class CameraService {
  constructor(private readonly repository: CameraRepository) {}

  async findByEdge(query: GetCamerasDto): Promise<CameraResponseDto> {
    const rows = await this.repository.findByEdge(query.edge);
    return createCameraResponse(query.edge, rows);
  }
}
