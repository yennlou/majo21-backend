const db = require('../utils/db')
const { success } = require('../utils/response')

exports.main = async (event) => {
  const { pathParameters: { postType } } = event
  const posts = await db.getPosts(postType)
  return success(posts)
}
