import fp from 'fastify-plugin'
import Database from 'better-sqlite3'

async function dbInit(fastify, options) {
  const dbFile = process.env.DB_FILE || "./database.db"
  const db = new Database(dbFile, { verbose: console.log })

//   db.exec(`
//     DROP TABLE IF EXISTS otp_codes;
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
      name TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      number TEXT UNIQUE DEFAULT NULL,
      status INTEGER NOT NULL DEFAULT 0 CHECK(status IN (0 ,1)),
      wins INTEGER NOT NULL DEFAULT 0,
      losses INTEGER NOT NULL DEFAULT 0,
      avatar TEXT NOT NULL,
      two_fa_enabled INTEGER NOT NULL DEFAULT 0 CHECK(status IN (0 ,1)),
      two_fa_method TEXT CHECK(two_fa_method IN ('sms', 'email', 'auth_app')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS otp_codes (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    otp_code TEXT NOT NULL,
    otp_secret TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
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

  // db.exec(`
  //   CREATE TABLE IF NOT EXISTS match_history (
  //     opponent TEXT NOT NULL,
  //     date DATETIME DEFAULT CURRENT_TIMESTAMP
  //   );
  // `)

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

  db.exec(`
    CREATE TABLE IF NOT EXISTS pending_logins (
      id INTEGER PRIMARY KEY,
      user_id INTEGER,
      temp_token TEXT NOT NULL,
      expires_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `)
  fastify.decorate("db", db);

  fastify.addHook("onClose", (fastify, done) => {
    db.close();
    done();
  });
  console.log("Database created successfully");
}

export default fp(dbInit);