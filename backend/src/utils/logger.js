export const LogLevel = {
	DEBUG: 0,
	INFO: 1,
	WARN: 2,
	ERROR: 3
};

export class Logger {
	constructor(level = LogLevel.INFO) {
		this.level = level;
	}

	shouldLog(level) {
		return level >= this.level;
	}

	levelName(level) {
		return Object.keys(LogLevel).find(key => LogLevel[key] === level);
	}

	log(level, ...args) {
		if (this.shouldLog(level)) {
			console.log(`[${this.levelName(level)}]`, ...args);
		}
	}

	debug(...args) { this.log(LogLevel.DEBUG, ...args); }
	info(...args)  { this.log(LogLevel.INFO,  ...args); }
	warn(...args)  { this.log(LogLevel.WARN,  ...args); }
	error(...args) { this.log(LogLevel.ERROR, ...args); }
}
