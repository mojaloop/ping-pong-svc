import { Request, ResponseToolkit, ResponseObject } from '@hapi/hapi'
import { Context } from '~/server/plugins'
import { logger } from '~/shared/logger'
import { PingPongModel } from '~/models/outbound/pingPong.model'
import { Util } from '@mojaloop/central-services-shared'

export async function put(context: Context, request: Request, h: ResponseToolkit): Promise<ResponseObject> {
  try {
    const { ID } = request.params
    const payload = request.payload

    if (!ID) {
      return h.response({ error: "'ID' parameter is required" }).code(400)
    }

    const channel = PingPongModel.notificationChannel(ID)

    // @ts-ignore
    const publisher: Util['Redis']['PubSub'] = request.server.app.publisher

    await publisher.publish(channel, payload as unknown as any)
    logger.info(`Payload published to channel: ${channel}`)

    return h.response({ status: 'success', channel }).code(200)
  } catch (error) {
    logger.error('Error in /ping/{ID} handler', error)
    return h.response({ error: error instanceof Error ? error.message : 'Unknown error' }).code(500)
  }
}

export default {
  put,
}
