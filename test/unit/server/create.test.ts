import { Server } from '@hapi/hapi';
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
