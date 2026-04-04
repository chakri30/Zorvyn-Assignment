const request = require('supertest');
const { app } = require('../server');

describe('Auth Endpoints', () => {
  it('should register a new user', async () => {
    // Use timestamp to make email unique
    const timestamp = Date.now();
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: `test${timestamp}@example.com`,
        password: 'password123',
        name: 'Test User'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('user');
  });
});