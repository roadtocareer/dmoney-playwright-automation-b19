import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { GmailClient } from '../utils/gmail';
import users from '../data/users.json';

test.use({ storageState: { cookies: [], origins: [] } });

test('Login as Agent with email OTP', async ({ page, request }) => {
  test.setTimeout(240_000);
  const loginPage = new LoginPage(page);
  await loginPage.open();

  const requestedAt = Date.now();
  await loginPage.submitCredentials(users.agent.phone_number, users.agent.password);

  const otp = await new GmailClient(request).waitForOtp(requestedAt);
  await loginPage.submitOtp(otp);

  await expect(page).not.toHaveURL(/\/login/);
});
