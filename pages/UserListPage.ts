import { Page, Locator, expect } from '@playwright/test';

export class UserListPage {
  private readonly userListMenu: Locator;
  private readonly searchTypeSelect: Locator;
  private readonly roleSelect: Locator;
  private readonly searchButton: Locator;
  private readonly firstRow: Locator;

  constructor(private readonly page: Page) {
    this.userListMenu = page.getByRole('link', { name: 'User List' });
    this.searchTypeSelect = page.getByRole('combobox').first();
    this.roleSelect = page.getByRole('combobox').nth(1);
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.firstRow = page.locator('tbody tr').first();
  }

  async openUserList() {
    await this.userListMenu.click();
    await this.page.waitForURL('**/admin/users');
  }

  async filterByRole(role: string) {
    await this.searchTypeSelect.click();
    await this.page.getByRole('option', { name: 'Search by Role' }).click();
    await this.roleSelect.click();
    await this.page.getByRole('option', { name: role, exact: true }).click();
    await this.searchButton.click();
  }

  async expectFirstRowRole(role: string) {
    // Role is the 6th column; the app renders it lowercase
    await expect(this.firstRow.locator('td').nth(5)).toHaveText(new RegExp(`^${role}$`, 'i'));
  }
}
