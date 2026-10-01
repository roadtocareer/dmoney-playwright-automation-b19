import { test, expect } from '@playwright/test';

const BASE_URL = 'https://dmoney.roadtocareer.net';

test.describe.configure({ mode: 'serial' });

test.describe('DMoney API - Admin', () => {
  let token: string;
  let firstUserId: number;

  test('Admin can login', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/user/login`, {
      headers: { 'Content-Type': 'application/json' },
      data: {
        email: 'admin@dmoney.com',
        password: '1234',
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.message).toBe('Login successful');
    expect(body.token).toBeTruthy();

    token = body.token;
  });

  test('Admin can view user list', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/user/list?page=1&count=5`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.message).toBe('User list');
    expect(body.users.length).toBeGreaterThan(0);

    firstUserId = body.users[0].id;
  });

  test('Admin can search user by id', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/user/search/id/${firstUserId}`, {
      headers: { Authorization: `bearer ${token}` },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(JSON.stringify(body)).toContain(String(firstUserId));
  });
});
