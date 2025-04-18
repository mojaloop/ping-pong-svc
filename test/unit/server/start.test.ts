import { Server } from '@hapi/hapi';
import start from '../../../src/server/start';

describe('start function', () => {
  let mockServer: Server;

  beforeEach(() => {
    mockServer = {
      start: jest.fn().mockResolvedValue(undefined),
      app: {
        logger: {
          info: jest.fn(),
        },
      },
      info: {
        uri: 'http://localhost:3000',
      },
    } as unknown as Server;
  });

  it('should start the server', async () => {
    await start(mockServer);
    expect(mockServer.start).toHaveBeenCalled();
  });

  it('should return the server instance', async () => {
    const result = await start(mockServer);
    expect(result).toBe(mockServer);
  });

  it('should throw an error if server start fails', async () => {
    mockServer.start = jest.fn().mockRejectedValue(new Error('Server start failed'));
    await expect(start(mockServer)).rejects.toThrow('Server start failed');
  });
});
