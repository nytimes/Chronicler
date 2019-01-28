
import jwt from 'jsonwebtoken'
import moment from 'moment'

const auth = () => {
  const options = {
    iat: moment().unix() ,
    iss: process.env.APP_IDENTIFIER,
    exp: moment().add(10, 'minutes').unix()
  }
  return jwt.sign(options, process.env.PRIVATE_KEY)
}

export { auth }