import { Controller, Get, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @ApiOperation({ summary: 'Obtener los logs de auditoría (Solo ADMIN)' })
  @Get('logs')
  async getLogs(@Request() req: any) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('No tienes permiso para acceder a los logs de auditoría');
    }
    return this.auditService.getLogs();
  }
}
