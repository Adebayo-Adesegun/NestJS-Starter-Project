import 'dotenv/config';
import { User } from 'src/core/entities/user.entity';
import { DataSourceOptions } from 'typeorm';

const sslOption: boolean = process.env.DATABASE_SSL === 'true';
const databaseConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT) || 5432,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  ssl: sslOption,
  entities: [User],
  migrations: [],
  subscribers: [__dirname + '/**/*.subscriber{.ts,.js}'],
  synchronize: false, // must always be false in production
  logging: true,
  migrationsRun: false,
};

export default databaseConfig;
