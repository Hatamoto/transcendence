export enum LogLevel {
	ERROR = 0,
	WARN = 1,
	INFO = 2,
	DEBUG = 3
}

export class Logger {
	private level: LogLevel;

	constructor(level: LogLevel = LogLevel.INFO) {
		this.level = level;
	}

	setLevel(level: LogLevel) {
		this.level = level;
	}

	error(...args: any[]) {
		if (this.level >= LogLevel.ERROR) console.error("[ERROR]", ...args);
	}

	warn(...args: any[]) {
		if (this.level >= LogLevel.WARN) console.warn("[WARN]", ...args);
	}

	info(...args: any[]) {
		if (this.level >= LogLevel.INFO) console.info("[INFO]", ...args);
	}

	debug(...args: any[]) {
		if (this.level >= LogLevel.DEBUG) console.debug("[DEBUG]", ...args);
	}
}
