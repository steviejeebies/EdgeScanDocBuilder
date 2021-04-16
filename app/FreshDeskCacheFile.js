'use strict';

module.exports={
    readOrCreateFreshDeskCacheFile,
    updateFreshDeskCacheFile,
};

  const fs = require('fs');
  const logFileName = '/.docbuild.json';
  const logFolderName = '/.folderCache.json';
  const logCategoryName = '/.categoryCache.json';
  const argv = require('./cli');
  
  let freshDeskCache;
  exports.categoryCache ={
      name: 'Document Name',
      id: 2198791
    };
  exports.folderCache = {
      'Chapter 1': 12342, 
      'Chapter 2': 1342342
    };
  // eslint-disable-next-line max-len
  exports.articleCache =
   { 'Article Name 1': {
       id: 1234, 
       folderid: 9999, 
       lastModified: 'somedate'
     }, 'Article Name 2':{
        id: 3423,
        folderid: 9334,
        lastModified: 'somedate'
     }
    };
  

 
 // I believe there is something wrong here and I am not really properly addressing it  
 function readOrCreateFreshDeskCacheFile(docFolder) {
    try {
      let data = fs.readFileSync(docFolder + logFileName+ logFolderName +logCategoryName );
      freshDeskCache = JSON.parse(data);
    } catch (err) {
      // if file does not exist, we make an empty file
      freshDeskCache ={};
      fs.writeFileSync(docFolder + logFileName + logFolderName + logCategoryName ,
        JSON.stringify(freshDeskCache, null, 4));
    }
    return freshDeskCache;
  }

  function updateFreshDeskCacheFile() {
    return fs.writeFileSync(argv.source + logFileName + logFolderName + logCategoryName ,
      JSON.stringify(freshDeskCache, null, 4));
  }

  