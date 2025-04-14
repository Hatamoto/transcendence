import fp from 'fastify-plugin'
import fs from 'fs'
import Database from 'better-sqlite3'
import { Logger, LogLevel } from './utils/logger.js';

const log = new Logger(LogLevel.INFO);
const dbFile = process.env.DB_FILE || "/app/data/database.db"

async function dbInit(fastify, options) {
    try {
    log.info("Creating database");

    fs.mkdirSync('/data', { recursive: true })

    const db = new Database(dbFile); //, { verbose: console.log })

    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        google_id TEXT UNIQUE DEFAULT NULL,
        name TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        status INTEGER NOT NULL DEFAULT 0 CHECK(status IN (0 ,1)),
        wins INTEGER NOT NULL DEFAULT 0,
        losses INTEGER NOT NULL DEFAULT 0,
        avatar TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `)

    db.exec(`
        CREATE TABLE IF NOT EXISTS refresh_tokens (
        id INTEGER PRIMARY KEY,
        user_id INTEGER,
        refresh_token TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `)

    db.exec(`
        CREATE TABLE IF NOT EXISTS friends (
        user_id INTEGER NOT NULL,
        friend_id INTEGER NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('pending', 'accepted', 'blocked')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, friend_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `)

    fastify.decorate("db", db);

    fastify.addHook("onClose", (fastify, done) => {
        db.close();
        done();
    });
    log.info("Database created successfully");
    } 	 catch (err) {
        console.error('[DB INIT FAILED]', err)
        throw err // optional: just log and continue if desired
    }
}
export default fp(dbInit);