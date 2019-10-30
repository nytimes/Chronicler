import axios from 'axios'

const auth = async (req, jwt) => {

  const { body: { installation: { id } } } = req
  const options = {
    url: `https://api.github.com/app/installations/${id}/access_tokens`,
    headers: {
      Authorization: 'Bearer ' + jwt,
      Accept: 'application/vnd.github.machine-man-preview+json'
    },
    method: 'POST'
  }
  const { data: { token } } = await axios(options)

  return token
}

export { auth }