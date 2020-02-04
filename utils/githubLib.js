import axios from 'axios'
import yaml, { MINIMAL_SCHEMA } from 'js-yaml'
import base64 from './base64'

const githubAPI = axios.create({
  baseURL: process.env.GITHUB_ENDPOINT
})
githubAPI.defaults.headers.common.Authorization = 'Token ' + process.env.GITHUB_TOKEN

const getPostMetaData = (md) => {
  const metaText = /-{3}(.+?)-{3}/s.exec(md)[1]
  return yaml.safeLoad(metaText, { schema: MINIMAL_SCHEMA })
}

const getPostDirectoryAsync = async (postType = 'blog') => {
  const GITHUB_BRANCH = process.env.GITHUB_BRANCH
  const { data } = await githubAPI.get(`/contents/posts/${postType}?ref=${GITHUB_BRANCH}`)
  return data.map(post => post.name)
}

const getPostContentAsync = async (path) => {
  const encodedPath = encodeURI(path)
  const { data } = await githubAPI.get('/contents/' + encodedPath)
  const content = base64.decode(data.content)
  const { type, ...otherMeta } = getPostMetaData(content)
  return {
    id: `post:${encodedPath}`,
    postType: type || 'blog',
    content,
    ...otherMeta
  }
}

const generatePostAsync = async function * (postType = 'blog') {
  const directory = await getPostDirectoryAsync()
  for (const fileName of directory) {
    const post = await getPostContentAsync(`posts/${postType}/${fileName}`)
    yield post
  }
}

export {
  githubAPI,
  getPostDirectoryAsync,
  getPostContentAsync,
  generatePostAsync
}
