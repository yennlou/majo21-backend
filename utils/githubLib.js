const axios = require('axios')
const showdown = require('showdown')
const base64 = require('./base64')

const githubAPI = axios.create({
  baseURL: process.env.GITHUB_ENDPOINT
})

const getPostMetaData = (md) => {
  const conv = new showdown.Converter({ metadata: true })
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
    path: encodedPath,
    postType: 'post',
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

module.exports = {
  githubAPI,
  getPostDirectoryAsync,
  getPostContentAsync,
  generatePostAsync
}
