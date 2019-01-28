import test from 'ava'
import { auth } from '../src/auth/webhook'
import { mockRequest } from './fixtures/webhook-event'

// fake request object for auth test
function Request(req) {
  if (req) {
    this.headers = req.headers
    this.body = req.body
  } else {
    this.headers = {}
  }

  this.header = function(name) {
    return this.headers[name]
  }
}

test.beforeEach(() => {
  process.env.SECRET = 'SUPER_SECRET'
})

test('should deny access to requests that do not have "x-hub-signature" header', t => {
  const authenticate = auth(new Request())

  if (authenticate.error === 403) {
    return t.pass()
  }

  return t.fail()
})

test('should deny access to requests that do not have matching authentication signatures', t => {
  const failingMock = {
    ...mockRequest,
    headers: {
      'x-hub-signature': 'FAILING_SIGNATURE'
    }
  }

  const failingAuth = auth(new Request(failingMock))

  if (failingAuth.error === 403) {
    return t.pass()
  }

  return t.fail()
})

test('should grant access to requests that have matching authentication signatures', t => {
  t.true(auth(new Request(mockRequest)))
})
