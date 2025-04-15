import { Logger } from '@mojaloop/sdk-standard-components'
import { PubSub } from './pub-sub'

export type ILogger = Logger.SdkLogger

export type PingPongServiceDeps = {
  logger: ILogger
  publisher?: PubSub
  subscriber?: PubSub
}
