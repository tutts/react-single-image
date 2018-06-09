const path = require('path')

const ROOT_DIR_REGEX = /<rootDir>/
const ROOT_DIR = process.cwd()

module.exports = {
  resolveRoot,
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
