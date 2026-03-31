import { NestFactory } from '@nestjs/core';
import { AppModule } from 'root_app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3100);
}
bootstrap();
