import { Server } from '@hapi/hapi';
import run from '../../../src/server/run';
import create from '../../../src/server/create';
import start from '../../../src/server/start';
import plugins from '../../../src/server/plugins';
import { Util } from '@mojaloop/central-services-shared';
import Config from '../../../src/shared/config';

jest.mock('../../../src/server/create');
jest.mock('../../../src/server/start');
jest.mock('../../../src/server/plugins');
jest.mock('@mojaloop/central-services-shared');
jest.mock('../../../src/shared/config');

describe('run function', () => {
  const mockConfig = {
    ADMIN_PORT: 3001,
    FSP_PORT: 3002,
    REDIS: {
      connectionConfig: {}
    },
    CENTRAL_SHARED_ENDPOINT_CACHE_CONFIG: {
      "expiresIn": 180000,
      "generateTimeout": 30000,
      "getDecoratedValue": true
    },
    HUB_PARTICIPANT: {
      NAME: 'Hub'
    }
  };

  let mockAdminServer: Server;
  let mockFspServer: Server;

  beforeEach(() => {
    mockAdminServer = { info: { port: mockConfig.ADMIN_PORT } } as unknown as Server;
    mockFspServer = { info: { port: mockConfig.FSP_PORT } } as unknown as Server;

    (start as jest.Mock).mockResolvedValue(undefined);
    (plugins.registerAdmin as jest.Mock).mockResolvedValue(undefined);
    (plugins.registerFsp as jest.Mock).mockResolvedValue(undefined);
    (Util.Endpoints.initializeCache as jest.Mock).mockResolvedValue(undefined);
    (Util.Redis.RedisCache.prototype.connect as jest.Mock).mockResolvedValue(undefined);
    (Util.Redis.PubSub.prototype.connect as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize cache and connect to Redis', async () => {
    // @ts-ignore
    await run(mockConfig);

    expect(Util.Endpoints.initializeCache).toHaveBeenCalledWith(
      mockConfig.CENTRAL_SHARED_ENDPOINT_CACHE_CONFIG,
      {
        hubName: mockConfig.HUB_PARTICIPANT.NAME,
        hubNameRegex: Util.HeaderValidation.getHubNameRegex(mockConfig.HUB_PARTICIPANT.NAME)
      }
    );
    expect(Util.Redis.RedisCache.prototype.connect).toHaveBeenCalled();
    expect(Util.Redis.PubSub.prototype.connect).toHaveBeenCalled();
  });

  it('should create and start both admin and FSP servers', async () => {
    (create as jest.Mock).mockResolvedValue(mockAdminServer).mockResolvedValueOnce(mockAdminServer);
    (create as jest.Mock).mockResolvedValue(mockAdminServer).mockResolvedValueOnce(mockFspServer);
    // @ts-ignore
    const servers = await run(mockConfig);

    expect(create).toHaveBeenCalledTimes(2);
    expect(create).toHaveBeenCalledWith(
      { ...mockConfig, PORT: mockConfig.ADMIN_PORT },
      expect.objectContaining({ logger: expect.anything(), pubSub: expect.anything(), kvs: expect.anything() })
    );
    expect(create).toHaveBeenCalledWith(
      { ...mockConfig, PORT: mockConfig.FSP_PORT },
      expect.objectContaining({ logger: expect.anything(), pubSub: expect.anything(), kvs: expect.anything() })
    );

    expect(plugins.registerAdmin).toHaveBeenCalledWith(mockAdminServer);
    expect(plugins.registerFsp).toHaveBeenCalledWith(mockFspServer);

    expect(start).toHaveBeenCalledTimes(2);
    expect(start).toHaveBeenCalledWith(mockAdminServer);
    expect(start).toHaveBeenCalledWith(mockFspServer);

    expect(servers).toEqual([mockFspServer, mockAdminServer]);
  });

  it('should throw an error if server creation fails', async () => {
    (create as jest.Mock).mockRejectedValue(new Error('Server creation failed'));
    await expect(run(mockConfig as any)).rejects.toThrow('Server creation failed');
  });

  it('should throw an error if Redis connection fails', async () => {
    (Util.Redis.RedisCache.prototype.connect as jest.Mock).mockRejectedValue(new Error('Redis connection failed'));
    await expect(run(mockConfig as any)).rejects.toThrow('Redis connection failed');
  });
});
