# Chronicler ![](https://travis-ci.org/NYTimes/Chronicler.svg?branch=master "Build status")

Chronicler is an open source node.js app that automates your repo's release notes.  Chronicler will listen for pull request events from GitHub Webhooks.  When a pull request is merged Chronicler will create a new release draft OR edit an existing one with the PR info.  The result is a neatly formatted release note draft listing all PRs merged since your last tagged release.

Read more in the [Times Open blog post](https://open.nytimes.com/open-source-automating-release-notes-in-github-dd08f964465c).

### How it Works
Chronicler receives GitHub Webhook events from the repository you hook it up to.  By listening for pull request events, Chronicler can watch for merged PRs and add them to release note drafts.  When a PR is merged Chronicler will either create a new release draft or edit an existing draft.  If a note draft does not already exist a new, untagged draft will be created titled `NEXT RELEASE` with the PR info as the body content.  If a draft does exist it will append the PR to it.  The draft body consists of a list of pull requests with the PR title and number:

Pull Request format
```
- PR title (#PR_Number)
```

Draft Example
```
- Adds README documentation for Chronicler (#3)
- Formats PR info for draft body (#11)
- Adds contributing guidelines (#14)
```

## Getting Started
Chronicler is a simple express.js app that receives GitHub Webhook events via its `/webhooks` route.  You'll need to clone and set the app up on a server or cloud service (e.x. Google Cloud Platform, AWS, Digital Ocean) to use it for your own projects.

### Environment Variables
The following variables must be set up and available to Chronicler via the node.js `process.env` object.
It is possible to run both as a Github app or as an individual user.
To run as a Github app: SET AUTH_AS_APP=true and PRIVATE_KEY, APP_IDENTIFIER and SECRET to their respective values. GH_TOKEN can then be omitted.
To run the service as a user: SET GH_TOKEN and SECRET to their respective values. AUTH_AS_APP and PRIVATE_KEY, APP_IDENTIFIER can then be omitted.

**Variable Name** | **Description** | **Default**
--- | --- | :---:
`SECRET` (required) | The GitHub Webhook secret passed along with every Webhooks request.  Allows your app to authenticate the request and make sure the request is coming from a trusted source.  Generate a [random string with high entropy](https://developer.github.com/webhooks/securing/#setting-your-secret-token) for your secure secret or create one using an online [generator](https://randomkeygen.com/). | -
`AUTH_AS_APP` (required if github app)| Whether to authenticate as a Github app | false
`PRIVATE_KEY` (required if github app)| The private key belonging to the Github app, listed under basic information about the app | -
`APP_IDENTIFIER` (required if github app)| The unique identifier for the Github app, listed under basic information about the app | -
`GH_TOKEN` (required if set as a user)| The Github [personal access token](https://github.com/settings/tokens) to use for this app.  Used for authentication when making calls to the GitHub API. | -
`APP_NAME` (optional) | Name of the app to send as the `User-Agent` value in the API requests. | `Chronicler`
`PORT` (optional) | App port. | `8080`

### Setup as Github app

#### Creating the app
A Github app can be created on both a user and an organization. The latter is recommended when working together with a team whose members might change. Thus the service is uncoupled from a specific user that might leave.
To set it up, go to https://github.com/organizations/`<organization>`/settings/apps and create new. Fill out the required fields and give it the following permissions:

1. Repository contents **Read & Write**
2. Repository metadata **Read**
3. Pull requests **Read**
    - Subscribe to events: Pull Requests

When created, go to the general-tab for the app and collect set the **Webhook secret (SECRET)** the **PRIVATE_KEY** and **APP_IDENTIFIER** to be set in your environment.

Lastly. Install the app on your organization/repository through the organization/repository settings

### Setup as User

##### A Note on Personal Access Tokens
When setting up Chronicler as a user it requires a personal access token (PAT) to create or edit a release draft via the GitHub API.  PATs are tied to a user's account.  For GitHub teams or organizations using Chronicler we reccommend creating a dedicated GitHub account that owns the PAT.  By creating the PAT with a dedicated GitHub account instead of with a team member's account, you can avoid interuptions to Chronicler if the team member leaves or is removed from the organization.

To generate a new PAT for Chronicler, go to your [account settings](https://github.com/settings/tokens/new).  Add a "token description" (e.x "chronicler-app") and grant it `repo` scope.

![Image of PAT access scope](docs/pat-scope.png)

#### Enabling Webhooks for your Repository
With Chronicler set up on your environment, you can now set your repo up with Webhooks.

1. From your repo page, click on the "Settings" tab.
2. On the left hand side, click the "Webhooks" menu item.
3. Click the "Add Webhook" button.
4. Add the url where your instance of Chronicler can be found with the `webhooks` path (e.x. `http://your.domain.com/webhooks`).
5. From the "Content Type" dropdown menu, select `application/json`.
6. Set the "Secret" field equal to the `SECRET` environment variable value created earlier.
7. Under "Which events would you like to trigger this webhook?" check off the "Let me select individual events" option.  This will expand the event options where you should select "Release" and "Pull Request."
8. Ensure that "Active" is checked off, and click "Add webhook" at the bottom of the form.
9. Celebrate :tada: You're now ready to start using Chronicler to automate your repository's release notes!

### How to contribute
Pull requests, issues, and feature requests always welcome! Read the [contributing guide](docs/CONTRIBUTING.md) for information on how to get started.
