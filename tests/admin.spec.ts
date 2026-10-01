import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { UserListPage } from '../pages/UserListPage';
import users from '../data/users.json';

test.describe.configure({ mode: 'serial' });

test.describe('Admin', () => {
  test.describe('unauthenticated', () => {
    // auth.json (from config) doesn't exist until this test creates it
    test.use({ storageState: { cookies: [], origins: [] } });

    test('Login as Admin', async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.open();
      await loginPage.login(users.admin.email, users.admin.password);
      await expect(page).toHaveURL(/\/profile/);
      await page.context().storageState({ path: 'auth.json' });
    });
  });

  test('Filter agents from user list', async ({ page }) => {
    await page.goto('/profile');
    const userListPage = new UserListPage(page);
    await userListPage.openUserList();
    await userListPage.filterByRole('Agent');
    await userListPage.expectFirstRowRole('Agent');
  });
});
