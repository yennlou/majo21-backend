import db from '../utils/db'
import { success } from '../utils/response'

const main = async (event) => {
  const { pathParameters: { postType } } = event
  const posts = await db.getPosts(postType)
  return success(posts)
}

export { main }
