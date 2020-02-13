import exception from './exception'
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

function failure (body, statusCode = 500) {
  return buildResponse(statusCode, body)
}

function handleException (e) {
  if (e instanceof exception.HTTPError) {
    return failure({
      message: e.message
    }, e.statusCode)
  }
}

export {
  buildResponse,
  handleException,
  success,
  failure
}
