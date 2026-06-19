import { Module } from '@nestjs/common';
import { CurrentController } from './current.controller';
import { CurrentEventsService } from './current-events.service';
import { CurrentRepository } from './current.repository';
import { CurrentService } from './current.service';

@Module({
  controllers: [CurrentController],
  providers: [CurrentService, CurrentEventsService, CurrentRepository],
})
export class CurrentModule {}
