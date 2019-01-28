import test from 'ava'
import sinon from 'sinon'
import proxyquire from 'proxyquire'

let githubApp, signStub, momentStub
test.beforeEach(() => {
  process.env.APP_IDENTIFIER = 'MOCKED_APP_IDENTIFIER',
  process.env.PRIVATE_KEY = 'MOCKED_PRIVATE_KEY'
  signStub = sinon.stub()
  momentStub = {
    unix: sinon.stub()
  }
  momentStub.add = () => momentStub
  githubApp = proxyquire('../src/auth/githubApp.js', {
    'jsonwebtoken': {
      sign: signStub
    },
    'moment': () => momentStub
  })
})

test('calls jwt encode with iat, exp, iss', t => {
  momentStub.unix.onFirstCall().returns(1)
  momentStub.unix.onSecondCall().returns(2)
  githubApp.auth()

  t.true(signStub.calledWith({
    iat: 1,
    exp: 2,
    iss: 'MOCKED_APP_IDENTIFIER'
  }, 'MOCKED_PRIVATE_KEY'))
})
