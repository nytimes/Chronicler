import axios from 'axios'
import moment from 'moment'

// github needs a user agent in the request, setting as app name
const userAgent = {
  'User-Agent': process.env.APP_NAME
}

/**
 * Compares the merged time to the current time and determines if the pr was
 * merged too long ago.  PRs should be merged within 5 minutes of a webhook
 * event in order to be added to the release draft.  Prevents duplicates if
 * multiple webhook events are sent for older PRs.
 *
 * @param {String} time pr merge timestamp
 */
export const isTooOld = time => {
  const now = moment()
  const mergedAt = moment(time)
  const diff = now.diff(mergedAt, 'minutes')

  return diff > 5
}

/**
 * Create a pull request object that includes repository url
 * @param {Object} param0 webhook event data payload
 *
 * @returns {Object}
 */
export const getPrData = ({ pull_request, repository }) => ({
  ...pull_request,
  repoUrl: repository.url
})

/**
 * Get the url for a specific release from ID
 * @param {Object} pr webhookpull request object
 * @param {Object} release github release object
 *
 * @returns {String}
 */
export const getSingleReleaseUrl = (pr, release) =>
  `${pr.repoUrl}/releases/${release.id}?access_token=${process.env.GH_TOKEN}`

/**
 * Get the releases url for the github repo passed
 * @param {String} pull_request pull request object
 *
 * @returns {String}
 */
export const getReleasesUrl = pr =>
  `${pr.repoUrl}/releases?access_token=${process.env.GH_TOKEN}`

/**
 * Get the formatted pull request description to add to the release draft.
 * @param {Object} pull_request pull request object from webhook event data
 *
 * @returns {String}
 */
export const getPrDesc = ({ number, title, user }) => `- ${title} (#${number}) ${user.login}`

/**
 * Update the existing release draft with the new pull request
 * @param {Object} pr webhook pull request object
 * @param {Object} release github release object
 *
 * @returns {String}
 */
export const updateReleaseDraft = (pr, release) =>
  `${release.body}\n${getPrDesc(pr)}`

/**
 * Make a request to github to edit and existing release draft
 * @param {Object} release github release object
 * @param {Object} pr webhook pull request object
 */
export const editReleaseDraft = (release, pr) => {
  const options = {
    method: 'PATCH',
    url: getSingleReleaseUrl(pr, release),
    headers: userAgent,
    data: {
      body: updateReleaseDraft(pr, release) // setting to the updated body with new line
    }
  }

  // make PATCH request to create new release
  return axios(options)
    .then(result => {
      if (result.status !== 200) {
        return Promise.reject(result.data.message)
      }
    })
    .catch(error => {
      return {
        error: `${error.response.status} Could not edit release draft: ${
          error.response.data.message
        }`
      }
    })
}

/**
 * Create a new release draft using the pull request data
 * @param {Object} pr webhook pull request object
 */
export const createReleaseDraft = pr => {
  // line item formatted as "PR_Title (#PR_number)"
  const newRelease = {
    name: 'NEXT RELEASE',
    draft: true, // set to true so it doesn't auto publish,
    prerelease: false,
    body: getPrDesc(pr),
    tag_name: 'UNTAGGED'
  }

  const options = {
    method: 'POST',
    url: getReleasesUrl(pr),
    headers: userAgent,
    data: newRelease
  }

  return axios(options)
    .then(result => {
      if (result.status !== 201) {
        return Promise.reject(result.data.message)
      }
    })
    .catch(error => {
      return {
        error: `${error.response.status} Could not create release draft: ${
          error.response.data.message
        }`
      }
    })
}

/**
 * Handle the releases endpoint response by either creating a new release draft
 * if no draft exists or editing the existing draft.
 *
 * @param {Object} response releases response object
 * @param {Object} pr github pull request object
 */
export const handleReleasesResponse = (response, pr) => {
  const { data } = response

  // the first item in the data should be the most recent release
  const release = data.length ? data[0] : null

  // if there's a release draft, append the line item
  if (release && release.draft) {
    return editReleaseDraft(release, pr).then(result => result)
  }

  // if there are no releases or the release is not a draft, create a new draft
  if (!release || (release && !release.draft)) {
    return createReleaseDraft(pr).then(result => result)
  }
}

export const handleWebhookEvent = webhookData => {
  const pr = getPrData(webhookData)

  if (pr.merged && !isTooOld(pr.merged_at) && pr.base.ref == 'master') {
    // release request options
    const options = {
      method: 'GET',
      url: getReleasesUrl(pr),
      headers: userAgent
    }

    // make request to releases endpoint
    return axios(options)
      .then(response => handleReleasesResponse(response, pr))
      .then(results => results)
      .catch(err => {
        return {
          error: `${
            err.response.status
          } Request to GitHub releases endpoint failed. ${
            err.response.data.message
          }`
        }
      })
  }

  return Promise.resolve(true)
}

export default handleWebhookEvent
