const db = require('../utils/db')
const { success } = require('../utils/response')
const { generatePostAsync } = require('../utils/githubLib')

exports.main = async (event) => {
  const postIterator = generatePostAsync()
  for await (const post of postIterator) {
    await db.putPost({ postType: 'blog', ...post })
  }
  return success({
    message: 'All posts are reloaded.'
  })
}
