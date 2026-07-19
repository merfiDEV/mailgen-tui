export interface EmailAccount {
  email: string;
  password: string;
  provider: string;
  token?: string;
  accountId?: string;
}

export interface EmailMessage {
  id: string;
  subject: string;
  fromAddr: string;
  text: string;
  html: string;
}

export interface EmailProvider {
  createAccount(): Promise<EmailAccount>;
  getMessages(account: EmailAccount): Promise<EmailMessage[]>;
  deleteAccount(account: EmailAccount): Promise<boolean>;
  getProviderName(): string;
}
