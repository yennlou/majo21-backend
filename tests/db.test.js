const post01 = {
  id: 'post:posts/blog/sample_post_01.md',
  createdAt: '2020-01-12',
  postType: 'post:blog',
  series: 'post_series_01',
  title: '我的第一篇文章',
  content: '这是我的第一篇文章'
}

describe('Testing db library', () => {
  let db
  beforeAll(async () => {
    db = (await import('../utils/db')).default
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
})
