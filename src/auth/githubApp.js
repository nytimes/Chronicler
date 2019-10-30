
import jwt from 'jsonwebtoken'
import moment from 'moment'
import fs from 'fs'

const PRIVATE_KEY = fs.readFileSync('/run/secrets/private-key', 'utf8')

const auth = () => {
  const options = {
    iss: process.env.APP_IDENTIFIER,
    iat: moment().unix() ,
    exp: moment().add(10, 'minutes').unix()
  }
  return jwt.sign(options, PRIVATE_KEY, { algorithm: 'RS256' })
}

export { auth }