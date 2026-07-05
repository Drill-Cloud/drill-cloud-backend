import { Module } from '@nestjs/common';
import { CameraController } from './camera.controller';
import { CameraRepository } from './camera.repository';
import { CameraService } from './camera.service';

@Module({
  controllers: [CameraController],
  providers: [CameraService, CameraRepository],
})
export class CameraModule {}
