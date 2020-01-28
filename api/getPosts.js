const db = require('../utils/db')
const { success } = require('../utils/response')

exports.main = async (event) => {
  const posts = await db.getPosts()
  return success(posts)
}
