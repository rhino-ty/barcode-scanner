import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import { validate } from './config/env.validation';
import databaseConfig from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env`,
      validate,
      load: [databaseConfig],
    }),
    ProductsModule,
  ],
})
export class AppModule {}
