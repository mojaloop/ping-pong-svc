import { Request, ResponseObject, ResponseToolkit } from '@hapi/hapi';
import healthHandler from '../../../../src/server/handlers/health';

jest.mock('@mojaloop/central-services-shared', () => ({
  HealthCheck: {
    HealthCheck: jest.fn().mockImplementation(() => ({
      getHealth: jest.fn().mockResolvedValue({
        status: 'OK',
        uptime: 12345,
        version: '1.0.0',
        name: 'ping-pong-svc',
      }),
    })),
  },
}));

describe('Health Handler', () => {
  let mockResponseToolkit: ResponseToolkit;
  const mockContext = {
    method: 'GET',
    path: '/health',
    body: {},
    query: {},
    headers: {},
  };

  const h: Record<string, unknown> = {
    response: (): ResponseObject => {
      return {
        code: (num: number): ResponseObject => {
          return {
            statusCode: num
          } as unknown as ResponseObject
        }
      } as unknown as ResponseObject
    }
  }

  beforeEach(() => {
    mockResponseToolkit = {
      response: jest.fn().mockReturnValue({
        code: jest.fn(),
      }),
    } as unknown as ResponseToolkit;
  });

  it('should return health status with HTTP 200', async () => {
    // @ts-ignore
    const response = await healthHandler.get(mockContext, {} as Request, h);
    expect(response.statusCode).toBe(200);
  });
});
