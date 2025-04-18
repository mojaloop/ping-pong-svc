import { Server } from '@hapi/hapi';
import openApi from '../../../../src/server/plugins/openAPI';
import Path from 'path';
import { HealthCheck, Util } from '@mojaloop/central-services-shared';

jest.mock('@mojaloop/central-services-shared', () => ({
  Util: {
    OpenapiBackend: {
      initialise: jest.fn()
    }
  },
  HealthCheck: {
    HealthCheck: jest.fn().mockImplementation(() => ({
      getHealth: jest.fn().mockResolvedValue({ status: 'ok' })
    }))
  }
}));

describe('openAPI plugin', () => {
  let server: Server;

  beforeEach(() => {
    server = new Server();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize the plugin with correct options', async () => {
    const mockHandlers = {};
    const mockApiPath = Path.resolve(__dirname, '../../../../src/interface/api.yaml');
    const mockOpenapiInstance = { mock: 'openapiInstance' };

    (Util.OpenapiBackend.initialise as jest.Mock).mockResolvedValue(mockOpenapiInstance);

    const plugin = await openApi.initialize()

    expect(Util.OpenapiBackend.initialise).toHaveBeenCalledWith(mockApiPath, expect.anything());
    // @ts-ignore
    expect(plugin.plugin.name).toBe('openapi');
    // @ts-ignore
    expect(plugin.plugin.version).toBe('1.0.0');
    // @ts-ignore
    expect(plugin.plugin.multiple).toBe(true);
    expect(plugin.options.openapi).toBe(mockOpenapiInstance);
  });

  it('should throw an error if OpenapiBackend initialization fails', async () => {
    (Util.OpenapiBackend.initialise as jest.Mock).mockRejectedValue(new Error('Initialization failed'));
    await expect(openApi.initialize()).rejects.toThrow('Initialization failed');
  });
});
