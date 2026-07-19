import { EmailProvider, EmailAccount, EmailMessage } from "./base.js";
import { getLogger } from "../utils/logger.js";

const log = getLogger("GuerrillaMail");

export class TempMailProvider implements EmailProvider {
  private static API_BASE = "https://api.guerrillamail.com/ajax.php";

  async createAccount(): Promise<EmailAccount> {
    log.info("Requesting new email from Guerrilla Mail");
    const params = new URLSearchParams({ f: "get_email_address", ip: "127.0.0.1", agent: "gen_v1" });
    const resp = await fetch(`${TempMailProvider.API_BASE}?${params}`);
    if (!resp.ok) throw new Error("Failed to get email from Guerrilla Mail");
    const data = await resp.json();

    const email = data.email_addr || "";
    const sidToken = data.sid_token || "";
    const alias = data.alias || "";

    if (!email) throw new Error("Failed to get email from Guerrilla Mail");
    log.info(`Got email: ${email}`);

    return { email, password: sidToken, provider: "tempmail", token: sidToken, accountId: alias };
  }

  async getMessages(account: EmailAccount): Promise<EmailMessage[]> {
    if (!account.token) return [];
    try {
      const params = new URLSearchParams({ f: "fetch_email", sid_token: account.token });
      const resp = await fetch(`${TempMailProvider.API_BASE}?${params}`);
      if (resp.status !== 200) return [];
      const data = await resp.json();
      return (data.list || []).map((item: any) => ({
        id: String(item.mail_id || ""),
        subject: item.mail_subject || "",
        fromAddr: item.mail_from || "",
        text: item.mail_text || "",
        html: item.mail_html || "",
      }));
    } catch (e) {
      log.error(`Error fetching messages: ${e}`);
      return [];
    }
  }

  async deleteAccount(account: EmailAccount): Promise<boolean> {
    if (account.token) {
      try {
        const params = new URLSearchParams({ f: "forget_me", sid_token: account.token });
        await fetch(`${TempMailProvider.API_BASE}?${params}`);
      } catch {
        // ignore
      }
    }
    return true;
  }

  getProviderName(): string {
    return "tempmail";
  }
}
