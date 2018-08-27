//@flow

import fs from 'fs'
import path from 'path'
import os from 'os'

// Directory to read files from
const root = os.homedir()

/** Helper method to create and initialize a coroutine.
 *
 * Before a coroutine is ready to accept data, it
 * needs to be advanced to the first `yield`. This
 * helper method creates the coroutine, advances
 * it to the first yield and returns it.
 */
function coroutine<G: Generator<any, any, any>>(
  generatorFunction: ((...args: Array<any>) => G)
) {
  return function(...args: Array<any>): G {
    const generator = generatorFunction(...args)
    generator.next()
    return generator
  }
}

/** Coroutine that reads the files within `directory` and feeds them onwards
 *
 * @param {string} directory Directory to read files from
 * @param {Coroutine} target Coroutine that accepts the files
*/
const pushFiles = function(
  directory: string,
  target: Generator<any, any, string>
): void {
  fs.readdir(
    directory,
    { encoding: 'utf-8' },
    (error, fileNames) => {
      if (error) {
        throw error
      } else {
        for (const fileName of fileNames) {
          const filePath = path.join(directory, fileName)
          target.next(filePath)
        }
      }
    }
  )
}

/** Coroutine that forwards a file path on if it is a file.
 *
 * @param {Coroutine} target Coroutine to send files to
 */
const isFile: (Generator<any, any, string> => Generator<void, void, string>) =
  coroutine(function* (target) {
    while (true) {
      const fileMaybe: string = yield
      fs.lstat(fileMaybe, (error, stat) => {
        if (error) {
          throw error
        } else if (stat.isFile()) {
          target.next(fileMaybe)
        }
      })
    }
  })

/** Coroutine that logs the information it receives */
const log: () => Generator<void, void, string> = coroutine(function* () {
  while (true) {
    const item: string = yield
    console.log(item)
  }
})


pushFiles(root, isFile(log()))
