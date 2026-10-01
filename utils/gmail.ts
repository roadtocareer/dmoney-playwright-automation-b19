import { APIRequestContext, expect } from '@playwright/test';

process.loadEnvFile('.env');

const GMAIL_API = 'https://gmail.googleapis.com/gmail/v1/users/me/messages';

export class GmailClient {
  private readonly headers = { Authorization: `Bearer ${process.env.GMAIL_ACCESS_TOKEN}` };

  constructor(private readonly request: APIRequestContext) {}

  // Polls until an OTP mail received at/after `since` (epoch ms) arrives; older mails are ignored
  async waitForOtp(since: number, timeoutMs = 180_000, intervalMs = 3_000): Promise<string> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const otp = await this.findOtpSince(since);
      if (otp) return otp;
      await new Promise((r) => setTimeout(r, intervalMs));
    }
    throw new Error(`No new "Your Login OTP" mail received within ${timeoutMs / 1000}s`);
  }

  private async findOtpSince(since: number): Promise<string | null> {
    const listRes = await this.request.get(GMAIL_API, {
      headers: this.headers,
      params: { q: 'subject:"Your Login OTP"', maxResults: 5 },
    });
    expect(listRes.status(), await listRes.text()).toBe(200);
    const { messages = [] } = await listRes.json();

    for (const { id } of messages) {
      const readRes = await this.request.get(`${GMAIL_API}/${id}`, { headers: this.headers });
      expect(readRes.status(), await readRes.text()).toBe(200);
      const mail = await readRes.json();
      if (Number(mail.internalDate) < since) return null; // newest first, so the rest are older too
      const otp = this.extractOtp(mail.snippet);
      if (otp) return otp;
    }
    return null;
  }

  extractOtp(snippet: string): string | null {
    return snippet.match(/\b\d{4}\b/)?.[0] ?? null;
  }
}
