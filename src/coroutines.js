//@flow

import fs from 'fs'
import path from 'path'
import os from 'os'

function coroutine<G: Generator<any, any, any>>(
  generatorFunction: ((...args: Array<any>) => G)
) {
  return function(...args: Array<any>): G {
    const generator = generatorFunction(...args)
    generator.next()
    return generator
  }
}

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

const walkIfDirectory: (Generator<any, any, string> => Generator<void, void, string>) =
  coroutine(
    function* (target) {
      while (true) {
        const filePath: string = yield
        const stat = fs.lstat(filePath, (error, stat) => {
          if (error) {
            throw error
          }
          if (stat.isFile()) {
            target.next(filePath)
          } else if (stat.isDirectory()) {
            pushFiles(filePath, target)
          }
        })
      }
    })

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

const log: () => Generator<void, void, string> = coroutine(function* () {
  while (true) {
    const item: string = yield
    console.log(item)
  }
})


pushFiles(os.homedir(), isFile(log()))
