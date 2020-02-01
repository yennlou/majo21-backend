import axios from 'axios'
import showdown from 'showdown'
import base64 from './base64'

const githubAPI = axios.create({
  baseURL: process.env.GITHUB_ENDPOINT
})
githubAPI.defaults.headers.common.Authorization = 'Token ' + process.env.GITHUB_TOKEN

const getPostMetaData = (md) => {
  const conv = new showdown.Converter({ metadata: true })
  conv.makeHtml(md)
  return conv.getMetadata()
}

const getPostDirectoryAsync = async () => {
  const { data } = await githubAPI.get('/contents/blogs')
  return data.map(post => post.name)
}

const getPostContentAsync = async (path) => {
  const encodedPath = encodeURI(path)
  const { data } = await githubAPI.get('/contents/' + encodedPath)
  const content = base64.decode(data.content)
  const meta = getPostMetaData(content)
  return {
    id: `post:${encodedPath}`,
    postType: 'blog',
    content,
    ...meta
  }
}

const generatePostAsync = async function * () {
  const directory = await getPostDirectoryAsync()
  for (const fileName of directory) {
    const post = await getPostContentAsync('blogs/' + fileName)
    yield post
  }
}

export {
  githubAPI,
  getPostDirectoryAsync,
  getPostContentAsync,
  generatePostAsync
}
