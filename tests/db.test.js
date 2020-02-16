import exception from '../src/utils/exception'

const post01 = {
  id: 'post:posts/blog/sample_post_01.md',
  createdAt: '2020-01-12',
  postType: 'blog',
  series: 'post_series_01',
  title: '我的第一篇文章',
  content: '这是我的第一篇文章'
}

const post02 = {
  id: 'post:posts/blog/sample_post_02.md',
  createdAt: '2020-01-23',
  postType: 'blog',
  series: 'post_series_01',
  title: '我的第一篇文章',
  content: '这是我的第一篇文章'
}

const post03 = {
  id: 'post:posts/gallery/sample_post_03.md',
  createdAt: '2020-02-12',
  postType: 'gallery',
  imageUrl: 'https://majo21-uploads.s3-ap-southeast-2.amazonaws.com/marisa-cristmas.jpg',
  description: '我的第一张相片/画作'
}

describe('Testing db library', () => {
  let db
  beforeAll(async () => {
    db = (await import('../src/utils/db')).default
  })

  test('put one post', async () => {
    const resp = await db.putPost(post01)
    expect(resp).toEqual(post01)
  })

  test('get one post', async () => {
    await db.putPost(post01)
    const resp = await db.getPost(post01.id)
    expect(resp).toEqual(post01)
  })

  test('get one post which doesn\'t exist', async () => {
    await expect(db.getPost(post01.id))
      .rejects.toEqual(new exception.Error404())
  })

  test('db operation failed', async () => {

  })

  test('get blog posts', async () => {
    await db.putPost(post01)
    await db.putPost(post02)
    await db.putPost(post03)
    let resp = await db.getPosts('blog')
    expect(resp).toEqual([post01, post02])
    resp = await db.getPosts('gallery')
    expect(resp).toEqual([post03])
  })

  test('get all series', async () => {
    await db.putPost(post01)
    await db.putPost(post02)
    await db.putPost(post03)
    const resp = await db.getAllSeries()
    expect(resp).toEqual([{ id: 'cG9zdF9zZXJpZXNfMDE=', series: 'post_series_01' }])
  })

  test('get posts by series', async () => {
    await db.putPost(post01)
    await db.putPost(post02)
    await db.putPost(post03)
    const resp = await db.getPostsBySeries('post_series_01')
    expect(resp).toEqual([post01, post02])
  })

  test('put multiple posts', async () => {
    await db.putPosts([post01, post02, post03])
    const resp = await db.getPosts('blog')
    expect(resp).toEqual([post01, post02])
  })

  test('delete one post', async () => {
    await db.putPost(post01)
    const resp = await db.deletePost(post01.id)
    expect(resp).toEqual(post01)
  })

  test('update one post', async () => {
    await db.putPost(post01)
    const updatedPost1 = {
      ...post01,
      title: '我的第一篇修改过的文章'
    }
    await db.updatePost(updatedPost1)
    const post = await db.getPost(post01.id)
    expect(post.title).toBe('我的第一篇修改过的文章')
  })
})
