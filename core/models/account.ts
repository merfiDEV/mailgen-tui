export interface Account {
  id?: number;
  email: string;
  password: string;
  provider: string;
  token?: string;
  accountId?: string;
  firstName: string;
  lastName: string;
  status: "active" | "inactive" | "deleted";
  createdAt: Date;
  lastChecked?: Date;
  notes: string;
}

export function createAccount(overrides: Partial<Account> = {}): Account {
  return {
    email: "",
    password: "",
    provider: "",
    firstName: "",
    lastName: "",
    status: "active",
    createdAt: new Date(),
    notes: "",
    ...overrides,
  };
}
