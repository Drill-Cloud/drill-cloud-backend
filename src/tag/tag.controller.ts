import { Controller, Get, Header, Query, UseGuards } from '@nestjs/common';
import { KeycloakAuthGuard } from '../auth/keycloak-auth.guard';
import { GetTagsDto } from './dto/get-tags.dto';
import { TagService } from './tag.service';

@Controller('tag')
@UseGuards(KeycloakAuthGuard)
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
