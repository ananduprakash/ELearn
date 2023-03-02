// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */

export const development = {
  client: 'pg',
  connection: {
    host: "127.0.0.1",
    database: 'elearn',
    user: 'postgres',
    password: 'password'
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './migrations',
  }
};