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

 - Kevin Leyow - kevin.leyow@infitx.com
 --------------
 ******/

import { ControlledStateMachine, PersistentModelConfig, StateData } from '../persistent.model'
import { Method } from 'javascript-state-machine'
import { ServiceConfig } from 'config/serviceConfig'
import { Util } from '@mojaloop/central-services-shared'


export enum PingPongModelState {
  start = 'WAITING_FOR_PING_REQUEST',
  succeeded = 'COMPLETED',
  errored = 'ERROR_OCCURRED'
}

export interface PingPongPostResponse {
  requestId: string
  fspPutResponse: any
}

export interface PingPongStateMachine extends ControlledStateMachine {
  requestPing: Method
  onRequestPing: Method
}

export interface PingPongModelConfig extends PersistentModelConfig {
  appConfig: ServiceConfig
  subscriber: Util['Redis']['PubSub']
}

export interface PingPongData extends StateData {
  requestId: string
  request: any
  response?: PingPongPostResponse
}
