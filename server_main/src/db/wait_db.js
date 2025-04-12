import fp from 'fastify-plugin'
import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import { Logger, LogLevel } from '../utils/logger.js'

const log = new Logger(LogLevel.INFO);

export async function waitForDBFile(filePath, timeoutMs = 30000, checkInterval = 500) {
	log.info("Waiting for DB file:", filePath);
	const maxTries = Math.ceil(timeoutMs / checkInterval);
	let tries = 0;

	return new Promise((resolve, reject) => {
		const interval = setInterval(() => {
			if (fs.existsSync(filePath)) {
				clearInterval(interval);
				return resolve();
			}

			tries++;
			if (tries >= maxTries) {
				clearInterval(interval);
				return reject(new Error("Timed out waiting for database file"));
			}
		}, checkInterval);
	});
}

export async function waitForTables(db, requiredTables, timeoutMs = 30000, checkInterval = 1000) {
	log.info("Waiting for required tables...");
	const maxTries = Math.ceil(timeoutMs / checkInterval);
	let tries = 0;

	return new Promise((resolve, reject) => {
		const interval = setInterval(() => {
			try {
				const tables = db.prepare(`
					SELECT name FROM sqlite_master WHERE type='table';
				`).all().map(r => r.name);

				const missing = requiredTables.filter(t => !tables.includes(t));
				if (missing.length === 0) {
					clearInterval(interval);
					return resolve();
				}

				log.debug("Still missing tables:", missing.join(", "));
			} catch (err) {
				log.error("Error checking tables:", err);
			}

			tries++;
			if (tries >= maxTries) {
				clearInterval(interval);
				return reject(new Error("Timed out waiting for required tables"));
			}
		}, checkInterval);
	});
}