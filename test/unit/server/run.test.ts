/*****
 License
 --------------
 Copyright © 2020-2025 Mojaloop Foundation
 The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Mojaloop Foundation for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.

 * Mojaloop Foundation
 - Name Surname <name.surname@mojaloop.io>

 - Kevin Leyow <kevin.leyow@infitx.com>
 --------------
 ******/

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
