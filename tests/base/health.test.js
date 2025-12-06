const request = require('supertest');
const app = require('../../server/index');

describe('Health Check API', () => {
  test('GET /api/health should return 200', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);
    
    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
  });

  test('GET /api/health should have correct structure', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);
    
    expect(response.body).toEqual(
      expect.objectContaining({
        status: expect.any(String),
        timestamp: expect.any(String),
        uptime: expect.any(Number)
      })
    );
  });
});

describe('Basic API Structure', () => {
  test('Server should start without errors', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);
    
    expect(response.body.status).toBe('OK');
  });

  test('Non-existent routes should return 404', async () => {
    await request(app)
      .get('/api/non-existent')
      .expect(404);
  });
});
