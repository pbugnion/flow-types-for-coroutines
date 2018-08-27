//@flow

import fs from 'fs'
import path from 'path'
import os from 'os'

// The root directory from which to run the demo.
// Change this to a directory that actually exists on your computer
const rootDirectory = path.join(os.homedir(), 'test/tmp-108')

function* walkDirectories(root: string): Generator<string, void, void> {
  for (const name of fs.readdirSync(root)) {
    const filePath = path.join(root, name)
    const stat = fs.lstatSync(filePath)
    if (stat.isFile()) {
      yield filePath
    } else if (stat.isDirectory()) {
      yield* walkDirectories(filePath)
    }
  }
}

function countFilesByExtension(files: Iterator<string>): {[string]: number} {
  let total = {};
  for (const f of files) {
    const extension = path.extname(f)
    const currentCount = total[extension] || 0
    total[extension] = currentCount + 1
  }
  return total
}

console.log(
  countFilesByExtension(
    walkDirectories(rootDirectory)
  )
)

