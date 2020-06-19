const env = process.env.NODE_ENV || 'development';

const config = {
  entities: [
    `${__dirname}/server/entity/**/*.js`,
  ],
  migrations: [
    'dist/server/migration/*.js',
  ],
  subscribers: [
    'server/subscriber/*.js',
  ],
  cli: {
    entitiesDir: 'server/entity',
    migrationsDir: 'server/migration',
    subscribersDir: 'server/subscriber',
  },
};

switch (env) {
  case 'development':
    config.type = 'sqlite';
    config.database = `${__dirname}/database.sqlite`;
    config.synchronize = true;
    config.logger = 'advanced-console';
    config.logging = ['query'];
    break;
  case 'test':
    config.type = 'sqlite';
    config.database = ':memory:';
    config.synchronize = true;
    config.logger = 'debug';
    config.logging = true;
    break;
  case 'production':
    config.type = 'postgres';
    config.url = process.env.DATABASE_URL;
    config.synchronize = false;
    config.migrationsRun = true;
    config.logger = 'info';
    config.logging = true;
    break;
  default:
    throw new Error(`Unexpected environment: ${env}`);
}

module.exports = config;
