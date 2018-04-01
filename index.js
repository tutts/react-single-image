const path = require('path')
const glob = require('glob')
const fs = require('fs')
const uuidv1 = require('uuid/v1')
var crypto = require('crypto')

const GLOBAL_IMAGE_DIR = './example/RNSingleOrigin/images'
const GLOBAL_MAP_DIR = GLOBAL_IMAGE_DIR + '/map.json'
const SYMLINK_MAP = require(GLOBAL_MAP_DIR)
const SYMLINK_MAP_PATHS = cachedSymlinks(SYMLINK_MAP)
const GLOB_OPTIONS = {
  ignore: [
    './node_modules/**',
    './example/RNSingleOrigin/node_modules/**',
    './example/RNSingleOrigin/android/**',
    './example/RNSingleOrigin/ios/**',
    `${GLOBAL_IMAGE_DIR}/**`,
    ...SYMLINK_MAP_PATHS,
  ],
  symlinks: SYMLINK_MAP_PATHS,
}

main()

function main() {
  console.log('Starting Single Origin search...')

  glob('./**/*.png', GLOB_OPTIONS, (err, files) => {
    const filePaths = files.map(file => readFile(file))
    const symlinkMap = generateSymlinkMap(filePaths, SYMLINK_MAP)

    symlinkFiles(symlinkMap)
    writeLocalMapFile(symlinkMap)
  })
}

function generateSymlinkMap(symLinkFilePaths, cachedMap) {
  let cachedMapCopy = { ...cachedMap }

  symLinkFilePaths.forEach(symMap => {
    const extension = symMap.path.split('.').pop()
    const hashedFilePath = `${GLOBAL_IMAGE_DIR}/${symMap.checksum}.${extension}`

    if (!cachedMapCopy[symMap.checksum]) {
      // add to symMap, move file and create Symlink
      cachedMapCopy[symMap.checksum] = {
        paths: [symMap.path],
        hashedFilePath,
        extension,
      }
    } else {
      // link to already made - remove file and create Symlink
      cachedMapCopy[symMap.checksum].paths.push(symMap.path)
    }
  })

  return cachedMapCopy
}

function symlinkFiles(symlinkMap) {
  Object.keys(symlinkMap).forEach(key => {
    const sym = symlinkMap[key]

    fs.copyFile(sym.paths[0], sym.hashedFilePath, () => {
      sym.paths.forEach(filePath => {
        fs.unlink(filePath, () => {
          fs.symlinkSync(path.resolve(sym.hashedFilePath), filePath)
        })
      })
    })
  })
}

function writeLocalMapFile(symlinkMap) {
  fs.writeFile(GLOBAL_MAP_DIR, JSON.stringify(symlinkMap), err => {
    if (err) {
      return console.log(err)
    }

    console.log('Asset map updated')
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

function cachedSymlinks(symlinkMap) {
  return Object.entries(symlinkMap).reduce((prev, next) => prev.concat(next[1].paths), [])
}
