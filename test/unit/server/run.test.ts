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
    PORT: 3001,
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

  let mockServer: Server;

  beforeEach(() => {
    mockServer = { info: { port: mockConfig.PORT } } as unknown as Server;

    (start as jest.Mock).mockResolvedValue(undefined);
    (plugins.register as jest.Mock).mockResolvedValue(undefined);
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

  it('should create and start the server', async () => {
    (create as jest.Mock).mockResolvedValue(mockServer);
    // @ts-ignore
    const server = await run(mockConfig);

    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith(
      { ...mockConfig, PORT: mockConfig.PORT },
      expect.objectContaining({ logger: expect.anything(), pubSub: expect.anything(), kvs: expect.anything() })
    );

    expect(plugins.register).toHaveBeenCalledWith(mockServer);

    expect(start).toHaveBeenCalledTimes(1);
    expect(start).toHaveBeenCalledWith(mockServer);

    expect(server).toEqual(mockServer);
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
