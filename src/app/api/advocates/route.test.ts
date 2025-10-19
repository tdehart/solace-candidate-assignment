import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

// Mock the database
vi.mock('../../../db', () => ({
  default: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([
      {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        city: 'New York',
        degree: 'MD',
        specialties: ['cardiology'],
        yearsOfExperience: 10,
        phoneNumber: 1234567890,
        createdAt: new Date(),
      },
    ]),
  },
}));

vi.mock('../../../db/schema', () => ({
  advocates: {},
}));

vi.mock('../../../lib/cursor', () => ({
  encodeCursor: vi.fn(() => 'mock-cursor-token'),
  decodeCursor: vi.fn(() => null),
  hashFilters: vi.fn(() => 'mock-hash'),
}));

describe('GET /api/advocates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return advocates data with valid request', async () => {
    const request = new Request('http://localhost:3000/api/advocates');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('pageInfo');
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBeGreaterThan(0);
    expect(data.pageInfo).toHaveProperty('nextCursor');
    expect(data.pageInfo).toHaveProperty('hasNext');
  });

  it('should return 400 for invalid query parameters', async () => {
    // Invalid limit (> 100)
    const request = new Request('http://localhost:3000/api/advocates?limit=150');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Invalid query parameters');
  });

  it('should return 400 for invalid degree parameter', async () => {
    // Invalid degree value
    const request = new Request('http://localhost:3000/api/advocates?degree=INVALID');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Invalid query parameters');
  });

  it('should accept valid query parameters', async () => {
    const request = new Request(
      'http://localhost:3000/api/advocates?limit=10&degree=MD&minExp=5&sort=years_desc'
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
  });
});
