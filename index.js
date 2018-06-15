#!/usr/bin/env node

const program = require('commander')
const { version } = require('./package.json')
const { settings, create, revert, update } = require('./lib/single-origin')

program
  .version(version)
  .option('-c, --create', 'Create your asset source map')
  .option('-u, --update', 'Update the asset source map')
  .option('-r, --revert', 'Revert your assets')
  .parse(process.argv)

const isDefaultCommand = !program.create && !program.update && !program.revert

if (program.create || isDefaultCommand) {
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
