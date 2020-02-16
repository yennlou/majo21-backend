import db from '../utils/db'
import base64 from '../utils/base64'
import { success } from '../utils/response'

const main = async (event) => {
  const { pathParameters: { seriesId } } = event
  const series = base64.decode(seriesId)
  const posts = await db.getPostsBySeries(series)
  return success(posts)
}

export { main }
