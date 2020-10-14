import test from 'ava'
import webhookData from '../fixtures/webhook-event'
import { drafts } from '../fixtures/releases'
import {
  isTooOld,
  getReleasesUrl,
  getSingleReleaseUrl,
  getPrDesc,
  getPrData,
  updateReleaseDraft
} from '../src/helpers/pr'

const pr = getPrData(webhookData)
const draft = drafts[0]

test.beforeEach(() => {
  process.env.GH_TOKEN = 'MOCK_TOKEN'
})

test('isTooOld returns true if PR was merged more than 5 minutes ago', t => {
  t.true(isTooOld(pr.merged_at))
})

test('isTooOld returns false if PR was merged within 5 minutes', t => {
  // the current time
  t.false(isTooOld(new Date()))
})

test('getReleasesUrl returns the url for the github repo releases endpoint', t => {
  const expected =
    'https://api.github.com/repos/NYTimes/Chronicler/releases'

  t.is(getReleasesUrl(pr), expected)
})

test('getSingleReleaseUrl returns the github release url for a given release id', t => {
  const expected =
    'https://api.github.com/repos/NYTimes/Chronicler/releases/9797693'

  t.is(getSingleReleaseUrl(pr, draft), expected)
})

test('getPrDesc should return the formatted description for a pull request with title and number', t => {
  const expected = '- Update README.md (#16)'

  t.is(getPrDesc(pr), expected)
})

test('getPrData should return a pull request object with the repository url', t => {
  if (!pr.repoUrl) {
    return t.fail()
  }

  return t.pass()
})

test('updateReleaseDraft should append the pull request title and number to existing draft', t => {
  const expect =
    '- Title Change (#4) - Give Props (#3) - Test permissions (#6) - Another Permissions test (#7) - Update README.md (#10) - Update README.md (#12) - Update README.md (#13) - Update README.md (#14) - Update README.md (#15) - Update README.md (#16) - Update README.md (#16) - Add webhook url to readme (#5)\n- Update README.md (#16)'
  t.is(updateReleaseDraft(pr, draft), expect)
})

test.todo(
  'handleReleasesResponse calls editReleaseDraft if there is an existing release draft'
)

test.todo(
  'handleReleasesResponse calls createReleaseDraft if there is an existing release draft'
)
