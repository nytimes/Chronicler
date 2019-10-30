import test from 'ava'
import sinon from 'sinon'
import proxyquire from 'proxyquire'

let installation, axiosStub
test.beforeEach(() => {
  axiosStub = sinon.stub().resolves({
    data: {
      token: 'accesstokenfromgithub'
    }
  })
  installation = proxyquire('../src/auth/installation.js', {
    'axios': axiosStub
  })
})

test('requests bearer token with installation ID and jwt', async t => {
  const id = 5
  const req = { body: { installation: { id } } }

  t.is(await installation.auth(req, 'jwttokenstring'), 'accesstokenfromgithub')
  t.true(axiosStub.calledWith({
    url: `https://api.github.com/app/installations/${id}/access_tokens`,
    headers: {
      Authorization: 'Bearer ' + 'jwttokenstring',
      Accept: 'application/vnd.github.machine-man-preview+json'
    },
    method: 'POST'
  }))
})
