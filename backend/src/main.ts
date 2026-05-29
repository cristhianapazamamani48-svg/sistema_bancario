import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Seguridad básica
  app.use(helmet());
  app.enableCors();

  // Validaciones globales para los DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // remueve propiedades no definidas en el DTO
    forbidNonWhitelisted: true, // lanza error si mandan datos que no pedimos
    transform: true, // transforma los tipos de datos automáticamente
  }));

  await app.listen(3000);
}
bootstrap();
