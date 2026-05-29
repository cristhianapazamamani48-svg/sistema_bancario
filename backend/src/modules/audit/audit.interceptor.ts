import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, ip, user, body } = req;

    // Solo auditaremos mutaciones (cambios de estado en el banco)
    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

    return next.handle().pipe(
      tap(async () => {
        // No auditamos el login directamente en detalle por motivos de no guardar contraseñas
        if (isMutation && !url.includes('/login') && !url.includes('/register')) {
          await this.prisma.auditLog.create({
            data: {
              user_id: user?.userId || null,
              action: `${method} ${url}`,
              ip_address: ip || 'unknown',
              details: body ? JSON.parse(JSON.stringify(body)) : {}, // Copia limpia
            },
          });
        }
      }),
    );
  }
}
