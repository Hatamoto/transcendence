import fp from 'fastify-plugin'
import Database from 'better-sqlite3'
import { Logger, LogLevel } from '../utils/logger.js';
import { waitForDBFile, waitForTables} from './wait_db.js';

const log = new Logger(LogLevel.INFO);
const requiredTables = ['users', 'refresh_tokens', 'friends'];
const dbFile = process.env.DB_FILE || "/data/database.db"

async function dbInit(fastify) {
  
  await waitForDBFile(dbFile);

  const db = new Database(dbFile); //, { verbose: console.log });

  await waitForTables(db, requiredTables);
  
  fastify.decorate("db", db);

  fastify.addHook("onClose", (fastify, done) => {
    db.close();
    done();
  });

  log.info("Connected to database successfully");
}

export default fp(dbInit);
