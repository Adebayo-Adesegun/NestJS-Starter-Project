import 'dotenv/config';
import { DataSourceOptions } from 'typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const sslOption: boolean = process.env.DATABASE_SSL === 'true';
const databaseConfig: DataSourceOptions & TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT) || 5432,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  ssl: sslOption,
  // Auto load entities registered via TypeOrmModule.forFeature
  autoLoadEntities: true,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  subscribers: [__dirname + '/../**/*.subscriber{.ts,.js}'],
  synchronize: false, // must always be false in production
  // Enable query logging in development only
  logging:
    process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
  // Use parameterized queries to prevent SQL injection
  maxQueryExecutionTime: 5000, // Log queries taking longer than 5 seconds
  migrationsRun: false,
  // Enable connection pooling for better performance
  extra: {
    max: 20, // Maximum number of connections in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
};

export default databaseConfig;
