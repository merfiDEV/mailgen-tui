import fs from "fs";
import path from "path";

export type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LEVEL_LABELS: Record<LogLevel, string> = {
  debug: "DBG",
  info: "INF",
  warn: "WRN",
  error: "ERR",
};

const COLORS: Record<LogLevel, string> = {
  debug: "\x1b[90m",
  info: "\x1b[36m",
  warn: "\x1b[33m",
  error: "\x1b[31m",
};

const RESET = "\x1b[0m";

class Logger {
  private _minLevel: LogLevel = "info";
  private _logDir: string;
  private _name: string;

  constructor(name: string, logDir = "logs") {
    this._name = name;
    this._logDir = logDir;
    fs.mkdirSync(logDir, { recursive: true });
  }

  setLevel(level: LogLevel) {
    this._minLevel = level;
  }

  debug(msg: string, ...args: unknown[]) {
    this._log("debug", msg, args);
  }

  info(msg: string, ...args: unknown[]) {
    this._log("info", msg, args);
  }

  warn(msg: string, ...args: unknown[]) {
    this._log("warn", msg, args);
  }

  error(msg: string, ...args: unknown[]) {
    this._log("error", msg, args);
  }

  private _log(level: LogLevel, msg: string, args: unknown[]) {
    if (LEVEL_ORDER[level] < LEVEL_ORDER[this._minLevel]) return;

    const ts = new Date().toISOString().replace("T", " ").slice(0, 19);
    const extra = args.length > 0 ? " " + args.map(String).join(" ") : "";
    const line = `${ts} [${LEVEL_LABELS[level]}] ${this._name}: ${msg}${extra}`;

    // File log
    try {
      const logFile = path.join(this._logDir, "app.log");
      fs.appendFileSync(logFile, line + "\n", "utf-8");
    } catch {
      // ignore
    }

    // Console log (only when explicitly enabled, e.g. CLI mode without TUI)
    if (_consoleEnabled && LEVEL_ORDER[level] >= LEVEL_ORDER[this._minLevel]) {
      const color = COLORS[level];
      process.stdout.write(`${color}${line}${RESET}\n`);
    }
  }
}

let _consoleEnabled = false;

export function setConsoleEnabled(enabled: boolean) {
  _consoleEnabled = enabled;
}

const loggers = new Map<string, Logger>();

export function getLogger(name: string, logDir?: string): Logger {
  if (!loggers.has(name)) {
    loggers.set(name, new Logger(name, logDir));
  }
  return loggers.get(name)!;
}

export function setupLogger(logDir = "logs", level: LogLevel = "warn") {
  const root = getLogger("App", logDir);
  root.setLevel(level);
  _consoleEnabled = true;
  return root;
}
