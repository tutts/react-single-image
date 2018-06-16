const create = require('./api/create')
const revert = require('./api/revert')
const update = require('./api/update')
const { resolveRoot, resolvePackageJson } = require('./files/resolve')

const { singleOrigin } = resolvePackageJson()

// CONFIG
const defaultSettings = {
  symlinks: true,
  ignorePaths: ['./node_modules/**', './images'],
  imagePath: './images',
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
