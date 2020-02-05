import db from '../utils/db'
import { success } from '../utils/response'
import { getPostContentAsync, makePost } from '../utils/githubLib'

const main = async (event) => {
  const { commits } = JSON.parse(event.body)
  const { added, removed, modified } = commits[0]
  const PostFilter = x => x.startsWith('posts/')
  const addedList = [...added, ...modified].filter(PostFilter)
  const removedList = [...removed, ...modified].filter(PostFilter)

  for (const path of removedList) {
    await db.deletePost('post:' + encodeURI(path))
  }

  for (const path of addedList) {
    const encodedPath = encodeURI(path)
    const postType = path.startsWith('posts/gallery') ? 'gallery' : 'blog'
    const postContent = await getPostContentAsync(path)
    const post = makePost(encodedPath, postType, postContent)
    await db.putPost(post)
  }
  return success(commits[0])
}

export { main }
