class HTTPError extends Error {
  constructor (message) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = 500
  }
}

class Error404 extends HTTPError {
  constructor (message = '404 : Resource Not Found') {
    super(message)
    this.statusCode = 404
  }
}

class Error400 extends HTTPError {
  constructor (message = '400 : Request Is Invalid') {
    super(message)
    this.statusCode = 400
  }
}

class Error500 extends HTTPError {
  constructor (message = '500 : Server Error') {
    super(message)
    this.statusCode = 500
  }
}

export default {
  HTTPError,
  Error400,
  Error404,
  Error500
}
