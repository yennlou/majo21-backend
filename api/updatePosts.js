import db from '../utils/db'
import { success } from '../utils/response'
import { getPostContentAsync } from '../utils/githubLib'

const main = async (event) => {
  const { commits } = JSON.parse(event.body)
  const { added, removed, modified } = commits[0]
  const PostFilter = x => x.startsWith('blogs/')
  const addedList = [...added, ...modified].filter(PostFilter)
  const removedList = [...removed, ...modified].filter(PostFilter)

  for (const path of removedList) {
    await db.deletePost('post:' + path)
  }

  for (const path of addedList) {
    const post = await getPostContentAsync(path)
    await db.putPost(post)
  }
  return success(commits[0])
}

export { main }
