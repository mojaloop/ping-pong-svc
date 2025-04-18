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
    expect(server).toBeInstanceOf(Server);
    expect(server.settings.host).toBe(mockConfig.HOST);
    expect(server.settings.port).toBe(mockConfig.PORT);
  });

  it('should attach dependencies to the server app', async () => {
    const server = await create(mockConfig, mockDeps);
    expect(server.app.pubSub).toBe(mockDeps.pubSub);
    expect(server.app.kvs).toBe(mockDeps.kvs);
    expect(server.app.logger).toBe(mockDeps.logger);
  });

  it('should call onValidateFail when validation fails', async () => {
    const mockError = new Error('Validation failed');
    const mockOnValidateFail = jest.fn();
    jest.mock('../../../src/server/handlers/onValidateFail', () => ({
      __esModule: true,
      default: mockOnValidateFail,
    }));

    const server = await create(mockConfig, mockDeps);
    const failAction = server.settings.routes?.validate?.failAction;

    if (failAction) {
      // @ts-ignore
      await failAction({} as any, {} as any, mockError);
      expect(mockOnValidateFail).toHaveBeenCalledWith(mockDeps.logger, mockError);
    }
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
