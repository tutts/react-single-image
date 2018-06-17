const fs = require('fs')

module.exports = {
  writeLocalMapFile,
}

function writeLocalMapFile(symlinkMap, mapPath) {
  fs.writeFile(mapPath, JSON.stringify(symlinkMap), err => {
    if (err) {
      return console.log(err)
    }

    console.log('Asset map updated')
  })
}
