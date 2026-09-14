import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Bootstrap');
  logger.log(
    `Environment loaded | ENV_FILE=${process.env.ENV_FILE ?? '.env.development'} | NODE_ENV=${process.env.NODE_ENV} | EMAIL_OTP_PROVIDER=${process.env.EMAIL_OTP_PROVIDER} | RESEND_API_KEY=${process.env.RESEND_API_KEY ? 'defined' : 'undefined'}`,
  );
  const isProduction = process.env.NODE_ENV === 'production';
  const configuredOrigins: string[] = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
        .map((o) => o.trim())
        .filter(Boolean)
    : [];

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // non-browser (postman, swaggerUI, dkk.)
      if (!origin) {
        callback(null, true);
        return;
      }

      if (!isProduction) {
        if (
          origin.startsWith('http://localhost:') ||
          origin.startsWith('http://127.0.0.1:') ||
          origin === 'http://localhost' ||
          origin === 'http://127.0.0.1' ||
          configuredOrigins.includes(origin)
        ) {
          callback(null, true);
          return;
        }
      } else {
        if (configuredOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
      }

      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    methods: 'GET, POST, PUT, PATCH, DELETE',
    credentials: true,
  });

  const trustProxy = process.env.TRUST_PROXY ?? (isProduction ? 1 : 'loopback');
  app.set('trust proxy', trustProxy);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  if (!isProduction || process.env.SWAGGER_ENABLED === 'true') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('CekEmmy API')
      .setDescription('Dokumentasi API Backend CekEmmy / FinPro')
      .setVersion('1.0.0')
      .addCookieAuth(
        'better-auth.session_token',
        {
          type: 'apiKey',
          in: 'cookie',
          name: 'better-auth.session_token',
          description: 'Session cookie Better Auth',
        },
        'cookie',
      )
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Bearer token untuk otentikasi',
        },
        'bearer',
      )
      .addTag('Auth', 'Autentikasi dan registrasi pengguna')
      .addTag('Orders', 'Manajemen pesanan & status pembayaran')
      .addTag('Products', 'Manajemen katalog produk & stok')
      .addTag('Finance', 'Manajemen transaksi keuangan & kategori')
      .addTag('Users', 'Manajemen pengguna & profil')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document, {
      jsonDocumentUrl: '/docs-json',
      yamlDocumentUrl: '/docs-yaml',
    });
  }

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
