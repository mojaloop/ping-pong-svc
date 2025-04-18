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

import create from '../../../src/server/create';
import { ServiceConfig } from '../../../src/shared/config';
import { PingPongServiceDeps } from '../../../src/shared/types';


describe('create server', () => {
  // @ts-ignore
  const mockConfig: ServiceConfig = {
    HOST: 'localhost',
    PORT: 3000,
  };

  jest.mock('@hapi/hapi', () => {
    const actualHapi = jest.requireActual('@hapi/hapi');
    return {
      ...actualHapi,
      Server: jest.fn(() => ({
        settings: { host: mockConfig.HOST, port: mockConfig.PORT },
        app: {},
      })),
    };
  });


  const mockDeps: PingPongServiceDeps = {
    // @ts-ignore
    logger: {
      info: jest.fn(),
      error: jest.fn(),
    },
    // @ts-ignore
    pubSub: {
      publish: jest.fn(),
      subscribe: jest.fn(),
    },
    // @ts-ignore
    kvs: {
      get: jest.fn(),
      set: jest.fn(),
    },
  };

  it('should create a server instance with the correct configuration', async () => {

    const server = await create(mockConfig, mockDeps);
    expect(server.settings.host).toBe(mockConfig.HOST);
    expect(server.settings.port).toBe(mockConfig.PORT);
  });

  it('should attach dependencies to the server app', async () => {
    const server = await create(mockConfig, mockDeps);
    expect(server.app.pubSub).toBe(mockDeps.pubSub);
    expect(server.app.kvs).toBe(mockDeps.kvs);
    expect(server.app.logger).toBe(mockDeps.logger);
  });

  it('should throw an error if server creation fails', async () => {
    // @ts-ignore
    const invalidConfig: ServiceConfig = {
      HOST: '',
      PORT: NaN,
    };

    await expect(create(invalidConfig, mockDeps)).rejects.toThrow();
  });
});
