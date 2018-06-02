const program = require('commander')
const package = require('./package.json')
const singleOrigin = require('./single-origin')

// CONFIG
const defaultSettings = {
  symlinks: true,
  ignore: ['./node_modules/**', './images'],
  imageDir: './images',
  matcher: './**/*.png',
  mapFilename: '/map.json',
}
const settings = {
  ...defaultSettings,
  ...require('./example/RNSingleOrigin/package.json').singleOrigin,
}

program
  .version(package.version)
  .option('-c, --create', 'Create your asset source map')
  .option('-u, --update', 'Update the asset source map')
  .option('-r, --revert', 'Revert your assets')
  .parse(process.argv)

if (program.create) {
  console.log('☕️ Creating asset map')
  singleOrigin.create(
    settings.matcher,
    settings.imagePath,
    settings.ignorePaths,
    settings.symlinks,
    settings.mapFilename
  )
}

if (program.update) {
  console.log('☕️ Updating asset map')
  singleOrigin.update()
}

if (program.revert) {
  console.log('☕️ Reverting all changes')
  singleOrigin.revert(settings.imagePath, settings.mapFilename)
}
