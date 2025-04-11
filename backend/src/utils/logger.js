export const LogLevel = {
	DEBUG: 0,
	INFO: 1,
	WARN: 2,
	ERROR: 3
};

const Colors = {
	Reset: "\x1b[0m",
	Gray: "\x1b[90m",
	Green: "\x1b[32m",
	Yellow: "\x1b[33m",
	Red: "\x1b[31m",
	Blue: "\x1b[34m",
	LightGreen: "\x1b[92m",
	Orange: "\x1b[33m"
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

	levelColor(level) {
		switch (level) {
			case LogLevel.DEBUG: return Colors.Gray;
			case LogLevel.INFO: return Colors.Blue;
			case LogLevel.WARN: return Colors.Yellow;
			case LogLevel.ERROR: return Colors.Red;
			default: return Colors.Reset;
		}
	}

	endColor(end) {

	}

	log(level, ...args) {
		let end = 0;

		if (typeof args[args.length - 1] === 'object' && args[args.length - 1].__frontend === true) {
			end = 1;
			args.pop();
		}
	
		const labelColor = end === 1 ? Colors.LightGreen : Colors.Orange ; // Light green for frontend, blue for backend
		const levelColor = this.levelColor(level); // Level-based color stays independent
		const label = end === 1 ? "[F]" : "[B]";
		
		const tag = `${labelColor}${label}${levelColor}[${this.levelName(level)}]\x1b[0m`;		
	
		if (this.shouldLog(level)) {
			console.log(tag, ...args);
		}
	}

	debug(...args) { this.log(LogLevel.DEBUG, ...args); }
	info(...args)  { this.log(LogLevel.INFO,  ...args); }
	warn(...args)  { this.log(LogLevel.WARN,  ...args); }
	error(...args) { this.log(LogLevel.ERROR, ...args); }
}

