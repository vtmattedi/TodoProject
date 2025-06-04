import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
declare const module: any;
async function bootstrap() {
  const PORT = process.env.PORT || 3000;
  console.log(`NestJS application is starting... at http://localhost:${PORT}`);
  console.log('\t\x1b[1mEnvironment:\x1b[0m', process.env.NODE_ENV);
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('VMC Todo - A Tasks API')
    .setDescription('The todo API description')
    .setVersion('1.0')
    .addTag('Authentication', 'Auth Endpoints (Requires a refresh token expect login and register)')
    .addTag('Tasks', 'Tasks Endpoints (Requires an access token)')
    .addTag('Misc', 'Utility Endpoints')
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  await app.listen(PORT);
}
bootstrap();
