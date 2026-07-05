import { Controller, Get, Header, Query } from '@nestjs/common';
import { CameraService } from './camera.service';
import { GetCamerasDto } from './dto/get-cameras.dto';

@Controller('camera')
export class CameraController {
  constructor(private readonly camera: CameraService) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  @Header('Pragma', 'no-cache')
  @Header('Expires', '0')
  findByEdge(@Query() query: GetCamerasDto) {
    return this.camera.findByEdge(query);
  }
}
