import { Logger } from '@mojaloop/sdk-standard-components'
import { Util } from '@mojaloop/central-services-shared'

export type ILogger = Logger.SdkLogger

export type PingPongServiceDeps = {
  logger: ILogger
  pubSub?: Util["Redis"]["PubSub"]
  kvs?: Util["Redis"]["RedisCache"]
}
