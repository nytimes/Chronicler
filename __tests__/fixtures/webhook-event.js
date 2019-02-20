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
    'x-hub-signature': 'sha1=0885db6c82d3741dfeec285acf3566e20b8db6f9'
  }
}

export default webhook
