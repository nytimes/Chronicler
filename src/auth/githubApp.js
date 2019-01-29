
import jwt from 'jsonwebtoken'
import moment from 'moment'

const auth = () => {
  const options = {
    iss: process.env.APP_IDENTIFIER,
    iat: moment().unix() ,
    exp: moment().add(10, 'minutes').unix()
  }
  return jwt.sign(options, process.env.PRIVATE_KEY, { algorithm: 'RS256' })
}

export { auth }