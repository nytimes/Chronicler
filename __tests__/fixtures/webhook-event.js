/* Mock github webhook event payload */
const webhook = {
  pull_request: {
    number: 16,
    title: 'Update README.md',
    body: '',
    merged_at: '2018-03-23T21:57:30Z',
    merged: true
  },
  repository: {
    url: 'https://api.github.com/repos/nytm/trex-release-drafts'
  }
}

export const mockRequest = {
  body: webhook,
  headers: {
    // fake signature to mock request header
    'x-hub-signature': 'sha1=d0637860fad3e6eb0a13c6c23cf51403d930b710'
  }
}

export default webhook
