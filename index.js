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
    `${GLOBAL_IMAGE_DIR}/**`,
  ],
}

let symlinkMap = require('./example/RNSingleOrigin/images/.asset-map.json')

main()

function main() {
  console.log('Starting Single Origin search...')
  symlinkMap = symlinkMap ? symlinkMap : {}
  findFiles()
}

function findFiles() {
  glob('./**/*.png', GLOB_OPTIONS, (err, files) => {
    const mappedFiles = files.map(file => readFile(file))
    manageSymlinkMap(mappedFiles)
  })
}

function manageSymlinkMap(symMaps) {
  symMaps.forEach(symMap => {
    const extension = symMap.path.split('.').pop()
    const hashedFilePath = `${GLOBAL_IMAGE_DIR}/${symMap.checksum}.${extension}`

    if (!symlinkMap[symMap.checksum]) {
      // add to symMap, move file and create Symlink
      symlinkMap[symMap.checksum] = {
        paths: [symMap.path],
        hashedFilePath,
        extension,
      }
    } else {
      // link to already made - remove file and create Symlink
      symlinkMap[symMap.checksum].paths.push(symMap.path)
    }
  })

  Object.keys(symlinkMap).forEach(key => {
    const sym = symlinkMap[key]

    fs.copyFile(sym.paths[0], sym.hashedFilePath, () => {
      sym.paths.forEach(filePath => {
        fs.unlink(filePath, () => {
          addSymlink(path.resolve(sym.hashedFilePath), filePath)
        })
      })
    })
  })
}

function addSymlink(file, symLink) {
  fs.symlinkSync(file, symLink)
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
