import { verifyWebhookData } from './utils/githubLib'

const generatePolicy = (principalId, effect, resource) => {
  const authResponse = {
    principalId
  }
  if (effect && resource) {
    const policyDocument = {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource
        }
      ]
    }
    authResponse.policyDocument = policyDocument
  }
  return authResponse
}

export const githook = (event, context, callback) => {
  const principalId = 'githook-001'
  if (!verifyWebhookData(event)) {
    return callback(new Error('Githook validation failed.'))
  }
  return callback(null, generatePolicy(principalId, 'Allow', event.methodArn))
}
