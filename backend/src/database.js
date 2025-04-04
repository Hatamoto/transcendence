import fp from 'fastify-plugin'
import Database from 'better-sqlite3'
import { Logger, LogLevel } from './utils/logger.js';

const log = new Logger(LogLevel.INFO);

async function dbInit(fastify, options) {
  log.info("Creating database");
  const dbFile = process.env.DB_FILE || "./database.db"
  const db = new Database(dbFile); //, { verbose: console.log })

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      status INTEGER NOT NULL DEFAULT 0 CHECK(status IN (0 ,1)),
      wins INTEGER NOT NULL DEFAULT 0,
      losses INTEGER NOT NULL DEFAULT 0,
      avatar TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS match_history (
      opponent TEXT NOT NULL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS friends (
      name TEXT PRIMARY KEY,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `)

  fastify.decorate("db", db);

  fastify.addHook("onClose", (fastify, done) => {
    db.close();
    done();
  });
  log.info("Database created successfully");
}

export default fp(dbInit);