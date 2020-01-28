function buildResponse (statusCode, body) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(body)
  }
}

function success (body) {
  return buildResponse(200, body)
}

function failure (body) {
  return buildResponse(500, body)
}

module.exports = {
  buildResponse,
  success,
  failure
}
