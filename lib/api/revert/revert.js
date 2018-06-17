const fs = require('fs')
const rimraf = require('rimraf')

const { writeLocalMapFile } = require('../../files/write')
const { resolveRelative } = require('../../files/resolve')

module.exports = revert

function revert(imagePath, mapFilename) {
  const mapPath = resolveRelative(`${imagePath}/${mapFilename}`)
  const symlinkMap = require(mapPath)

  revertSymlinkMap(symlinkMap)
  writeLocalMapFile({}, mapPath)
}

function revertSymlinkMap(symlinkMap) {
  Object.keys(symlinkMap).forEach(key => {
    const sym = symlinkMap[key]

    sym.paths.forEach(path => {
      const isDirectory = fs.lstatSync(path).isDirectory()

      if (isDirectory) {
        rimraf.sync(path)
      } else {
        fs.unlinkSync(path)
      }

      fs.copyFileSync(sym.hashedFilePath, path)
    })

    fs.unlinkSync(sym.hashedFilePath)
    console.log(`${key}.${sym.extension} reverted successfully ✅`)
  })
}
