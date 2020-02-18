import db from '../utils/db'
import { Base64 } from 'js-base64'
import { success } from '../utils/response'

const main = async (event) => {
  const { pathParameters: { seriesId } } = event
  const series = Base64.decode(seriesId)
  const posts = await db.getPostsBySeries(series)
  return success(posts)
}

export { main }
