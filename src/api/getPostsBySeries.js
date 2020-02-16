import db from '../utils/db'
import { success } from '../utils/response'

const main = async (event) => {
  const { pathParameters: { series } } = event
  const posts = await db.getPostsBySeries(series)
  return success(posts)
}

export { main }
