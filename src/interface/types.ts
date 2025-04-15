'use strict'

import { PubSub } from 'src/shared/pub-sub'
import { ILogger } from '../shared/types'
import { KVS } from 'src/shared/kvs'

declare module '@hapi/hapi' {
  // Hapi user-extensible type for application specific state
  interface ServerApplicationState {
    logger: ILogger
    publisher: PubSub
    subscriber: PubSub // Ensure this is correctly defined
    kvs: KVS
    // add other cross-app deps, if needed
  }
}
