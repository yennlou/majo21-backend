import axios from 'axios'
import yaml, { MINIMAL_SCHEMA } from 'js-yaml'
import base64 from './base64'

const githubAPI = axios.create({
  baseURL: process.env.GITHUB_ENDPOINT
})
githubAPI.defaults.headers.common.Authorization = 'Token ' + process.env.GITHUB_TOKEN

const getBlogMetaData = (md) => {
  const metaText = /-{3}(.+?)-{3}/s.exec(md)[1]
  return yaml.safeLoad(metaText, { schema: MINIMAL_SCHEMA })
}

const getPostDirectoryAsync = async (postType = 'blog') => {
  const GITHUB_BRANCH = process.env.GITHUB_BRANCH
  const { data } = await githubAPI.get(`/contents/posts/${postType}?ref=${GITHUB_BRANCH}`)
  return data.map(post => post.name)
}

const getPostContentAsync = async (path) => {
  const GITHUB_BRANCH = process.env.GITHUB_BRANCH
  const { data } = await githubAPI.get(`/contents/${path}?ref=${GITHUB_BRANCH}`)
  return base64.decode(data.content)
}

const generatePostAsync = async function * (postType = 'blog') {
  const directory = await getPostDirectoryAsync(postType)
  for (const fileName of directory) {
    const encodedPath = encodeURI(`posts/${postType}/${fileName}`)
    const postContent = await getPostContentAsync(encodedPath)
    if (postType === 'blog') {
      const meta = getBlogMetaData(postContent)
      yield {
        id: `post:${encodedPath}`,
        content: postContent,
        ...meta
      }
    } else if (postType === 'gallery') {
      const postData = yaml.safeLoad(postContent, { schema: MINIMAL_SCHEMA })
      yield {
        id: `post:${encodedPath}`,
        ...postData
      }
    }
  }
}

export {
  githubAPI,
  getPostDirectoryAsync,
  getPostContentAsync,
  generatePostAsync
}
