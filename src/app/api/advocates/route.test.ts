import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

const {
  limitMock,
  dbMock,
  encodeCursorMock,
  decodeCursorMock,
  hashFiltersMock,
} = vi.hoisted(() => {
  const limit = vi.fn();
  const db: any = {};

  db.select = vi.fn(() => db);
  db.from = vi.fn(() => db);
  db.where = vi.fn(() => db);
  db.orderBy = vi.fn(() => db);
  db.limit = limit;

  const encodeCursor = vi.fn(() => 'mock-cursor-token');
  const decodeCursor = vi.fn(() => null);
  const hashFilters = vi.fn(() => 'mock-hash');

  return {
    limitMock: limit,
    dbMock: db,
    encodeCursorMock: encodeCursor,
    decodeCursorMock: decodeCursor,
    hashFiltersMock: hashFilters,
  };
});

vi.mock('../../../db', () => ({
  default: dbMock,
}));

vi.mock('../../../db/schema', () => ({
  advocates: {},
}));

vi.mock('../../../lib/cursor', () => ({
  encodeCursor: encodeCursorMock,
  decodeCursor: decodeCursorMock,
  hashFilters: hashFiltersMock,
}));

describe('GET /api/advocates', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    limitMock.mockResolvedValue([
      {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        city: 'New York',
        degree: 'MD',
        specialties: ['cardiology'],
        yearsOfExperience: 10,
        phoneNumber: 1234567890,
      },
    ]);
    encodeCursorMock.mockReturnValue('mock-cursor-token');
    decodeCursorMock.mockReturnValue(null);
    hashFiltersMock.mockReturnValue('mock-hash');
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

  it('should accept city filter parameter', async () => {
    const request = new Request('http://localhost:3000/api/advocates?city=San');
    const response = await GET(request);

    expect(response.status).toBe(200);
  });

  it('should accept search query parameter', async () => {
    const request = new Request('http://localhost:3000/api/advocates?q=weight');
    const response = await GET(request);

    expect(response.status).toBe(200);
  });

  it('should accept multiple filter parameters together', async () => {
    const request = new Request(
      'http://localhost:3000/api/advocates?q=mental&city=New&degree=PhD&minExp=10&sort=name_asc'
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
  });

  it('should return next cursor when more results exist for keyset pagination', async () => {
    const mockRecords = Array.from({ length: 21 }, (_, index) => ({
      id: index + 1,
      firstName: `Advocate ${index + 1}`,
      lastName: `Clinician${index + 1}`,
      city: 'New York',
      degree: 'MD',
      specialties: ['cardiology'],
      yearsOfExperience: 50 - index,
      phoneNumber: 5550000000 + index,
    }));

    limitMock.mockResolvedValueOnce(mockRecords);

    const request = new Request('http://localhost:3000/api/advocates?limit=20&sort=years_desc');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(limitMock).toHaveBeenCalledWith(21);
    expect(body.data).toHaveLength(20);
    expect(body.pageInfo.hasNext).toBe(true);
    expect(body.pageInfo.nextCursor).toBe('mock-cursor-token');

    const expectedLastItem = mockRecords[19];
    expect(encodeCursorMock).toHaveBeenCalledWith({
      sort: 'years_desc',
      keys: {
        id: expectedLastItem.id,
        years: expectedLastItem.yearsOfExperience,
        lastName: expectedLastItem.lastName,
      },
      filtersHash: 'mock-hash',
    });
  });
});
