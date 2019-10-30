import crypto from 'crypto'

const AUTH_HEADER = 'x-hub-signature'

/**
 * Validate payloads from Github
 * https://developer.github.com/webhooks/securing/#validating-payloads-from-github
 *
 * @param req Webhook request object received from GitHub
 */
const auth = req => {
  const hubSig = req.header(AUTH_HEADER)

  if (!hubSig) {
    return {
      error: 403,
      message: 'Authentication header missing. Access denied.'
    }
  }

  const blob = JSON.stringify(req.body)
  const hmac = crypto.createHmac('sha1', process.env.SECRET)
  const appSig = `sha1=${hmac.update(blob).digest('hex')}`
  const appBuffer = Buffer.from(appSig, 'utf8')
  const hubBuffer = Buffer.from(hubSig, 'utf8')

  try {
    const safe = crypto.timingSafeEqual(appBuffer, hubBuffer)

    if (safe) {
      return true
    }
  } catch (error) {
    return {
      error: 403,
      message: 'Authentication failed. Access denied.'
    }
  }
}

export { auth }
