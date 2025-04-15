import { Logger } from '@mojaloop/sdk-standard-components'
import { PubSub } from './pub-sub'
import { KVS } from './kvs'

export type ILogger = Logger.SdkLogger

export type PingPongServiceDeps = {
  logger: ILogger
  publisher?: PubSub
  subscriber?: PubSub
  kvs?: KVS
}
