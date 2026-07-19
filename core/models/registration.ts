export interface Registration {
  id?: number;
  accountEmail: string;
  siteUrl: string;
  siteName: string;
  registeredAt: Date;
  status: "active" | "expired" | "deleted";
  trialEnds?: Date;
  lastChecked?: Date;
  notes: string;
}

export function createRegistration(overrides: Partial<Registration> = {}): Registration {
  return {
    accountEmail: "",
    siteUrl: "",
    siteName: "",
    registeredAt: new Date(),
    status: "active",
    notes: "",
    ...overrides,
  };
}
