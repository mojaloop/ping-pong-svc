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

import { Request, ResponseToolkit } from '@hapi/hapi'
import { post } from '~/server/handlers/ping'
import { create } from '~/models/outbound/pingPong.model'
import { PingPongPostResponse } from '~/models/outbound/pingPong.interface'

jest.mock('~/models/outbound/pingPong.model', () => ({
  create: jest.fn(),
}))

describe('Ping Handler', () => {
  let mockRequest: Partial<Request>
  let mockResponseToolkit: Partial<ResponseToolkit>
  let code = jest.fn()
  beforeEach(() => {
    mockRequest = {
      payload: {
        requestId: 'test-request-id',
      },
      server: {
        app: {
          pubSub: {
            connect: jest.fn(),
            disconnect: jest.fn(),
            healthCheck: jest.fn(),
            isConnected: { publisherConnected: true, subscriberConnected: true },
            publish: jest.fn(),
            subscribe: jest.fn(),
            unsubscribe: jest.fn(),
            broadcast: jest.fn().mockImplementation(async (channels: string[], message: any) => {
              // Mock implementation of broadcast
            }),
            run: jest.fn(), // Add the required method to match the PubSub interface
          } as any, // Cast to `any` to bypass strict type checking for the mock
          kvs: {
            connect: jest.fn(),
            disconnect: jest.fn(),
            healthCheck: jest.fn(),
            isConnected: true,
            get: jest.fn(),
            set: jest.fn(),
            delete: jest.fn(),
          } as any, // Cast to `any` to bypass strict type checking for the mock
          logger: {
            info: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
            warn: jest.fn(),
          } as any, // Cast to `any` to bypass strict type checking for the mock
        },
      } as any, // Cast to `any` to bypass strict type checking for the mock
    }

    mockResponseToolkit = {
      response: jest.fn().mockReturnValue({
        code,
      }),
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return a 200 response with the result when the model runs successfully', async () => {
    const mockResult: PingPongPostResponse = {
      requestId: 'test-request-id',
      fspPutResponse: {
        headers: {
          'fspiop-source': 'test-source',
          'fspiop-destination': 'test-destination',
          'fspiop-signature': 'test-signature',
        },
        payload: {
          requestId: 'test-request-id'
        }
      },
    }
    ;(create as jest.Mock).mockResolvedValue({
      run: jest.fn().mockResolvedValue(mockResult),
    })

    await post({} as any, mockRequest as Request, mockResponseToolkit as ResponseToolkit)

    expect(create).toHaveBeenCalledWith(
      {
      requestId: 'test-request-id',
      request: mockRequest,
      currentState: 'start',
      },
      expect.objectContaining({
      appConfig: expect.any(Object),
      logger: expect.any(Object),
      subscriber: expect.objectContaining({
        broadcast: expect.any(Function),
        connect: expect.any(Function),
        disconnect: expect.any(Function),
        healthCheck: expect.any(Function),
        isConnected: expect.any(Object),
        publish: expect.any(Function),
        run: expect.any(Function),
        subscribe: expect.any(Function),
        unsubscribe: expect.any(Function),
      }),
      kvs: expect.objectContaining({
        connect: expect.any(Function),
        delete: expect.any(Function),
        disconnect: expect.any(Function),
        get: expect.any(Function),
        healthCheck: expect.any(Function),
        isConnected: expect.any(Boolean),
        set: expect.any(Function),
      }),
      key: 'test-request-id',
      })
    )
    expect(mockResponseToolkit.response).toHaveBeenCalledWith(mockResult)
    expect(code).toHaveBeenCalledWith(200)
  })

  it('should return a 500 response when an error occurs', async () => {
    ;(create as jest.Mock).mockImplementation(() => {
      throw new Error('Test error')
    })

    await post({} as any, mockRequest as Request, mockResponseToolkit as ResponseToolkit)

    expect(mockResponseToolkit.response).toHaveBeenCalledWith({ error: 'Test error' })
    expect(code).toHaveBeenCalledWith(500)
  })

  it('should return a 500 response with "Unknown error" for non-Error exceptions', async () => {
    ;(create as jest.Mock).mockImplementation(() => {
      throw 'Non-error exception'
    })

    await post({} as any, mockRequest as Request, mockResponseToolkit as ResponseToolkit)

    expect(mockResponseToolkit.response).toHaveBeenCalledWith({ error: 'Unknown error' })
    expect(code).toHaveBeenCalledWith(500)
  })
})
