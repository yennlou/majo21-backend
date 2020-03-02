import db from '../utils/db'
import { success, failure } from '../utils/response'
import { getPostContentAsync, makePost, verifyWebhookData } from '../utils/githubLib'

const main = async (event) => {
  if (!verifyWebhookData(event)) {
    return failure('Githook validation failed.')
  }

  const { commits, ref } = JSON.parse(event.body)

  const branch = process.env.GITHUB_BRANCH
  const eventBranch = ref.replace('refs/heads/', '')
  if (branch !== eventBranch) {
    return success({ message: 'Update ignored.' })
  }

  if (commits.length === 0) {
    return success({ message: 'No updates.' })
  }
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
  return success({ message: 'Update succeed.' })
}

export { main }
