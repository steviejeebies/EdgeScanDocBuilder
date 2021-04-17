'use strict';

const fs = require('fs');

// Directories where cache files are stored
const fileArticleCache = '/.DOCBUILD_articleCache.json';
const fileFolderCache = '/.DOCBUILD_folderCache.json';
const fileCategoryCache = '/.DOCBUILD_categoryCache.json';
const fileImageCache = '/.DOCBUILD_imageCache.json';

// These will be exported and treated as the cache at runtime.
const categoryCache = {};
const folderCache = {};
const articleCache = {};
const imageCache = {};

const promiseArray =
  [
    {dir: fileArticleCache, obj: articleCache},
    {dir: fileFolderCache, obj: folderCache},
    {dir: fileCategoryCache, obj: categoryCache},
    {dir: fileImageCache, obj: imageCache},
  ];


const argv = require('./cli');

// This shows the structure of each of the Cache objects, filled
// with dummy values.

// let freshDeskCache;
// exports.categoryCache = {
//   name: 'Document Name',
//   id: 2198791,
// };
// exports.folderCache = {
//   'Chapter 1': 12342,
//   'Chapter 2': 1342342,
// };
// // eslint-disable-next-line max-len
// exports.articleCache = {
//   'Article Name 1': {
//     id: 1234,
//     folderid: 9999,
//     lastModified: 'somedate',
//   },
//   'Article Name 2': {
//     id: 3423,
//     folderid: 9334,
//     lastModified: 'somedate',
//   },
// };


function readOrCreateFreshDeskCacheFile() {
  // make a promise to read each of the directories in
  // the promiseArray array.
  return Promise.allSettled(
    promiseArray.map(file => fs.promises.readFile(argv.source + file.dir)))
    .then(results => {
      results.forEach((result, num) => {
        if (result.status === 'fulfilled') {
          // If successful read, then we set the value of the cache
          // object (which we have references as 'obj' for each element
          // of the promise array) to the value of the result of this promise
          Object.assign(promiseArray[num].obj, JSON.parse(result.value));
        }
        // If the promise was not fulfilled (i.e. no file found), then
        // we don't need to do anything, since the cache objects are
        // already initialized to {}.
      });
    });
}

function updateFreshDeskCacheFile() {
  let promises = promiseArray.map(file =>
    fs.promises.writeFile(
      argv.source + file.dir, JSON.stringify(file.obj, null, 4)));

  // This returns a promise, but we can just ignore this promise
  // since we don't have much of a use for it in FreshDesk.js. As
  // long as the writes are carried out, there's no problem.

  return Promise.allSettled(promises)
    .then(results => {
      results.forEach((result, num) => {
        if (result.status === 'rejected') {
          // We're not interested in if the promise to write
          // a file was fulfilled, but if it is rejected then
          // we need to output a useful error message
          throw new Error(
            `Could not store FreshDesk cache file to 
            ${promiseArray[num].dir} : ${result.reason}`,
          );
        }
      });
    });
}

module.exports = {
  readOrCreateFreshDeskCacheFile,
  updateFreshDeskCacheFile,
  categoryCache,
  folderCache,
  articleCache,
  imageCache,
};
