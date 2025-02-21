import Fastify, { FastifyInstance } from 'fastify';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import fp from 'fastify-plugin';

// Function to initialize the database
const initDB = async (): Promise<Database> => {
    const db = await open({
        filename: './database.sqlite',
        driver: sqlite3.Database,
    });

    // Create tables if they don't exist
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL
        );
    `);

    return db;
};

// Fastify plugin to register the database
const dbPlugin = fp(async (fastify: FastifyInstance) => {
    const db = await initDB();
    fastify.decorate('db', db);
});

export default dbPlugin;

