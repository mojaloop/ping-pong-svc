import { put } from '~/server/handlers/ping/{ID}/error'
import { Request, ResponseToolkit } from '@hapi/hapi'
import { Context } from '~/server/plugins'
import { logger } from '~/shared/logger'
import { PingPongModel } from '~/models/outbound/pingPong.model'
import { Util } from '@mojaloop/central-services-shared'

jest.mock('~/shared/logger')
jest.mock('~/models/outbound/pingPong.model')
jest.mock('@mojaloop/central-services-shared')

describe('PUT /ping/{ID}/error handler', () => {
  let mockRequest: Partial<Request>
  let mockResponseToolkit: Partial<ResponseToolkit>
  const code = jest.fn()
  const mockPublisher = {
    publish: jest.fn(),
  }

  beforeEach(() => {
    mockRequest = {
      params: { ID: 'test-request-id' },
      headers: { 'content-type': 'application/json' },
      payload: {
        requestId: 'test-request-id',
      },
      server: {
        app: {
          pubSub: mockPublisher,
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

  it('should publish payload to the correct channel and return 200', async () => {
    const channel = 'notificationChannel'
    jest.spyOn(PingPongModel, 'notificationChannel').mockReturnValue(channel)

    await put({} as any, mockRequest as Request, mockResponseToolkit as ResponseToolkit)

    expect(PingPongModel.notificationChannel).toHaveBeenCalledWith('test-request-id')
    expect(mockPublisher.publish).toHaveBeenCalledWith(channel, {
      headers: mockRequest.headers,
      body: mockRequest.payload
    })
    expect(logger.info).toHaveBeenCalledWith(`Payload published to channel: ${channel}`)
    expect(mockResponseToolkit.response).toHaveBeenCalledWith({ status: 'success', channel })
    expect(code).toHaveBeenCalledWith(200)
  })

})
