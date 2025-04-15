'use strict'

import { PubSub } from 'src/shared/pub-sub'
import { ILogger } from '../shared/types'

declare module '@hapi/hapi' {
  // Hapi user-extensible type for application specific state
  interface ServerApplicationState {
    logger: ILogger
    publisher: PubSub
    subscriber: PubSub
    // add other cross-app deps, if needed
  }
}
