import 'dotenv/config';
import { parseBoolean } from 'src/utility/utility.core';
import { DataSourceOptions } from 'typeorm';

const databaseConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT) || 5432,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  ssl: parseBoolean(process.env.DATABASE_SSL || false),
  entities: [],
  migrations: [],
  subscribers: [__dirname + '/**/*.subscriber{.ts,.js}'],
  synchronize: false, // must always be false in production
  logging: true,
  migrationsRun: false,
};

export default databaseConfig;
