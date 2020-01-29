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
  if (!event.authorizationToken) {
    return callback(new Error('Unauthorized'))
  }
  const token = event.authorizationToken.split(' ')[1]
  if (!token || token !== process.env.GITHUB_WEBHOOK_SECRET) {
    return callback(new Error('Unauthorized'))
  }
  return callback(null, generatePolicy(principalId, 'Allow', event.methodArn))
}
