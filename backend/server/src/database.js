import fp from 'fastify-plugin'
import Database from 'better-sqlite3'
import { Logger, LogLevel } from './utils/logger.js';

const log = new Logger(LogLevel.INFO);

async function dbInit(fastify, options) {
  log.info("Creating database");
  const dbFile = process.env.DB_FILE || "../../database/database.db"
  const db = new Database(dbFile); //, { verbose: console.log })

//  db.exec(`
//    DROP TABLE IF EXISTS otp_codes;
//  `)

//  db.exec(`
//     DROP TABLE IF EXISTS refresh_tokens;
//  `)

//  db.exec(`
//     DROP TABLE IF EXISTS friends;
//  `)

  // db.exec(`
  //    DROP TABLE IF EXISTS pending_logins;
  // `)

// db.exec(`
//    DROP TABLE IF EXISTS users;
// `)

//   db.exec(`
//     ALTER TABLE users ADD COLUMN number TEXT DEFAULT NULL;
//  `);
 
//  db.exec(`
//     CREATE UNIQUE INDEX IF NOT EXISTS unique_number_index ON users (number);
//  `);

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

  //db.exec(`
  //  CREATE TABLE IF NOT EXISTS tournaments (
  //    id INTEGER PRIMARY KEY,
  //    name TEXT NOT NULL,
  //    size INTEGER,
  //    created_by INTEGER,
  //    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  //    status TEXT NOT NULL CHECK(status IN ('created', 'in_progress', 'completed')),
  //    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  //  );
  //`)

  //db.exec(`
  //  CREATE TABLE IF NOT EXISTS match_history (
     // id INTEGER PRIMARY KEY,
    //  player_one_id INTEGER,
    //  player_two_id INTEGER,
    //  score_player_one INTEGER,
     // score_player_two INTEGER,
      //winner_id INTEGER,
      //round INTEGER,
      //tournament_id INTEGER,
     // match_type TEXT CHECK(match_type IN ('single', 'tournament')),
  //    date DATETIME DEFAULT CURRENT_TIMESTAMP,
      //FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE SET NULL,
      //FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL,
      //FOREIGN KEY (player_one_id) REFERENCES users(id) ON DELETE SET NULL,
      //FOREIGN KEY (player_two_id) REFERENCES users(id) ON DELETE SET NULL
  //  );
  //`)

    //db.exec(`
  //  CREATE TABLE IF NOT EXISTS matches (
     // id INTEGER PRIMARY KEY,
     // tournament_id INTEGER NOT NULL,
     // round INTEGER NOT NULL
     // match_number INTEGER NOT NULL,
    //  player_one_id INTEGER,
    //  player_two_id INTEGER,
    //  player_one_prev_match INTEGER,
     // player_two_prev_match INTEGER,
      //winner_id INTEGER,
      //round INTEGER,
      //status TEXT NOT NULL DEFAULT 'waiting' CHECK(status IN ('waiting', 'pending', 'in_progress', 'completed', 'bye'))
    //  FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
    //  FOREIGN KEY (player_one_id) REFERENCES users(id),
      //FOREIGN KEY (player_two_id) REFERENCES users(id),
      //FOREIGN KEY (winner_id) REFERENCES users(id),
      //FOREIGN KEY (player_one_prev_match) REFERENCES matches(id),
      //FOREIGN KEY (player_two_prev_match) REFERENCES matches(id)
  //  );
  //`)

  //db.exec(`
    //CREATE TABLE IF NOT EXISTS tournament_players (
    //  id INTEGER PRIMARY KEY,
    //  tournament_id INTEGER NOT NULL,
    //  user_id INTEGER UNIQUE,
    //  is_ready INTEGER NOT NULL DEFAULT 0 CHECK(is_ready IN (0 ,1)),
    //  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    //  FOREIGN KEY (player_id) REFERENCES users(id) ON DELETE SET NULL
    //);
  //`)

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
}

export default fp(dbInit);