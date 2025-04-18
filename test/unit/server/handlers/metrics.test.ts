import Metrics from '@mojaloop/central-services-metrics';
import { Request, ResponseToolkit } from '@hapi/hapi';
import MetricsHandler from '../../../../src/server/handlers/metrics';

jest.mock('@mojaloop/central-services-metrics');

describe('MetricsHandler', () => {
  let mockResponseToolkit: ResponseToolkit;
  let code = jest.fn();

  const mockContext = {
    method: 'GET',
    path: '/metrics',
    body: {},
    query: {},
    headers: {},
  };

  beforeEach(() => {
    mockResponseToolkit = {
      response: jest.fn().mockReturnValue({
        code
      }),
    } as unknown as ResponseToolkit;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should return metrics with a 200 status code', async () => {
      const mockMetrics = 'mocked_metrics';
      (Metrics.getMetricsForPrometheus as jest.Mock).mockResolvedValue(mockMetrics);

      const response = await MetricsHandler.get(mockContext, {} as Request, mockResponseToolkit);

      expect(Metrics.getMetricsForPrometheus).toHaveBeenCalledTimes(1);
      expect(mockResponseToolkit.response).toHaveBeenCalledWith(mockMetrics);
      expect(code).toHaveBeenCalledWith(200);
    });

    it('should handle errors thrown by Metrics.getMetricsForPrometheus', async () => {
      const mockError = new Error('Metrics error');
      (Metrics.getMetricsForPrometheus as jest.Mock).mockRejectedValue(mockError);

      await expect(MetricsHandler.get(mockContext, {} as Request, mockResponseToolkit)).rejects.toThrow('Metrics error');
      expect(Metrics.getMetricsForPrometheus).toHaveBeenCalledTimes(1);
    });
  });
});
