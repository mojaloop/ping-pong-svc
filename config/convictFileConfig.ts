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

 - Vijay Kumar Guthi <vijaya.guthi@infitx.com>
 --------------
 ******/
import path from 'path'
import Convict from 'convict'

const ENV_PREFIX = 'PING_PONG_SVC_'

export interface FileConfig {
  PORT: number
  HOST: string
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
  INSPECT: {
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
      JWS_VERIFICATION_KEYS_DIRECTORY: string
    }
  },
  CENTRAL_SHARED_ENDPOINT_CACHE_CONFIG: {
    expiresIn: number
    generateTimeout: number
    getDecoratedValue: boolean
  }
}

const ConvictFileConfig = Convict<FileConfig>({
  PORT: {
    format: Number,
    default: 3300,
    env: ENV_PREFIX + 'PORT'
  },
  HOST: {
    format: String,
    default: '0.0.0.0',
    env: ENV_PREFIX + 'HOST'
  },
  INSPECT: {
    DEPTH: {
      format: Number,
      default: 4
    },
    SHOW_HIDDEN: {
      format: Boolean,
      default: false
    },
    COLOR: {
      format: Boolean,
      default: true
    }
  },
  REDIS: {
    enabled: {
      format: Boolean,
      default: false,
      env: ENV_PREFIX + 'REDIS_ENABLED'
    },
    type: {
      format: String,
      default: 'cluster',
      env: ENV_PREFIX + 'REDIS_TYPE'
    },
    connectionConfig: {
      cluster: [{
        host: {
          format: String,
          default: 'localhost',
          env: ENV_PREFIX + 'REDIS_HOST'
        },
        port: {
          format: Number,
          default: 6379,
          env: ENV_PREFIX + 'REDIS_PORT'
        }
      }]
    }
  },
  SWITCH_ENDPOINT: {
    format: String,
    default: '',
    env: ENV_PREFIX + 'SWITCH_ENDPOINT'
  },
  HUB_PARTICIPANT: {
    ID: {
      format: Number,
      default: 1,
      env: ENV_PREFIX + 'HUB_PARTICIPANT_ID'
    },
    NAME: {
      format: String,
      default: 'Hub',
      env: ENV_PREFIX + 'HUB_PARTICIPANT_NAME'
    }
  },
  ENDPOINT_SECURITY: {
    TLS: {
      rejectUnauthorized: {
        format: Boolean,
        default: true,
        env: ENV_PREFIX + 'TLS_REJECT_UNAUTHORIZED'
      }
    },
    JWS: {
      JWS_SIGN: {
        format: Boolean,
        default: false,
        env: ENV_PREFIX + 'JWS_SIGN'
      },
      JWS_SIGNING_KEY_PATH: {
        format: String,
        default: '',
        env: ENV_PREFIX + 'JWS_SIGNING_KEY_PATH'
      },
      JWS_VERIFICATION_KEYS_DIRECTORY: {
        format: String,
        default: '',
        env: ENV_PREFIX + 'JWS_VERIFICATION_KEYS_DIRECTORY'
      },
    }
  },
  CENTRAL_SHARED_ENDPOINT_CACHE_CONFIG: {
    expiresIn: {
      format: Number,
      default: 180000,
      env: ENV_PREFIX + 'CENTRAL_SHARED_ENDPOINT_CACHE_EXPIRES_IN'
    },
    generateTimeout: {
      format: Number,
      default: 30000,
      env: ENV_PREFIX + 'CENTRAL_SHARED_ENDPOINT_CACHE_GENERATE_TIMEOUT'
    },
    getDecoratedValue: {
      format: Boolean,
      default: true,
      env: ENV_PREFIX + 'CENTRAL_SHARED_ENDPOINT_CACHE_GET_DECORATED_VALUE'
    }
  }
})

const ConfigFile = path.join(__dirname, 'default.json')
ConvictFileConfig.loadFile(ConfigFile)
ConvictFileConfig.validate({ allowed: 'strict' })

export default ConvictFileConfig
