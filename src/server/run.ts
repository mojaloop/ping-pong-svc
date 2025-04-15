/*****
 License
 --------------
 Copyright © 2020 Mojaloop Foundation
 The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the 'License') and you may not use these files except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
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

import { Server } from '@hapi/hapi'
import { logger } from '../shared/logger'
import Config, { ServiceConfig } from '../shared/config'
import create from './create'
import start from './start'
import plugins from './plugins'
import { RedisConnectionConfig } from '../shared/redis-connection'
import { PubSub } from '~/shared/pub-sub'
import { Util } from '@mojaloop/central-services-shared'
import { KVS } from '~/shared/kvs'

const connection: RedisConnectionConfig = {
  host: Config.REDIS.HOST,
  port: Config.REDIS.PORT,
  timeout: Config.REDIS.TIMEOUT,
  logger
}

export default async function run(config: ServiceConfig): Promise<Server[]> {
  // todo: pass logger and oracleDB to run-fn (to avoid hardcoded deps)
  await Util.Endpoints.initializeCache(Config.CENTRAL_SHARED_ENDPOINT_CACHE_CONFIG, {
    hubName: Config.HUB_PARTICIPANT.NAME,
    hubNameRegex: Util.HeaderValidation.getHubNameRegex(Config.HUB_PARTICIPANT.NAME)
  })
  const kvs = new KVS(connection)
  await kvs.connect()
  const subscriber = new PubSub(connection)
  await subscriber.connect()
  const adminServer = await create({...config, PORT: config.ADMIN_PORT}, { logger, subscriber, kvs })
  await plugins.registerAdmin(adminServer)

  const publisher = new PubSub(connection)
  await publisher.connect()
  const fspServer = await create({...config, PORT: config.FSP_PORT}, { logger, publisher, kvs })
  await plugins.registerFsp(fspServer)

  await Promise.all([start(fspServer), start(adminServer)])
  return [fspServer, adminServer]
}
