import { Controller, Get, Header, Query, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedRequest } from '../auth/auth.types';
import { KeycloakAuthGuard } from '../auth/keycloak-auth.guard';
import { GetEdgesDto } from './dto/get-edges.dto';
import { EdgeService } from './edge.service';

@Controller('edge')
@UseGuards(KeycloakAuthGuard)
export class EdgeController {
  constructor(private readonly edge: EdgeService) {}

  /** Возвращает список edge с опциональными фильтрами по parent и тексту. */
  @Get()
  @Header('Cache-Control', 'no-store')
  @Header('Pragma', 'no-cache')
  @Header('Expires', '0')
  findAll(@Query() query: GetEdgesDto, @Req() request: AuthenticatedRequest) {
    return this.edge.findAll(query, request.user);
  }
}
