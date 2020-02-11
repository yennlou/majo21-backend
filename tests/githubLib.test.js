import crypto from 'crypto'
import { verifyWebhookData } from '../src/utils/githubLib'

test('verify github webhook secret', () => {
  const payload = JSON.stringify({
    commits: [{
      added: ['posts/blog/first.md'],
      removed: [],
      modified: []
    }]
  })
  const hmac = crypto.createHmac('sha1', process.env.GITHUB_WEBHOOK_SECRET)
  const digest = 'sha1=' + hmac.update(payload).digest('hex')
  const event = {
    headers: {
      'X-Hub-Signature': digest
    },
    body: payload
  }
  expect(verifyWebhookData(event)).toBe(true)
})
