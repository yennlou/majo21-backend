import AWS from 'aws-sdk'
import { Base64 } from 'js-base64'
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
  const { id, createdAt, postType, series, ...rest } = post
  return {
    PK: id,
    SK: `createdAt:${createdAt || '1977-01-01'}`,
    GSI1: `post:${postType}`,
    GSI2: `series:${series || 'undefined'}`,
    ...rest
  }
}

function deserializePost (post) {
  const { PK, SK, GSI1, GSI2, ...rest } = post
  return {
    id: PK,
    createdAt: SK.replace('createdAt:', ''),
    postType: GSI1.replace('post:', ''),
    series: GSI2 === 'series:undefined' ? undefined : GSI2.replace('series:', ''),
    ...rest
  }
}

async function getPosts (postType = 'blog') {
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

async function getPost (id) {
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

async function putPost (post) {
  const { series } = post
  if (series) {
    await putSeries(series)
  }
  const params = {
    TableName,
    Item: serializePost(post)
  }
  await dynamodb.put(params).promise()
  return post
}

async function putPosts (posts) {
  for (const post of posts) {
    if (post.series) {
      await putSeries(post.series)
    }
  }
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

async function deletePost (id) {
  const post = await getPost(id)
  const { PK, SK } = serializePost(post)
  const params = {
    TableName,
    Key: { PK, SK }
  }
  await dynamodb.delete(params).promise()
  return post
}

async function updatePost (post) {
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

async function putSeries (seriesName) {
  const params = {
    TableName,
    Item: {
      PK: `series:${Base64.encode(seriesName)}`,
      SK: 'order:1',
      GSI1: 'series',
      seriesName
    }
  }
  await dynamodb.put(params).promise()
  return seriesName
}

async function getAllSeries () {
  const params = {
    TableName,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1 = :type',
    ExpressionAttributeValues: {
      ':type': 'series'
    }
  }
  const resp = await dynamodb.query(params).promise()
  return resp.Items.map(item => ({ id: item.PK.replace('series:', ''), series: item.seriesName }))
}

async function getPostsBySeries (series) {
  const params = {
    TableName,
    IndexName: 'GSI2',
    KeyConditionExpression: 'GSI2 = :series',
    ExpressionAttributeValues: {
      ':series': `series:${series}`
    }
  }
  const resp = await dynamodb.query(params).promise()
  return resp.Items.map(deserializePost)
}

export default {
  getPost,
  getPosts,
  putPost,
  putPosts,
  deletePost,
  updatePost,
  getAllSeries,
  getPostsBySeries
}
