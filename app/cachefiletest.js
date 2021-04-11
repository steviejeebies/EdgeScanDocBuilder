'use strict';

function runCacheFileTest() {
  let categoryCache = {name: undefined, id: undefined};
  let folderCache = {'Chapter 1': 12342, 'Chapter 2': 1342342};
  // eslint-disable-next-line max-len
  let articleCache = {'Article Name 1': {id: 1234, folderid: 9999}, 'Article Name 2': {id: 3423, folderid: 9334}};

  console.log(categoryCache.name);

  console.log(categoryCache.id);

  console.log(folderCache['folder1']);
  console.log(folderCache['folder2']);

  console.log(articleCache['articleName1'].id);
  console.log(articleCache['articleName1'].folderid);

  console.log(articleCache['articleName2'].id);
  console.log(articleCache['articleName2'].folderid);
}

module.exports = {
  runCacheFileTest,
};
