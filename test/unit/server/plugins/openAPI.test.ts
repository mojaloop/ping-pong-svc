import { Server } from '@hapi/hapi';
import initialize from '../../../../src/server/plugins/openAPI';
import Path from 'path';
import { Util } from '@mojaloop/central-services-shared';

jest.mock('@mojaloop/central-services-shared', () => ({
  Util: {
    OpenapiBackend: {
      initialise: jest.fn()
    }
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

    const plugin = await initialize();

    expect(Util.OpenapiBackend.initialise).toHaveBeenCalledWith(mockApiPath, mockHandlers);
    expect(plugin.plugin.name).toBe('openapi');
    expect(plugin.plugin.version).toBe('1.0.0');
    expect(plugin.plugin.multiple).toBe(true);
    expect(plugin.options.openapi).toBe(mockOpenapiInstance);
  });

  it('should expose the openapi instance to the server', async () => {
    const mockOpenapiInstance = { mock: 'openapiInstance' };

    (Util.OpenapiBackend.initialise as jest.Mock).mockResolvedValue(mockOpenapiInstance);

    const plugin = await initialize();
    await plugin.plugin.register(server, plugin.options);
    // @ts-ignore
    expect(server.plugins.openapi).toBeDefined();
    // @ts-ignore
    expect(server.plugins.openapi).toBe(mockOpenapiInstance);
  });

  it('should throw an error if OpenapiBackend initialization fails', async () => {
    (Util.OpenapiBackend.initialise as jest.Mock).mockRejectedValue(new Error('Initialization failed'));

    await expect(initialize()).rejects.toThrow('Initialization failed');
  });
});
