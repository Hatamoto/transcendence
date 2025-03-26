export enum LogLevel {
	DEBUG = 0,
	INFO = 1,
	WARN = 2,
	ERROR = 3
}

export class Logger {
	constructor(private level: LogLevel = LogLevel.INFO) {}

	private shouldLog(level: LogLevel): boolean {
		return level >= this.level;
	}

	private levelName(level: LogLevel): string {
		return LogLevel[level];
	}

	log(level: LogLevel, ...args: any[]) {
		if (this.shouldLog(level)) {
			console.log(`[${this.levelName(level)}]`, ...args);
		}
	}

	debug(...args: any[]) { this.log(LogLevel.DEBUG, ...args); }
	info(...args: any[])  { this.log(LogLevel.INFO,  ...args); }
	warn(...args: any[])  { this.log(LogLevel.WARN,  ...args); }
	error(...args: any[]) { this.log(LogLevel.ERROR, ...args); }
}
