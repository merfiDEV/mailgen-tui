import { EmailProvider } from "./base.js";
import { MailTMProvider } from "./mailtm.js";
import { TempMailProvider } from "./tempmail.js";

export const PROVIDERS: Record<string, new (prefix?: string) => EmailProvider> = {
  mailtm: MailTMProvider,
  tempmail: TempMailProvider,
};

export function getProvider(name: string, prefix = ""): EmailProvider {
  const cls = PROVIDERS[name];
  if (!cls) throw new Error(`Unknown provider: ${name}`);
  return new cls(prefix);
}

export type { EmailAccount, EmailMessage, EmailProvider } from "./base.js";
