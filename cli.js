const program = require('commander')
const path = require('path')

const package = require('./package.json')
const singleOrigin = require('./single-origin')
const create = require('./lib/create')
const revert = require('./lib/revert')
const update = require('./lib/update')

const ROOT_DIR_REGEX = /<rootDir>/
const ROOT_DIR = process.cwd()

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
  ...resolveRoot(package.singleOrigin),
}

function resolveRoot(settings) {
  const resolvedSettings = {}
  const root = settings.rootDir ? `${ROOT_DIR}/${settings.rootDir}` : ROOT_DIR

  Object.keys(settings).forEach(setting => {
    switch (typeof settings[setting]) {
      case 'string': {
        resolvedSettings[setting] = normalise(resolve(root, settings[setting]))
        break
      }
      case 'object': {
        if (Array.isArray(settings[setting])) {
          resolvedSettings[setting] = settings[setting].map(location =>
            normalise(resolve(root, location))
          )
          break
        }
      }
      default:
        resolvedSettings[setting] = settings[setting]
    }
  })

  return resolvedSettings
}

function resolve(root, string) {
  return string.replace(ROOT_DIR_REGEX, root)
}

function normalise(string) {
  return path.normalize(string)
}

program
  .version(package.version)
  .option('-c, --create', 'Create your asset source map')
  .option('-u, --update', 'Update the asset source map')
  .option('-r, --revert', 'Revert your assets')
  .parse(process.argv)

if (program.create) {
  console.log('☕️ Creating asset map')
  create(
    settings.matcher,
    settings.imagePath,
    settings.ignorePaths,
    settings.symlinks,
    settings.mapFilename
  )
}

if (program.update) {
  console.log('☕️ Updating asset map')
  update(settings.imagePath, settings.mapFilename)
}

if (program.revert) {
  console.log('☕️ Reverting all changes')
  revert(settings.imagePath, settings.mapFilename)
}
