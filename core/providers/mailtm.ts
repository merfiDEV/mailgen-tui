import { EmailProvider, EmailAccount, EmailMessage } from "./base.js";
import { generatePassword, generateUsername } from "../utils/validators.js";
import { getLogger } from "../utils/logger.js";

const log = getLogger("MailTM");

export class MailTMProvider implements EmailProvider {
  private static API_BASE = "https://api.mail.tm";
  private _usernamePrefix: string;

  constructor(usernamePrefix = "") {
    this._usernamePrefix = usernamePrefix;
  }

  async createAccount(): Promise<EmailAccount> {
    const domains = await this._getDomains();
    if (!domains.length) throw new Error("No active domains available from Mail.tm");
    const domain = domains[0];
    const password = generatePassword(16);

    for (let attempt = 0; attempt < 5; attempt++) {
      const name = generateUsername(this._usernamePrefix);
      const email = `${name}@${domain}`;
      log.info(`Creating account (attempt ${attempt + 1}): ${email}`);

      const resp = await fetch(`${MailTMProvider.API_BASE}/accounts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: email, password }),
      });

      if (resp.status === 201) {
        log.info(`Account created: ${email}`);
        const data = await resp.json();
        const token = await this._getToken(email, password);
        return {
          email,
          password,
          provider: "mailtm",
          token,
          accountId: data.id || "",
        };
      }

      if (resp.status === 429) {
        const wait = 2 * (attempt + 1);
        log.warn(`Rate limited, waiting ${wait}s...`);
        await this._sleep(wait * 1000);
        continue;
      }

      if (resp.status !== 422) {
        throw new Error(`Mail.tm API error: ${resp.status}`);
      }
    }

    throw new Error("Failed to create account after 5 attempts");
  }

  async getMessages(account: EmailAccount): Promise<EmailMessage[]> {
    if (!account.token) return [];

    const resp = await fetch(`${MailTMProvider.API_BASE}/messages`, {
      headers: { Authorization: `Bearer ${account.token}` },
    });

    if (resp.status !== 200) return [];
    const list = await resp.json();
    const messages: EmailMessage[] = [];

    for (const item of list) {
      const msgResp = await fetch(`${MailTMProvider.API_BASE}/messages/${item.id}`, {
        headers: { Authorization: `Bearer ${account.token}` },
      });
      if (msgResp.status === 200) {
        const d = await msgResp.json();
        messages.push({
          id: d.id,
          subject: d.subject || "",
          fromAddr: d.from?.address || "",
          text: d.text || "",
          html: d.html || "",
        });
      }
    }

    return messages;
  }

  async deleteAccount(account: EmailAccount): Promise<boolean> {
    if (!account.token || !account.accountId) return false;
    try {
      const resp = await fetch(`${MailTMProvider.API_BASE}/accounts/${account.accountId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${account.token}` },
      });
      return resp.status === 204;
    } catch {
      return false;
    }
  }

  getProviderName(): string {
    return "mailtm";
  }

  private async _getDomains(): Promise<string[]> {
    const resp = await fetch(`${MailTMProvider.API_BASE}/domains`);
    if (!resp.ok) throw new Error("Failed to fetch domains");
    const data = await resp.json();
    return data.filter((d: any) => d.isActive).map((d: any) => d.domain);
  }

  private async _getToken(email: string, password: string): Promise<string> {
    for (let attempt = 0; attempt < 3; attempt++) {
      const resp = await fetch(`${MailTMProvider.API_BASE}/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: email, password }),
      });
      if (resp.status === 200) {
        const data = await resp.json();
        return data.token;
      }
      await this._sleep(2000);
    }
    throw new Error("Failed to get token after 3 attempts");
  }

  private _sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
