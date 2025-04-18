#!./node_modules/.bin/ts-node

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
 - Kevin Leyow <kevin.leyow@infitx.com>
 --------------
 ******/

// This is required so that once we compile to js
// the js `require()` can resolve the '~' paths
// @eslint-disable-next-line
require('module-alias/register');

import { Command } from 'commander';
import ServiceServer from './server';
import Config, { PACKAGE } from './shared/config';
import { logger } from './shared/logger';

// handle script parameters
const program = new Command(PACKAGE.name);

// when unit tests are run commander runs process.exit on unknown option in jest's command line
program.exitOverride();
try {
  program.version(PACKAGE.version).description('ping-pong-svc cli').parse(process.argv);
} catch (err) {
  logger.error('error on program parsing process.argv', err);
}

// setup & start @hapi server
ServiceServer.run(Config);
