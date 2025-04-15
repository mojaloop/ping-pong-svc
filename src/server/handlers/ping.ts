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
import Config from '../../shared/config'
import { Util, Enum } from '@mojaloop/central-services-shared'

import SDK from '@mojaloop/sdk-standard-components'
import { logger } from '../../shared/logger'
import { PubSub, Message } from 'src/shared/pub-sub'

const hubName = Config.HUB_PARTICIPANT.NAME

export async function post(_context: Context, request: Request, h: ResponseToolkit): Promise<ResponseObject> {
  try {
    const fspiopDestination = request.headers['fspiop-destination'];

    const endpointType = Enum.EndPoints.FspEndpointTypes.FSPIOP_CALLBACK_URL_QUOTES
    const participantEndpoint = await Util.Endpoints.getEndpoint(
      Config.SWITCH_ENDPOINT,
      fspiopDestination,
      endpointType,
      undefined
    )
    if (!participantEndpoint) {
      return h.response({ error: 'Participant endpoint not found' }).code(404);
    }

    const jwsSigner = getJWSSigner(hubName)
    return new Promise(async (resolve, reject) => {
      let subId = 0

      // @ts-ignore
      const subscriber = request.server.app.subscriber
      // @ts-ignore
      const channel = notificationChannel(request.payload.requestId)
      try {

        subId = subscriber.subscribe(channel, async (channel: string, message: Message, sid: number) => {
          logger.debug(`Received message on channel: ${channel}`)
          // first unsubscribe
          subscriber.unsubscribe(channel, sid)

          const putResponse = message as any
          return resolve(h.response(putResponse).code(putResponse.errorInformation ? 400 : 200))
        })

        await Util.Request.sendRequest({
          url: participantEndpoint,
          source: hubName,
          destination: fspiopDestination,
          headers: {
            'fspiop-source': hubName,
            'fspiop-destination': fspiopDestination,
            'fspiop-signature': request.headers['fspiop-signature'],
          },
          jwsSigner,
          method: 'POST',
          payload: request.payload,
          hubNameRegex: Util.HeaderValidation.getHubNameRegex(hubName),
        })
      } catch (error) {
        logger.error('getAccounts request error', error)
        subscriber.unsubscribe(channel, subId)
        reject(error)
      }
    })
  } catch (error) {
    return h.response({ error: error instanceof Error ? error.message : 'Unknown error' }).code(500)
  }
}

const notificationChannel = (id: string): string => {
  if (!(id && id.toString().length > 0)) {
    throw new Error("PISPDiscoveryModel.notificationChannel: 'id' parameter is required")
  }
  // channel name
  return `pingPong_${id}`
}

const getJWSSigner = (from: string) => {
  let jwsSigner
  if (Config.ENDPOINT_SECURITY.JWS.JWS_SIGN && from === hubName) {
    logger.debug('Notification::getJWSSigner: get JWS signer')
    jwsSigner = new SDK.Jws.JwsSigner({
      logger: logger,
      signingKey: Config.ENDPOINT_SECURITY.JWS.JWS_SIGNING_KEY
    })
  }
  return jwsSigner
}

export default {
  post,
}
