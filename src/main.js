import express from 'express'
import bodyParser from 'body-parser'
import * as webhook from './auth/webhook'
import * as githubApp from './auth/githubApp'
import * as installation from './auth/installation'
import WebhookHandler from './helpers/pr'

const app = express()
const PORT = process.env.PORT || 8080

app.use(bodyParser.json())

// health check endpoint
app.get('/ping', (req, res) => {
  return res.status(200).send('OK')
})

app.post('/webhooks', async (req, res) => {
  // authenticate request
  const authentication = webhook.auth(req)
  if (authentication.error) {
    return res.status(authentication.error).send(authentication)
  }
  let token
  if (process.env.AUTH_AS_APP) {
    const appJwt = githubApp.auth()
    token = await installation.auth(req, appJwt)
  } else {
    token = process.env.GH_TOKEN
  }
  const handler = new WebhookHandler(token)
  return handler.handleWebhookEvent(req.body)
    .then(result => {
      if (result && result.error) {
        return Promise.reject(result.error)
      }

      return res.status(200).send('Webhooks')
    })
    .catch(error => {
      console.error(error)

      return res.status(500).send(error)
    })
})

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`)
})
