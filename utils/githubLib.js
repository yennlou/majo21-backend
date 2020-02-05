import crypto from 'crypto'
import axios from 'axios'
import yaml, { MINIMAL_SCHEMA } from 'js-yaml'
import base64 from './base64'

const githubAPI = axios.create({
  baseURL: process.env.GITHUB_ENDPOINT
})
githubAPI.defaults.headers.common.Authorization = 'Token ' + process.env.GITHUB_TOKEN

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

const makePost = (encodedPath, postType, content) => {
  const getBlogMetaData = (md) => {
    const metaText = /-{3}(.+?)-{3}/s.exec(md)[1]
    return yaml.safeLoad(metaText, { schema: MINIMAL_SCHEMA })
  }
  if (postType === 'blog') {
    const meta = getBlogMetaData(content)
    return {
      id: `post:${encodedPath}`,
      postType,
      content,
      ...meta
    }
  } else if (postType === 'gallery') {
    const postData = yaml.safeLoad(content, { schema: MINIMAL_SCHEMA })
    return {
      id: `post:${encodedPath}`,
      postType,
      ...postData
    }
  }
}

const generatePostAsync = async function * (postType = 'blog') {
  const directory = await getPostDirectoryAsync(postType)
  for (const fileName of directory) {
    const encodedPath = encodeURI(`posts/${postType}/${fileName}`)
    const postContent = await getPostContentAsync(encodedPath)
    yield makePost(encodedPath, postType, postContent)
  }
}

const verifyWebhookData = (event) => {
  const secret = process.env.GITHUB_WEBHOOK_SECRET
  const sigHeaderName = 'X-Hub-Signature'
  const payload = JSON.stringify(event.body)
  if (!payload) return false
  const sig = event.headers[sigHeaderName] || ''
  const hmac = crypto.createHmac('sha1', secret)
  const digest = Buffer.from('sha1=' + hmac.update(payload).digest('hex'), 'utf8')
  const checksum = Buffer.from(sig, 'utf8')
  return (checksum.length === digest.length && crypto.timingSafeEqual(digest, checksum))
}

export {
  githubAPI,
  getPostDirectoryAsync,
  getPostContentAsync,
  generatePostAsync,
  makePost,
  verifyWebhookData
}
