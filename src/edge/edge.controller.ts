import { Controller, Get, Header, Query } from '@nestjs/common';
import { GetEdgesDto } from './dto/get-edges.dto';
import { EdgeService } from './edge.service';

@Controller('edge')
export class EdgeController {
  constructor(private readonly edge: EdgeService) {}

  /** Возвращает список edge с опциональными фильтрами по parent и тексту. */
  @Get()
  @Header('Cache-Control', 'no-store')
  @Header('Pragma', 'no-cache')
  @Header('Expires', '0')
  findAll(@Query() query: GetEdgesDto) {
    return this.edge.findAll(query);
  }
}
