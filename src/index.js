/* eslint-disable no-global-assign */
require = require('esm')(module)
const chronicler = require('./router')
module.exports.chronicler = chronicler.app

if (require.main === module) {
  chronicler.start()
}
