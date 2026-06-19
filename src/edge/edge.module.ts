import { Module } from '@nestjs/common';
import { EdgeController } from './edge.controller';
import { EdgeRepository } from './edge.repository';
import { EdgeService } from './edge.service';

@Module({
  controllers: [EdgeController],
  providers: [EdgeService, EdgeRepository],
})
export class EdgeModule {}
