'use strict'

import { ILogger } from '~/shared/types'
import { Util } from '@mojaloop/central-services-shared'

declare module '@hapi/hapi' {
  // Hapi user-extensible type for application specific state
  interface ServerApplicationState {
    logger: ILogger
    pubSub: Util['Redis']['PubSub']
    kvs: Util['Redis']['RedisCache']
    // add other cross-app deps, if needed
  }
}
