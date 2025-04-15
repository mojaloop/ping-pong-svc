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

 - Sridhar Voruganti <sridhar.voruganti@modusbox.com>
 --------------
 ******/
import {
  PingPongData,
  PingPongModelConfig,
  PingPongPostResponse,
  PingPongStateMachine
} from './pingPong.interface'
import { Message, PubSub } from '../../shared/pub-sub'
import { PersistentModel } from '../persistent.model'
import { StateMachineConfig } from 'javascript-state-machine'

import inspect from '../../shared/inspect'
import SDK from '@mojaloop/sdk-standard-components';
import { Util } from '@mojaloop/central-services-shared'
import { Enum } from '@mojaloop/central-services-shared'

export class PingPongModel extends PersistentModel<PingPongStateMachine, PingPongData> {
  protected config: PingPongModelConfig

  constructor(data: PingPongData, config: PingPongModelConfig) {
    const spec: StateMachineConfig = {
      init: 'start',
      transitions: [{ name: 'requestPing', from: 'start', to: 'succeeded' }],
      methods: {
        // specific transitions handlers methods
        onRequestPing: () => this.onRequestPing()
      }
    }
    super(data, config, spec)
    this.config = { ...config }
  }

  // getters
  get subscriber(): PubSub {
    return this.config.subscriber
  }

  // generate the name of notification channel dedicated for accounts requests
  static notificationChannel(id: string): string  {
    if (!(id && id.toString().length > 0)) {
      throw new Error("PISPDiscoveryModel.notificationChannel: 'id' parameter is required")
    }
    // channel name
    return `pingPong_${id}`
  }

  getJWSSigner(from: string): SDK.Jws.JwsSigner | undefined {
    let jwsSigner

    if (this.config.appConfig.ENDPOINT_SECURITY.JWS.JWS_SIGN &&
        from === this.config.appConfig.HUB_PARTICIPANT.NAME) {
      this.logger.debug('Notification::getJWSSigner: get JWS signer')
      jwsSigner = new SDK.Jws.JwsSigner({
        logger: this.logger,
        signingKey: this.config.appConfig.ENDPOINT_SECURITY.JWS.JWS_SIGNING_KEY
      })
    }
    return jwsSigner
  }

  /**
   * Requests User Accounts
   * Starts the get accounts process by sending a
   * GET /accounts/${userId} request to switch
   * than await for a notification on PUT /accounts/${userId}
   * from the PubSub that the requestPing has been resolved
   */
  async onRequestPing(): Promise<void> {
    console.log(this.data.requestId)
    const channel = PingPongModel.notificationChannel(this.data.requestId)
    const subscriber: PubSub = this.subscriber
    const hubName = this.config.appConfig.HUB_PARTICIPANT.NAME
    const fspiopDestination = this.data.request.headers['fspiop-destination']
    const fspiopSignature = this.data.request.headers['fspiop-signature']
    const endpointType = Enum.EndPoints.FspEndpointTypes.FSPIOP_CALLBACK_URL_QUOTES
    const participantEndpoint = await Util.Endpoints.getEndpoint(
      this.config.appConfig.SWITCH_ENDPOINT,
      fspiopDestination,
      endpointType,
      undefined
    )

    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      let subId = 0
      try {
        // in handlers/inbound is implemented UpdateAccountsByUserId handler
        // which publish postPing response to channel
        subId = subscriber.subscribe(channel, async (channel: string, message: Message, sid: number) => {
          this.logger.debug(`Received message on channel: ${channel}`)
          // first unsubscribe
          subscriber.unsubscribe(channel, sid)

          const putResponse = message as any
          this.data.response = putResponse
          resolve
        })

        await Util.Request.sendRequest({
          url: participantEndpoint,
          source: hubName,
          destination: fspiopDestination,
          headers: {
            'fspiop-source': hubName,
            'fspiop-destination': fspiopDestination,
            'fspiop-signature': fspiopSignature,
          },
          jwsSigner: this.getJWSSigner(hubName),
          method: 'POST',
          payload: this.data.request.payload,
          hubNameRegex: Util.HeaderValidation.getHubNameRegex(hubName),
        })
      } catch (error) {
        subscriber.unsubscribe(channel, subId)
        reject(error)
      }
    })
  }

  /**
   * Returns an object representing the final state of the requestPing suitable for the outbound API
   *
   * @returns {object} - Response representing the result of the onRequestPing process
   */
  getResponse(): PingPongPostResponse | void {
    return this.data.response
  }

  /**
   * runs the workflow
   */
  async run(): Promise<PingPongPostResponse | void> {
    const data = this.data
    try {
      // run transitions based on incoming state
      switch (data.currentState) {
        case 'start':
          // the first transition is requestPing
          await this.fsm.requestPing()
          this.logger.info(`postPing requested for ${data.userId},  currentState: ${data.currentState}`)
        /* falls through */

        case 'succeeded':
          // all steps complete so return
          this.logger.info('postPing completed successfully')
          return this.getResponse()

        case 'errored':
          // stopped in errored state
          this.logger.info('State machine in errored state')
          return
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      this.logger.info(`Error running PingPongModel : ${inspect(err)}`)

      // as this function is recursive, we don't want to error the state machine multiple times
      if (data.currentState !== 'errored') {
        // err should not have a accountsState property here!
        if (err.accountsState) {
          this.logger.info('State machine is broken')
        }
        // transition to errored state
        await this.fsm.error(err)

        // avoid circular ref between accountsState.lastError and err
        err.accountsState = { ...this.getResponse() }
      }
      throw err
    }
  }
}

export async function create(data: PingPongData, config: PingPongModelConfig): Promise<PingPongModel> {
  // create a new model
  const model = new PingPongModel(data, config)

  // enforce to finish any transition to state specified by data.currentState or spec.init
  await model.fsm.state
  return model
}
