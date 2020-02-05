import AWS from 'aws-sdk'

const IS_OFFLINE = process.env.IS_OFFLINE
const TableName = process.env.DYNAMODB_TABLE
const DYNAMODB_ENDPOINT_LOCAL = process.env.DYNAMODB_ENDPOINT_LOCAL

let dynamodb
if (IS_OFFLINE) {
  dynamodb = new AWS.DynamoDB.DocumentClient({
    region: 'localhost',
    endpoint: DYNAMODB_ENDPOINT_LOCAL
  })
} else {
  dynamodb = new AWS.DynamoDB.DocumentClient()
}

function serializePost (post) {
  const { id, createdAt, postType, ...rest } = post
  return {
    PK: id,
    SK: createdAt || '1977-01-01',
    GSI1: 'post:' + postType,
    ...rest
  }
}

function deserializePost (post) {
  const { PK, SK, GSI1, ...rest } = post
  return {
    id: PK,
    createdAt: SK,
    postType: GSI1.replace('post:', ''),
    ...rest
  }
}

const getPosts = async (postType = 'blog') => {
  const params = {
    TableName,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1 = :postType',
    ExpressionAttributeValues: {
      ':postType': 'post:' + postType
    }
  }
  const resp = await dynamodb.query(params).promise()
  return resp.Items.map(deserializePost)
}

const getPost = async (id) => {
  const params = {
    TableName,
    KeyConditionExpression: 'PK = :postId',
    ExpressionAttributeValues: {
      ':postId': id
    }
  }
  const resp = await dynamodb.query(params).promise()
  if (!resp.Items.length) {
    return null
  }
  return deserializePost(resp.Items[0])
}

const putPost = async (post) => {
  const params = {
    TableName,
    Item: serializePost(post)
  }
  await dynamodb.put(params).promise()
  return post
}

const deletePost = async (id) => {
  const post = await getPost(id)
  const { PK, SK } = serializePost(post)
  const params = {
    TableName,
    Key: { PK, SK }
  }
  await dynamodb.delete(params).promise()
  return true
}

const updatePost = async (post) => {
  const { PK, SK, ...postAttrs } = serializePost(post)
  const UpdateExpressionArray = []
  const ExpressionAttributeNames = {}
  const ExpressionAttributeValues = {}
  Object.keys(postAttrs).forEach((attr) => {
    UpdateExpressionArray.push(`#${attr} = :${attr}`)
    ExpressionAttributeNames['#' + attr] = attr
    ExpressionAttributeValues[':' + attr] = postAttrs[attr]
  })
  const params = {
    TableName,
    Key: { PK, SK },
    UpdateExpression: 'SET ' + UpdateExpressionArray.join(','),
    ExpressionAttributeNames,
    ExpressionAttributeValues,
    ReturnValues: 'UPDATED_NEW'
  }
  await dynamodb.update(params).promise()
  return post
}

export default {
  getPost,
  getPosts,
  putPost,
  deletePost,
  updatePost
}
