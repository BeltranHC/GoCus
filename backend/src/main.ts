// ============================================
// GOCus ERP/POS — Bootstrap
// ============================================

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app/app.module';
import { HttpExceptionFilter } from './common/filters';
import { TransformInterceptor, LoggingInterceptor } from './common/interceptors';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // ── Prefijo global de API ──
  app.setGlobalPrefix('api');

  // ── Seguridad Avanzada ──
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'blob:'],
          connectSrc: ["'self'"],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false, // Required for fonts
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  );
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 3600,
  });

  // ── Pipes globales ──
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Filtros globales ──
  app.useGlobalFilters(new HttpExceptionFilter());

  // ── Interceptores globales ──
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // ── Swagger ──
  const swaggerConfig = new DocumentBuilder()
    .setTitle('GOCus ERP/POS API')
    .setDescription('API del sistema ERP/POS multisucursal GOCus')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Autenticación')
    .addTag('Usuarios')
    .addTag('Roles')
    .addTag('Permisos')
    .addTag('Empresas')
    .addTag('Sucursales')
    .addTag('Almacenes')
    .addTag('Productos')
    .addTag('Categorías')
    .addTag('Marcas')
    .addTag('Unidades')
    .addTag('Clientes')
    .addTag('Proveedores')
    .addTag('Ventas')
    .addTag('Compras')
    .addTag('Inventario')
    .addTag('Kardex')
    .addTag('Caja')
    .addTag('Dashboard')
    .addTag('Reportes')
    .addTag('Auditoría')
    .addTag('Notificaciones')
    .addTag('Configuración')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // ── Iniciar servidor ──
  const port = process.env.BACKEND_PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 GOCus Backend corriendo en http://localhost:${port}`);
  logger.log(`📚 Swagger UI en http://localhost:${port}/api/docs`);
}

bootstrap();
