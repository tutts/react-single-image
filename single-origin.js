const { singleOrigin } = require('./package.json')
const create = require('./lib/api/create')
const revert = require('./lib/api/revert')
const update = require('./lib/api/update')
const { resolveRoot } = require('./lib/files/resolve')

// CONFIG
const defaultSettings = {
  symlinks: true,
  ignorePaths: ['./node_modules/**', './images'],
  imageDir: './images',
  matcher: './**/*.png',
  mapFilename: 'map.json',
}

const settings = {
  ...defaultSettings,
  ...resolveRoot(singleOrigin || {}),
}

module.exports = {
  settings,
  create,
  revert,
  update,
}
