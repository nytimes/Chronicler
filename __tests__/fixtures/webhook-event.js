/* Mock github webhook event payload */
const webhook = {
  pull_request: {
    number: 16,
    title: 'Update README.md',
    body: '',
    merged_at: '2018-03-23T21:57:30Z',
    merged: true,
    user: {
      login: 'Booger'
    }
  },
  repository: {
    url: 'https://api.github.com/repos/NYTimes/Chronicler'
  }
}

export const mockRequest = {
  body: webhook,
  headers: {
    // fake signature to mock request header
    'x-hub-signature': 'sha1=52c4274a1ade797a06044f73499fd46c0e5d6ecd'
  }
}

export default webhook
