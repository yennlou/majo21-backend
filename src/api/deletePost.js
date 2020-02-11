import db from '../utils/db'
import { success } from '../utils/response'

const main = async (event) => {
  const { pathParameters: { postId } } = event
  const post = await db.deletePost(postId)
  return success(post)
}

export { main }
