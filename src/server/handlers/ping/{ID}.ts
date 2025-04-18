/*****
 License
 --------------
 Copyright © 2020 Mojaloop Foundation
 The Mojaloop files are made available by the Mojaloop Foundation under the
 Apache License, Version 2.0 (the "License") and you may not use these files
 except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop files
 are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied. See the License for the specific language
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

 - Kevin Leyow <kevin.leyow@infitx.com>

 --------------
 ******/
import { Request, ResponseToolkit, ResponseObject } from '@hapi/hapi'
import { Context } from '~/server/plugins'
import { Util } from '@mojaloop/central-services-shared'
import { logger } from '~/shared/logger'
import { PingPongModel } from '~/models/outbound/pingPong.model'

export async function put(context: Context, request: Request, h: ResponseToolkit): Promise<ResponseObject> {
  try {
    const { ID } = request.params
    const body = request.payload
    const headers = request.headers
    if (!ID) {
      return h.response({ error: "'ID' parameter is required" }).code(400)
    }

    const channel = PingPongModel.notificationChannel(ID)

    // @ts-ignore
    const publisher: Util['Redis']['PubSub'] = request.server.app.pubSub
    // return original request headers and body
    // so dfspWatcher can validate jws
    await publisher.publish(channel, {headers, body})
    logger.info(`Payload published to channel: ${channel}`)

    return h.response({ status: 'success', channel }).code(200)
  } catch (error) {
    logger.error('Error in /ping/{ID} handler', error)
    return h.response({ error: error instanceof Error ? error.message : 'Unknown error' }).code(500)
  }
}

export default {
  put,
}
