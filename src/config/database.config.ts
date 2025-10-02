import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';
import { Article } from '../entities/article.entity';
import { Category } from '../entities/category.entity';
import { Bookmark } from '../entities/bookmark.entity';
import { Like } from '../entities/like.entity';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const nodeEnv = configService.get('NODE_ENV') || 'development';
  const databaseUrl = configService.get('DATABASE_URL');
  const isProduction = nodeEnv === 'production';
  
  return {
    type: 'postgres',
    url: databaseUrl,
    host: configService.get('DB_HOST'),
    port: parseInt(configService.get('DB_PORT') || '5432'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_NAME'),
    entities: [User, Article, Category, Bookmark, Like],
    synchronize: !isProduction, // Only sync in development
    logging: !isProduction,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
    extra: isProduction ? {
      ssl: {
        rejectUnauthorized: false,
      },
    } : {},
  };
};
