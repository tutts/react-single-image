const path = require('path')
const glob = require('glob')
const fs = require('fs')
const uuidv1 = require('uuid/v1')
var crypto = require('crypto')

const GLOBAL_IMAGE_DIR = './example/RNSingleOrigin/images'
const GLOB_OPTIONS = {
  ignore: [
    './node_modules/**',
    './example/RNSingleOrigin/node_modules/**',
    './example/RNSingleOrigin/android/**',
    './example/RNSingleOrigin/ios/**',
  ],
}

let symlinkMap = require('./example/RNSingleOrigin/images/.asset-map.json')

main()

function main() {
  console.log('Starting Single Origin search...')
  //findFiles()
  fs.symlink('./example/single-origin-test.png', './single-origin-test-sym.png', res => {
    console.log(res)
  })
}

function findFiles() {
  glob('./**/*.png', GLOB_OPTIONS, (err, files) => {
    const mappedFiles = files.map(file => readFile(file))
    manageSymlinkMap(mappedFiles)
  })
}

function manageSymlinkMap(symMaps) {
  symMaps.forEach(symMap => {
    if (!symlinkMap[symMap.checksum]) {
      // add to symMap, move file and create Symlink
      const hashedFilePath = `${GLOBAL_IMAGE_DIR}/${symMap.checksum}.${symMap.path.split('.').pop()}`

      fs.rename(symMap.path, hashedFilePath, () => {
        addSymlink(hashedFilePath, symMap.path)
      })

      symlinkMap[symMap.checksum] = {
        paths: [symMap.path],
        hashedFilePath,
      }
    } else {
      // link to already made - remove file and create Symlink
      symlinkMap[symMap.checksum].paths.push(symMap.path)
    }
  })
}

function addSymlink(file, symLink) {
  console.log('addSymlink:', file)

  fs.symlink(file, symLink, res => {
    console.log('Added a Symlink for:', symLink)
  })
}

function readFile(path) {
  const cs = checksum(fs.readFileSync(path))

  return {
    path,
    checksum: cs,
  }
}

function checksum(str) {
  return crypto
    .createHash('md5')
    .update(str)
    .digest('hex')
}
