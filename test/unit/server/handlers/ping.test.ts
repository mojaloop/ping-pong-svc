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
