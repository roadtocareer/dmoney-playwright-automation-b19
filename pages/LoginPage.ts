import { Page, Locator } from '@playwright/test';

export class LoginPage {
  private readonly loginLink: Locator;
  private readonly identifierInput: Locator;
  private readonly passwordInput: Locator;
  private readonly submitButton: Locator;
  private readonly otpInput: Locator;
  private readonly verifyOtpButton: Locator;

  constructor(private readonly page: Page) {
    this.loginLink = page.getByRole('link', { name: 'Login', exact: true }).first();
    this.identifierInput = page.getByPlaceholder('Enter email or phone number');
    this.passwordInput = page.locator('input[type="password"]');
    this.submitButton = page.getByRole('button', { name: /^Login/ });
    this.otpInput = page.getByLabel(/4-Digit OTP/);
    this.verifyOtpButton = page.getByRole('button', { name: /^Verify OTP/ });
  }

  async open() {
    await this.page.goto('/');
    await this.loginLink.click();
    await this.page.waitForURL('**/login');
  }

  async submitCredentials(identifier: string, password: string) {
    await this.identifierInput.fill(identifier);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async login(email: string, password: string) {
    await this.submitCredentials(email, password);
    await this.page.waitForURL('**/profile');
  }

  async submitOtp(otp: string) {
    await this.otpInput.fill(otp);
    await this.verifyOtpButton.click();
  }
}
