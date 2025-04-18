/*****
 License
 --------------
 Copyright © 2020-2025 Mojaloop Foundation
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
 Mojaloop Foundation for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.

 * Mojaloop Foundation
 - Name Surname <name.surname@mojaloop.io>

 - Paweł Marzec <pawel.marzec@modusbox.com>

 --------------
 ******/

import { logger } from '~/shared/logger'

jest.mock(
  '@mojaloop/sdk-standard-components',
  jest.fn(() => ({
    Logger: {
      loggerFactory: jest.fn(() => ({
        push: jest.fn(),
        configure: jest.fn(),

        // log methods
        log: jest.fn(),

        // generated methods from default levels
        verbose: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        trace: jest.fn(),
        info: jest.fn(),
        fatal: jest.fn()
      })),
      buildStringify: jest.fn()
    }
  }))
)

describe('shared/logger', (): void => {
  describe('logger default instance', () => {
    it('should have proper layout', () => {
      // basic methods
      expect(typeof logger.push).toEqual('function')

      // log methods
      expect(typeof logger.log).toEqual('function')

      // generated methods from default levels
      expect(typeof logger.verbose).toEqual('function')
      expect(typeof logger.debug).toEqual('function')
      expect(typeof logger.warn).toEqual('function')
      expect(typeof logger.error).toEqual('function')
      expect(typeof logger.trace).toEqual('function')
      expect(typeof logger.info).toEqual('function')
    })
  })
})
