import { Controller, Get, Header, Query } from '@nestjs/common';
import { GetTagsDto } from './dto/get-tags.dto';
import { TagService } from './tag.service';

@Controller('tag')
export class TagController {
  constructor(private readonly tag: TagService) {}

  /** Возвращает список тегов с опциональными фильтрами по edge и тексту. */
  @Get()
  @Header('Cache-Control', 'no-store')
  @Header('Pragma', 'no-cache')
  @Header('Expires', '0')
  findAll(@Query() query: GetTagsDto) {
    return this.tag.findAll(query);
  }
}
