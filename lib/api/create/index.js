const path = require('path')
const glob = require('glob')
const fs = require('fs')
const uuidv1 = require('uuid/v1')
const crypto = require('crypto')
const rimraf = require('rimraf')

const { writeLocalMapFile } = require('../../files/write')

module.exports = create

function create(matcher, imagePath, ignorePaths, symlinks, mapFilename) {
  const mapPath = `${imagePath}/${mapFilename}`
  const existingMap = require(mapPath)
  const symPaths =
    typeof existingMap === 'object' ? cachedSymlinks(existingMap) : []
  const options = {
    ignore: [`${imagePath}/**`, ...ignorePaths, ...symPaths],
    symlinks: symPaths,
    absolute: true,
  }

  glob(matcher, options, (err, files) => {
    if (err) {
      return console.log('ERR:INIT', err)
    }

    const filePaths = files.map(file => readFile(file))
    const symlinkMap = generateSymlinkMap(filePaths, existingMap, imagePath)
    const linkMethod = symlinks ? fs.symlinkSync : createReferenceFolder

    symlinkFiles(symlinkMap, linkMethod)
    writeLocalMapFile(symlinkMap, mapPath)
  })
}

function createReferenceFolder(newPath, originalPath) {
  const relativePath = path.relative(originalPath, newPath)

  fs.mkdir(originalPath, err => {
    if (err && err.code !== 'EEXIST') {
      return console.log(err)
    }

    fs.writeFile(
      `${originalPath}/index.js`,
      `export default require('${relativePath}')`,
      indexErr => {
        if (indexErr) {
          return console.log(indexErr)
        }
      }
    )
  })
}

function generateSymlinkMap(symLinkFilePaths, cachedMap, assetDirectory) {
  let cachedMapCopy = { ...cachedMap }

  symLinkFilePaths.forEach(symMap => {
    const extension = symMap.path.split('.').pop()
    const hashedFilePath = `${assetDirectory}/${symMap.checksum}.${extension}`

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

function symlinkFiles(symlinkMap, linkMethod) {
  Object.keys(symlinkMap).forEach(key => {
    const sym = symlinkMap[key]

    fs.copyFile(sym.paths[0], sym.hashedFilePath, () => {
      sym.paths.forEach(filePath => {
        fs.unlink(filePath, () => {
          linkMethod(path.resolve(sym.hashedFilePath), filePath)
        })
      })
    })
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
  return Object.entries(symlinkMap).reduce(
    (prev, next) => prev.concat(next[1].paths),
    []
  )
}
