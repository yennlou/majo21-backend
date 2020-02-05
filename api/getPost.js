import db from '../utils/db'
import { success, failure } from '../utils/response'

const main = async (event) => {
  const { pathParameters: { postId } } = event
  const post = await db.getPost(postId)
  if (!post) return failure({ message: 'Post not found.' })
  return success(post)
}

export { main }
