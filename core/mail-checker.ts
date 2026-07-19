import { EmailProvider, EmailAccount, EmailMessage } from "./providers/base.js";
import { getLogger } from "./utils/logger.js";

const log = getLogger("MailChecker");

export async function waitForConfirmation(
  provider: EmailProvider,
  account: EmailAccount,
  timeoutMs = 90_000,
): Promise<EmailMessage | null> {
  log.info(`Waiting for confirmation email for ${account.email} (timeout=${timeoutMs}ms)`);
  const start = Date.now();
  const keywords = ["confirm", "verify", "activate", "welcome", "registration"];

  while (Date.now() - start < timeoutMs) {
    try {
      const messages = await provider.getMessages(account);
      for (const msg of messages) {
        const subjectLower = msg.subject.toLowerCase();
        if (keywords.some((kw) => subjectLower.includes(kw))) {
          log.info(`Found confirmation email: ${msg.subject}`);
          return msg;
        }
      }
    } catch (e) {
      log.warn(`Error checking mail: ${e}`);
    }
    await sleep(3000);
  }

  log.warn(`Timeout reached (${timeoutMs}ms)`);
  return null;
}

export function extractConfirmationLink(message: EmailMessage): string | null {
  const text = message.html || message.text;
  const patterns = [
    /https?:\/\/[^\s"']*(?:confirm|verify|activate|welcome|auth)[^\s"']*/gi,
    /https?:\/\/[^\s"']+/gi,
  ];

  const confirmKeywords = ["confirm", "verify", "activate", "auth", "welcome", "signup"];

  for (const pattern of patterns) {
    const matches = text.match(pattern) || [];
    for (const url of matches) {
      if (confirmKeywords.some((kw) => url.toLowerCase().includes(kw))) {
        return url;
      }
    }
    if (matches.length > 0) return matches[0] ?? null;
  }

  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
