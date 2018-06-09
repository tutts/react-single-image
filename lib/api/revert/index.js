const fs = require('fs')
const rimraf = require('rimraf')

const { writeLocalMapFile } = require('../../files/write')

module.exports = revert

function revert(imagePath, mapFilename) {
  const mapPath = `${imagePath}/${mapFilename}`
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

    fs.unlink(sym.hashedFilePath, err => {
      if (err) {
        console.log(`${key}.${sym.extension} failed reverted ❌`)
      }

      console.log(`${key}.${sym.extension} reverted successfully ✅`)
    })
  })
}
