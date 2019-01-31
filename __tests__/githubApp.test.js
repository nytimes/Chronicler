import test from 'ava'
import sinon from 'sinon'
import proxyquire from 'proxyquire'

let githubApp, signStub, momentStub
test.beforeEach(() => {
  process.env.APP_IDENTIFIER = 'MOCKED_APP_IDENTIFIER'
  const fs = {
    readFileSync: sinon.stub().returns('MOCKED_PRIVATE_KEY')
  }
  signStub = sinon.stub().returns('jwt123')
  momentStub = {
    unix: sinon.stub()
  }
  momentStub.add = () => momentStub
  githubApp = proxyquire('../src/auth/githubApp.js', {
    'jsonwebtoken': {
      sign: signStub
    },
    'moment': () => momentStub,
    'fs': fs
  })
})

test('calls jwt encode with iat, exp, iss', t => {
  momentStub.unix.onFirstCall().returns(1)
  momentStub.unix.onSecondCall().returns(2)
  t.is(githubApp.auth(), 'jwt123')

  t.true(signStub.calledWith({
    iss: 'MOCKED_APP_IDENTIFIER',
    iat: 1,
    exp: 2,
  }, 'MOCKED_PRIVATE_KEY', {
    algorithm: 'RS256'
  }))
})
