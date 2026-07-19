import { getLogger } from "./utils/logger.js";

const log = getLogger("Scheduler");

export interface ScheduledJob {
  id: string;
  name: string;
  intervalMs: number;
  callback: () => void | Promise<void>;
  lastRun?: Date;
  nextRun?: Date;
}

export class Scheduler {
  private _jobs: Map<string, ScheduledJob> = new Map();
  private _intervals: Map<string, ReturnType<typeof setInterval>> = new Map();
  private _running = false;

  addJob(name: string, intervalMs: number, callback: () => void | Promise<void>): string {
    const id = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const job: ScheduledJob = {
      id,
      name,
      intervalMs,
      callback,
      nextRun: new Date(Date.now() + intervalMs),
    };
    this._jobs.set(id, job);
    log.info(`Job added: ${name} (every ${intervalMs / 1000}s)`);
    if (this._running) this._startJob(job);
    return id;
  }

  removeJob(id: string) {
    const interval = this._intervals.get(id);
    if (interval) clearInterval(interval);
    this._intervals.delete(id);
    this._jobs.delete(id);
  }

  start() {
    if (this._running) return;
    this._running = true;
    for (const job of this._jobs.values()) {
      this._startJob(job);
    }
    log.info("Scheduler started");
  }

  stop() {
    for (const interval of this._intervals.values()) {
      clearInterval(interval);
    }
    this._intervals.clear();
    this._running = false;
    log.info("Scheduler stopped");
  }

  getJobs(): ScheduledJob[] {
    return [...this._jobs.values()];
  }

  private _startJob(job: ScheduledJob) {
    const interval = setInterval(async () => {
      job.lastRun = new Date();
      job.nextRun = new Date(Date.now() + job.intervalMs);
      try {
        await job.callback();
      } catch (e) {
        log.error(`Job "${job.name}" failed: ${e}`);
      }
    }, job.intervalMs);
    this._intervals.set(job.id, interval);
  }
}
