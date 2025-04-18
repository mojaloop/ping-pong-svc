/*****
 License
 --------------
 Copyright © 2020 Mojaloop Foundation
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
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.
 * Gates Foundation
 - Name Surname <name.surname@gatesfoundation.com>

 - Vijay Kumar Guthi <vijaya.guthi@infitx.com>
 --------------
 ******/

import fs from 'fs'
import ConvictFileConfig from './convictFileConfig'

export interface ServiceConfig {
  PORT: number
  REDIS: {
    enabled: boolean
    type: string
    connectionConfig: {
      cluster: Array<{
        host: string
        port: number
      }>
    }
  }
  HOST: string
  INSPECT?: {
    DEPTH: number
    SHOW_HIDDEN: boolean
    COLOR: boolean
  },
  SWITCH_ENDPOINT: string
  HUB_PARTICIPANT: {
    ID: number
    NAME: string
  },
  ENDPOINT_SECURITY: {
    TLS: {
      rejectUnauthorized: boolean
    },
    JWS: {
      JWS_SIGN: boolean
      JWS_SIGNING_KEY_PATH: string
      JWS_SIGNING_KEY: any
      JWS_VERIFICATION_KEYS_DIRECTORY: string
    }
  },
  CENTRAL_SHARED_ENDPOINT_CACHE_CONFIG: {
    expiresIn: number
    generateTimeout: number
    getDecoratedValue: boolean
  }
}

const getFileContent = (path: string) => {
  if (!fs.existsSync(path)) {
    console.log(`File ${path} doesn't exist, can't enable JWS signing`)
    throw new Error('File doesn\'t exist')
  }
  return fs.readFileSync(path)
}

const ConfigFileProperties = ConvictFileConfig.getProperties()

const ServiceConfig: ServiceConfig = {
  PORT: ConfigFileProperties.PORT,
  HOST: ConfigFileProperties.HOST,
  REDIS: ConfigFileProperties.REDIS,
  INSPECT: ConfigFileProperties.INSPECT,
  SWITCH_ENDPOINT: ConfigFileProperties.SWITCH_ENDPOINT,
  HUB_PARTICIPANT: {
    ID: ConfigFileProperties.HUB_PARTICIPANT.ID,
    NAME: ConfigFileProperties.HUB_PARTICIPANT.NAME
  },
  ENDPOINT_SECURITY: {
    TLS: {
      rejectUnauthorized: ConfigFileProperties.ENDPOINT_SECURITY.TLS.rejectUnauthorized
    },
    JWS: {
      JWS_SIGN: ConfigFileProperties.ENDPOINT_SECURITY.JWS.JWS_SIGN,
      JWS_SIGNING_KEY_PATH: ConfigFileProperties.ENDPOINT_SECURITY.JWS.JWS_SIGNING_KEY_PATH,
      JWS_SIGNING_KEY: ConfigFileProperties.ENDPOINT_SECURITY.JWS.JWS_SIGN ? getFileContent(ConfigFileProperties.ENDPOINT_SECURITY.JWS.JWS_SIGNING_KEY_PATH) : '',
      JWS_VERIFICATION_KEYS_DIRECTORY: ConfigFileProperties.ENDPOINT_SECURITY.JWS.JWS_VERIFICATION_KEYS_DIRECTORY
    }
  },
  CENTRAL_SHARED_ENDPOINT_CACHE_CONFIG: {
    expiresIn: ConfigFileProperties.CENTRAL_SHARED_ENDPOINT_CACHE_CONFIG.expiresIn,
    generateTimeout: ConfigFileProperties.CENTRAL_SHARED_ENDPOINT_CACHE_CONFIG.generateTimeout,
    getDecoratedValue: ConfigFileProperties.CENTRAL_SHARED_ENDPOINT_CACHE_CONFIG.getDecoratedValue
  }
}

export default ServiceConfig
