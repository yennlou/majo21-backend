import AWS from 'aws-sdk'
import exception from './exception'

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
    throw new exception.Error404()
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

const putPosts = async (posts) => {
  const serializedPost = posts.map(serializePost)
  const chunks =
    [...Array(Math.ceil(serializedPost.length / 25)).keys()]
      .map(idx => serializedPost.slice(idx, idx + 25))

  for (const chunk of chunks) {
    const params = {
      RequestItems: {
        [TableName]: chunk.map((post) => ({
          PutRequest: {
            Item: {
              ...post
            }
          }
        }))
      }
    }
    await dynamodb.batchWrite(params).promise()
  }
  return true
}

const deletePost = async (id) => {
  const post = await getPost(id)
  const { PK, SK } = serializePost(post)
  const params = {
    TableName,
    Key: { PK, SK }
  }
  await dynamodb.delete(params).promise()
  return post
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
  putPosts,
  deletePost,
  updatePost
}
