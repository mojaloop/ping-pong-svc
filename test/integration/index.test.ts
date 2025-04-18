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

 - Kevin Leyow <kevin.leyow@infitx.com>
 --------------
 ******/

import axios from 'axios';
import { Util } from '@mojaloop/central-services-shared';

// @ts-expect-error id definition is not declared in library
const generateULID = Util.id({ type: 'ulid' });

describe('Integration Test - POST /ping', () => {
  const axiosInstance = axios.create({
    baseURL: 'http://localhost:3300',
  });

  it('should respond with 200 and a valid response body', async () => {
    const ulid = generateULID();
    const response = await axiosInstance.post(
      '/ping',
      { requestId: ulid },
      { headers: { 'fspiop-destination': 'greenbankfsp' } }
    );

    expect(response.status).toBe(200);
    expect(response.data).toEqual({
      requestId: ulid,
      fspPutResponse: {
        headers: expect.any(Object),
        body: expect.any(Object),
      }
     });
  });

  it('should respond with 200 if the fsp response was an error', async () => {
    // ttk specific id to respond on /error endpoint
    const ulid = '01JS31GNDW7B9EVH7Q43P85455';
    const response = await axiosInstance.post(
      '/ping',
      { requestId: ulid },
      { headers: { 'fspiop-destination': 'greenbankfsp' } }
    );

    expect(response.status).toBe(200);
    expect(response.data).toEqual({
      requestId: ulid,
      fspPutResponse: {
        headers: expect.any(Object),
        body: expect.objectContaining({
          errorInformation: expect.any(Object)
        }),
      }
     });
  });
});
