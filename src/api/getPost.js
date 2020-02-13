import db from '../utils/db'
import { success, handleException } from '../utils/response'

const main = async (event) => {
  const { pathParameters: { postId } } = event
  try {
    const post = await db.getPost(postId)
    return success(post)
  } catch (e) {
    handleException(e)
  }
}

export { main }
