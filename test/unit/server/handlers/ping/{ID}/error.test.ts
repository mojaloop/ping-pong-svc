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

import { put } from '~/server/handlers/ping/{ID}/error'
import { Request, ResponseToolkit } from '@hapi/hapi'
import { logger } from '~/shared/logger'
import { PingPongModel } from '~/models/outbound/pingPong.model'

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
