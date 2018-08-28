//@flow

import fs from "fs";
import path from "path";
import os from "os";

// The root directory from which to run the demo.
// Change this to a directory that actually exists on your computer
const rootDirectory = os.homedir();

/** Recursively walk directories.
 *
 * Returns an iterator of paths to files located below the
 * directory passed as argument.
 *
 * @param {string} root Directory to start walking from.
 * @return {Gernator<string, void, void>} Generator of file paths below root.
 */
function* walkDirectories(root: string): Generator<string, void, void> {
  for (const name of fs.readdirSync(root)) {
    const filePath = path.join(root, name);
    const stat = fs.lstatSync(filePath);
    if (stat.isFile()) {
      yield filePath;
    } else if (stat.isDirectory()) {
      yield* walkDirectories(filePath);
    }
  }
}

/** Count the number of files by extension.
 *
 * @param {Iterator<string>} files Iterator of file names
 * @return {Object} Map of extension to the number of times this extension occurs
 */
function countFilesByExtension(files: Iterator<string>): { [string]: number } {
  let total = {};
  for (const f of files) {
    const extension = path.extname(f);
    const currentCount = total[extension] || 0;
    total[extension] = currentCount + 1;
  }
  return total;
}

console.log(countFilesByExtension(walkDirectories(rootDirectory)));
