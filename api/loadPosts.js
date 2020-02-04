import db from '../utils/db'
import { success } from '../utils/response'
import { generatePostAsync } from '../utils/githubLib'

const main = async (event) => {
  const blogIterator = generatePostAsync('blog')
  for await (const post of blogIterator) {
    await db.putPost(post)
  }
  return success({
    message: 'All posts are reloaded.'
  })
}

export { main }
