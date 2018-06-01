const program = require('commander')

const package = require('./package.json')
const singleOrigin = require('./single-origin')

// CONFIG
const GLOBAL_IMAGE_DIR = './example/RNSingleOrigin/images'
const REGEX = './**/*.png'

const defaultSettings = { symlinks: true }
const settings = { ...defaultSettings, ...require('./example/RNSingleOrigin/package.json').singleOrigin }

program
  .version(package.version)
  .option('-c, --create', 'Create your asset source map')
  .option('-u, --update', 'Update the asset source map')
  .option('-r, --revert', 'Revert your assets')
  .parse(process.argv)
 
if (program.create) {
    console.log('☕️ Creating asset map')
    singleOrigin.create(REGEX, GLOBAL_IMAGE_DIR, settings.symlinks)
}

if (program.update) {
    console.log('☕️ Updating asset map')
    singleOrigin.update()
}

if (program.revert) {
    console.log('☕️ Reverting all changes')
    singleOrigin.revert()
}