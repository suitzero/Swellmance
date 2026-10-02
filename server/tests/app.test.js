const request = require('supertest');

// Mock PrismaClient to prevent actual DB connection
jest.mock('../generated/prisma', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => {
      return {
        user: {
          findUnique: jest.fn(),
          create: jest.fn(),
          findMany: jest.fn(),
          update: jest.fn(),
        },
        surfSpot: {
          create: jest.fn(),
          findMany: jest.fn(),
        },
      };
    })
  };
}, { virtual: true });

const app = require('../index');

describe('Smoke tests for DB-free routes', () => {
  it('GET / should return 200 and a welcome message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual('Hello from the Swellmance backend!');
  });
});
