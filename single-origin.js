const path = require('path')
const glob = require('glob')
const fs = require('fs')
const uuidv1 = require('uuid/v1')
const crypto = require('crypto')

const MAP_DIR = '/map.json'

module.exports = {
  create,
  // update,
  // revert,
}

function create(matcher, assetDirectory, ignorePaths, isSymlink) {
  const symlinkMap = require(assetDirectory + MAP_DIR)
  const options = {
    ignore: ignorePaths,
    symlinks: cachedSymlinks(symlinkMap),
  }

  glob(matcher, options, (err, files) => {
    if (err) {
      return console.log('ERR:INIT', err)
    }

    const filePaths = files.map(file => readFile(file))
    const symlinkMap = generateSymlinkMap(filePaths, symlinkMap, assetDirectory)
    const linkMethod = isSymlink ? fs.symlinkSync : createReferenceFolder

    symlinkFiles(symlinkMap, linkMethod)
    writeLocalMapFile(symlinkMap, assetDirectory)
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

function revertSymlinkMap(symlinkMap) {
  Object.keys(symlinkMap).forEach(key => {
    const sym = symlinkMap[key]

    sym.paths.forEach(path => {
      fs.unlinkSync(path)
      fs.copyFileSync(sym.hashedFilePath, path)
    })

    fs.unlink(sym.hashedFilePath, err => {
      if (err) {
        console.log(`${key}.${sym.extension} failed reverted ❌`)
      }

      console.log(`${key}.${sym.extension} reverted successfully ✅`)
    })
  })

  writeLocalMapFile({})
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

function writeLocalMapFile(symlinkMap, assetDirectory) {
  fs.writeFile(assetDirectory, JSON.stringify(symlinkMap), err => {
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
  return Object.entries(symlinkMap).reduce(
    (prev, next) => prev.concat(next[1].paths),
    []
  )
}
