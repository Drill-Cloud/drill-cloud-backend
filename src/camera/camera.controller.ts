import { Controller, Get, Header, Query, UseGuards } from '@nestjs/common';
import { EdgeAccessGuard } from '../auth/edge-access.guard';
import { KeycloakAuthGuard } from '../auth/keycloak-auth.guard';
import { CameraService } from './camera.service';
import { GetCamerasDto } from './dto/get-cameras.dto';

@Controller('camera')
@UseGuards(KeycloakAuthGuard, EdgeAccessGuard)
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
