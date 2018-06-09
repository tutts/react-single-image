const fs = require('fs')

const { writeLocalMapFile } = require('../../files/write')

module.exports = update

function update(imagePath, mapFilename) {
  const mapPath = `${imagePath}/${mapFilename}`
  const symlinkMap = require(mapPath)

  const updatedMap = updateSymlinkMap(symlinkMap)
  writeLocalMapFile(updatedMap, mapPath)
}

function updateSymlinkMap(symlinkMap) {
  let cachedMapCopy = { ...symlinkMap }
  const orphans = []

  Object.keys(symlinkMap).forEach(sha => {
    cachedMapCopy[sha].paths = cachedMapCopy[sha].paths.filter(path =>
      fs.existsSync(path)
    )

    if (!cachedMapCopy[sha].paths.length) {
      orphans.push(sha)
    }
  })

  orphans.forEach(orphan => {
    fs.unlinkSync(cachedMapCopy[orphan].hashedFilePath)
    delete cachedMapCopy[orphan]
  })

  return cachedMapCopy
}
