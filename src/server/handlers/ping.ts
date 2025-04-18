/*****
 License
 --------------
 Copyright © 2020 Mojaloop Foundation
 The Mojaloop files are made available by the Mojaloop Foundation under the
 Apache License, Version 2.0 (the 'License') and you may not use these files
 except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop
 files are distributed onan 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
 ANY KIND, either express or implied. See the License for the specific language
 governing permissions and limitations under the License.
 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.
 * Gates Foundation
 - Name Surname <name.surname@gatesfoundation.com>

 * Kevin Leyow <kevin.leyow@infitx.com>

 --------------
 ******/

import { Request, ResponseToolkit, ResponseObject } from '@hapi/hapi'
import { Context } from '../plugins'
import Config from '~/shared/config'

import { logger } from '~/shared/logger'
import { create } from '~/models/outbound/pingPong.model'
import { PingPongPostResponse } from '~/models/outbound/pingPong.interface'

export async function post(_context: Context, request: Request, h: ResponseToolkit): Promise<ResponseObject> {
  try {
    // @ts-ignore
    const subscriber = request.server.app.pubSub
    // @ts-ignore
    const kvs = request.server.app.kvs
    const model = await create(
      {
        requestId: (request.payload as { requestId: string }).requestId,
        request,
        currentState: 'start',
      },
      {
        appConfig: Config,
        logger,
        subscriber,
        kvs,
        key: (request.payload as { requestId: string }).requestId,
      }
    )
    const result = (await model.run()) as PingPongPostResponse
    return h.response(result).code(200)
  } catch (error) {
    return h.response({ error: error instanceof Error ? error.message : 'Unknown error' }).code(500)
  }
}


export default {
  post,
}
