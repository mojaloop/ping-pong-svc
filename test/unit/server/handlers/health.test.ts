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

import { Request, ResponseObject, ResponseToolkit } from '@hapi/hapi';
import healthHandler from '../../../../src/server/handlers/health';

jest.mock('@mojaloop/central-services-shared', () => ({
  HealthCheck: {
    HealthCheck: jest.fn().mockImplementation(() => ({
      getHealth: jest.fn().mockResolvedValue({
        status: 'OK',
        uptime: 12345,
        version: '1.0.0',
        name: 'ping-pong-svc',
      }),
    })),
  },
}));

describe('Health Handler', () => {
  let mockResponseToolkit: ResponseToolkit;
  const mockContext = {
    method: 'GET',
    path: '/health',
    body: {},
    query: {},
    headers: {},
  };

  const h: Record<string, unknown> = {
    response: (): ResponseObject => {
      return {
        code: (num: number): ResponseObject => {
          return {
            statusCode: num
          } as unknown as ResponseObject
        }
      } as unknown as ResponseObject
    }
  }

  beforeEach(() => {
    mockResponseToolkit = {
      response: jest.fn().mockReturnValue({
        code: jest.fn(),
      }),
    } as unknown as ResponseToolkit;
  });

  it('should return health status with HTTP 200', async () => {
    // @ts-ignore
    const response = await healthHandler.get(mockContext, {} as Request, h);
    expect(response.statusCode).toBe(200);
  });
});
