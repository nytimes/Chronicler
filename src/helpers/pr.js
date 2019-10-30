import axios from 'axios'
import moment from 'moment'


class WebhookHandler {
  constructor(token) {
    this.token = token
    // github needs a user agent in the request, setting as app name
    this.userAgent = {
      'User-Agent': process.env.APP_NAME
    }
  }


  /**
   * Compares the merged time to the current time and determines if the pr was
   * merged too long ago.  PRs should be merged within 5 minutes of a webhook
   * event in order to be added to the release draft.  Prevents duplicates if
   * multiple webhook events are sent for older PRs.
   *
   * @param {String} time pr merge timestamp
   */
  isTooOld (time) {
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
  getPrData ({ pull_request, repository }) {
    return { ...pull_request, repoUrl: repository.url }
  }

  /**
   * Get the url for a specific release from ID
   * @param {Object} pr webhookpull request object
   * @param {Object} release github release object
   *
   * @returns {String}
   */
  getSingleReleaseUrl (pr, release) {
    return `${pr.repoUrl}/releases/${release.id}?access_token=${this.token}`
  }


  /**
   * Get the releases url for the github repo passed
   * @param {String} pull_request pull request object
   *
   * @returns {String}
   */
  getReleasesUrl (pr) {
    return `${pr.repoUrl}/releases?access_token=${this.token}`
  }

  /**
   * Get the formatted pull request description to add to the release draft.
   * @param {Object} pull_request pull request object from webhook event data
   *
   * @returns {String}
   */
  getPrDesc ({ number, title }) {
    return `- ${title} (#${number})`
  }

  /**
   * Update the existing release draft with the new pull request
   * @param {Object} pr webhook pull request object
   * @param {Object} release github release object
   *
   * @returns {String}
   */
  updateReleaseDraft (pr, release) {
    return `${release.body}\n${this.getPrDesc(pr)}`
  }

  /**
   * Make a request to github to edit and existing release draft
   * @param {Object} release github release object
   * @param {Object} pr webhook pull request object
   */
  editReleaseDraft (release, pr) {
    const options = {
      method: 'PATCH',
      url: this.getSingleReleaseUrl(pr, release),
      headers: this.userAgent,
      data: {
        body: this.updateReleaseDraft(pr, release) // setting to the updated body with new line
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
  createReleaseDraft (pr) {
    // line item formatted as "PR_Title (#PR_number)"
    const newRelease = {
      name: 'NEXT RELEASE',
      draft: true, // set to true so it doesn't auto publish,
      prerelease: false,
      body: this.getPrDesc(pr),
      tag_name: 'UNTAGGED'
    }

    const options = {
      method: 'POST',
      url: this.getReleasesUrl(pr),
      headers: this.userAgent,
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
  handleReleasesResponse (response, pr) {
    const {
      data
    } = response

    // the first item in the data should be the most recent release
    const release = data.length ? data[0] : null

    // if there's a release draft, append the line item
    if (release && release.draft) {
      return this.editReleaseDraft(release, pr).then(result => result)
    }

    // if there are no releases or the release is not a draft, create a new draft
    if (!release || (release && !release.draft)) {
      return this.createReleaseDraft(pr).then(result => result)
    }
  }

  handleWebhookEvent (webhookData) {
    const pr = this.getPrData(webhookData)

    if (pr.merged && !this.isTooOld(pr.merged_at)) {
      // release request options
      const options = {
        method: 'GET',
        url: this.getReleasesUrl(pr),
        headers: this.userAgent
      }

      // make request to releases endpoint
      return axios(options)
        .then(response => this.handleReleasesResponse(response, pr))
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
}

export default WebhookHandler
