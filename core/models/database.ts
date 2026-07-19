import fs from "fs";
import path from "path";
import { Account } from "./account.js";
import { Registration } from "./registration.js";

const DATA_DIR = "data";

export class Database {
  private _accountsFile: string;
  private _registrationsFile: string;
  private _accounts: Account[] = [];
  private _registrations: Registration[] = [];
  private _nextAccId = 1;
  private _nextRegId = 1;

  constructor() {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    this._accountsFile = path.join(DATA_DIR, "accounts.json");
    this._registrationsFile = path.join(DATA_DIR, "registrations.json");
    this._load();
  }

  private _load() {
    this._accounts = [];
    this._registrations = [];

    if (fs.existsSync(this._accountsFile)) {
      try {
        const raw = fs.readFileSync(this._accountsFile, "utf-8");
        const data = JSON.parse(raw);
        this._accounts = (data.accounts || []).map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          lastChecked: item.lastChecked ? new Date(item.lastChecked) : undefined,
        }));
      } catch {
        this._accounts = [];
      }
    }

    if (fs.existsSync(this._registrationsFile)) {
      try {
        const raw = fs.readFileSync(this._registrationsFile, "utf-8");
        const data = JSON.parse(raw);
        this._registrations = (data.registrations || []).map((item: any) => ({
          ...item,
          registeredAt: new Date(item.registeredAt),
          trialEnds: item.trialEnds ? new Date(item.trialEnds) : undefined,
          lastChecked: item.lastChecked ? new Date(item.lastChecked) : undefined,
        }));
      } catch {
        this._registrations = [];
      }
    }

    this._nextAccId =
      Math.max(0, ...this._accounts.map((a) => a.id ?? 0)) + 1;
    this._nextRegId =
      Math.max(0, ...this._registrations.map((r) => r.id ?? 0)) + 1;
  }

  private _saveAccounts() {
    const data = { accounts: this._accounts };
    fs.writeFileSync(this._accountsFile, JSON.stringify(data, null, 2), "utf-8");
  }

  private _saveRegistrations() {
    const data = { registrations: this._registrations };
    fs.writeFileSync(this._registrationsFile, JSON.stringify(data, null, 2), "utf-8");
  }

  addAccount(account: Account): number {
    account.id = this._nextAccId++;
    this._accounts.push(account);
    this._saveAccounts();
    return account.id!;
  }

  getAllAccounts(): Account[] {
    return [...this._accounts];
  }

  getAccountByEmail(email: string): Account | undefined {
    return this._accounts.find((a) => a.email === email);
  }

  getActiveAccounts(): Account[] {
    return this._accounts.filter((a) => a.status === "active");
  }

  updateAccount(account: Account) {
    const idx = this._accounts.findIndex((a) => a.id === account.id);
    if (idx !== -1) {
      this._accounts[idx] = account;
      this._saveAccounts();
    }
  }

  deleteAccount(accountId: number) {
    this._accounts = this._accounts.filter((a) => a.id !== accountId);
    this._saveAccounts();
  }

  addRegistration(reg: Registration): number {
    reg.id = this._nextRegId++;
    this._registrations.push(reg);
    this._saveRegistrations();
    return reg.id!;
  }

  getAllRegistrations(): Registration[] {
    return [...this._registrations];
  }

  getRegistrationsByEmail(email: string): Registration[] {
    return this._registrations.filter((r) => r.accountEmail === email);
  }

  getActiveRegistrations(): Registration[] {
    return this._registrations.filter((r) => r.status === "active");
  }

  updateRegistration(reg: Registration) {
    const idx = this._registrations.findIndex((r) => r.id === reg.id);
    if (idx !== -1) {
      this._registrations[idx] = reg;
      this._saveRegistrations();
    }
  }

  deleteRegistration(regId: number) {
    this._registrations = this._registrations.filter((r) => r.id !== regId);
    this._saveRegistrations();
  }

  getAccountsCount(): number {
    return this._accounts.length;
  }

  exportToFile(filepath: string) {
    const data = {
      accounts: this._accounts,
      registrations: this._registrations,
    };
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), "utf-8");
  }

  importFromFile(filepath: string): { accounts: number; registrations: number } {
    const raw = fs.readFileSync(filepath, "utf-8");
    const data = JSON.parse(raw);

    let accCount = 0;
    for (const item of data.accounts || []) {
      this.addAccount({
        ...item,
        createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
      });
      accCount++;
    }

    let regCount = 0;
    for (const item of data.registrations || []) {
      this.addRegistration({
        ...item,
        registeredAt: item.registeredAt ? new Date(item.registeredAt) : new Date(),
        trialEnds: item.trialEnds ? new Date(item.trialEnds) : undefined,
      });
      regCount++;
    }

    return { accounts: accCount, registrations: regCount };
  }
}
