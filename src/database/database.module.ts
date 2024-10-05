import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        dialect: 'mysql',
        host: configService.getOrThrow('MYSQL_HOST'),
        port: +configService.get('MYSQL_PORT') ?? 3306,
        username: configService.getOrThrow('MYSQL_USERNAME'),
        password: configService.getOrThrow('MYSQL_PASSWORD'),
        database: configService.getOrThrow('MYSQL_DB'),
        synchronize: true,
        autoLoadModels: true,
        // sync: { force: true },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
