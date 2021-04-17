/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
'use strict';

module.exports = {
  uploadFiles,
  articleUpload,
};

const fetch = require('node-fetch');
const fs = require('fs');
const showdown = require('showdown');
const images = require('./images');
const glob = require('glob');
const cache = require('./cacheFreshDesk');

const path = require('path');
const argv = require('./cli');

const logFileName = '/.docbuild.json';

if (!process.env.FRESHDESK_TOKEN || !process.env.FRESHDESK_HELPDESK_NAME) {
  throw new Error(`The environment variables FRESHDESK_TOKEN and
    FRESHDESK_HELPDESK_NAME must be set`);
}

const apiKey = process.env.FRESHDESK_TOKEN;
const helpdeskName = process.env.FRESHDESK_HELPDESK_NAME;

const baseUrl = `https://${helpdeskName}.freshdesk.com`;

// API key acts as a 'username' with any characters as a password
// This 'username' and password combination should be base64 encoded
const authorizationHeader =
{
  Authorization: Buffer.from(`${apiKey}:nopass`).toString('base64'),
  'Content-Type': 'application/json',
};

// API ENDPOINT CONSTANTS
// Remember: None of the following have trailing '/', you'll
// need to add that if you want to append a value to the end
// of one of these endpoints

const categoryAPIEndPoint = baseUrl + '/api/v2/solutions/categories';
// eslint-disable-next-line no-unused-vars
const folderAPIEndPoint = baseUrl + '/api/v2/solutions/folders';

// For most Folder operations, we can use the above API endpoint
// i.e. when we already know Folder ID. But, if we want to make
// a new Folder, or list the Folders in a category, we must use
// the following, as we need to specify the Category.
const folderInCategoryAPIEndPoint =
  (category) => baseUrl + `/api/v2/solutions/categories/${category}/folders`;

// We must have a similar strcture for Articles
const articleAPIEndPoint =
  (article) => baseUrl + `/api/v2/solutions/articles/${article}`;

const articleInFolderAPIEndPoint =
  (folder) => baseUrl + `/api/v2/solutions/folders/${folder}/articles`;

// Required for POST API calls. Creating a category requires only
// passing an object that contains a name, but creating a Folder
// requires passing an object that has a name and specifies the visibily
// of the folder
const categoryPOSTContent = function(name) { return {name: name}; };

const folderPOSTContent =
  function(name) { return {name: name, visibility: 1}; };

// the following is used for uploading a blank document on FreshDesk first,
// so that we can achieve linking
const dummyHTML = (article) => {
  return {
    title: path.basename(article, '.md'),
    description: '<h1>PLACEHOLDER FILE</h1>',
    status: 1,
  };
};

/**
 * @typedef {('POST'|'GET'|'PUT'|'DELETE')} Verbs
 */

/**
 * A wrapper that handles interacting with the freshdesk REST API.
 * See {@link https://developer.freshdesk.com/api/#authentication} for details.
 * @param {Verbs} method The HTTP method to use for the request
 * @param {String} url The endpoint for the request
 * @param {String} apiKey The Freshdesk API key
 * @param {Object} [content] Object to be sent in the body of the API call
 * @returns {Promise<Object>} The response body wrapped in a Promise
 */

async function apiCallFreshDesk(method, url, content = undefined) {

  if (typeof content !== 'undefined') {
    content = JSON.stringify(content);
  }

  const options = {
    method: method,
    body: content,
    headers: authorizationHeader,
  };

  // TODO: Check response is ok
  // TODO: Handle any rate limiting

  return fetch(url, options)
    .then(response => response.text())
    .then(text => { return JSON.parse(text); });
}


/**
 * Uploads HTML formatted to a string to users endpoint
 * See {@link https://developer.freshdesk.com/api/#authentication} for details.
 * @param {Verbs} method The HTTP method to use for the request
 * @param {Number} folderID The ID value can either be the ID of the folder
 * if this is a POST request (i.e., create a new article in this folder), or
 * it can be an ID for an Article, if this is a PUT request (i.e. update this
 * article).
 * @param {Object} [content] Object to be sent in the body of the API call
 * @returns {Promise<Object>} The ID of the new article
 */
async function articleUpload(method, id, content) {
  let articleUploadURL;
  let articleName = content.title + '.md';

  // We need to know if we are creating a new article ('POST'),
  // or updating an already-uploaded article ('PUT').
  if (method === 'POST')
    articleUploadURL = articleInFolderAPIEndPoint(id);
  else if (method === 'PUT')
    articleUploadURL = articleAPIEndPoint(id);
  else throw new Error('articleUploads "method" parameter should be "PUT" or "POST"');

  const options = {
    method: method,
    body: JSON.stringify(content),
    headers: authorizationHeader,
  };

  return fetch(articleUploadURL, options)
    .then(res => res.json())
    .then(json => {
      return {article: articleName, id: json.id};
    })
    // pretty useless message atm, will need updating later
    .catch(() => {
      throw new Error(
        'Error uploading article - deleting your DocBuild cache files may resolve this.');
    });
}

// The following two functions are used to get the IDs from
// FreshDesk of either a Category or a Folder. If nothing is
// found on FreshDesk matching our description, then we create
// a new version.

async function getFreshDeskCategoryID(apiEndPoint, content) {
  return apiCallFreshDesk('GET', apiEndPoint)
    .then(
      structuresFound => {
        return structuresFound.find(struct => struct.name === content.name);
      })
    .then(result => {
      if (result === undefined) {
        return makeFreshDeskStructure(apiEndPoint, content);
      } else return result.id;
    });
}

// The following two methods are very similar, may be worth
// abstracting them into one function

function addOnlineFoldersToLocalCache(categoryID) {
  let apiEndPoint = folderInCategoryAPIEndPoint(categoryID);

  return apiCallFreshDesk('GET', apiEndPoint)
    .then(
      structuresFound => {
        // We've just asked FreshDesk to give us all the folders
        // it current has. To save on API calls in the future, we
        // will use this responce to immediately add to our cache
        // file.
        structuresFound.forEach(onlineFolder => {
          cache.folderCache[onlineFolder.name] = onlineFolder.id;
        });
      });
}

function addOnlineArticlesToLocalCache(folderID) {
  let apiEndPoint = articleInFolderAPIEndPoint(folderID);

  return apiCallFreshDesk('GET', apiEndPoint)
    .then(
      articlesFound => {
        // We've just asked FreshDesk to give us all the articles
        // in the specified folder. To save on API calls in the
        // future, we will use this responce to immediately add
        // to our cache file.
        articlesFound.forEach(onlineArticle => {
          cache.articleCache[onlineArticle.name].id = onlineArticle.id;
          cache.articleCache[onlineArticle.name].folderid = onlineArticle.folderid;
          // We don't have anything to put into lastModified, so we'll leave this
          // unchanged. There are two scenarios - lastModified is blank after this,
          // which means that we've grabbed an article that isn't present locally,
          // or is present on the site but this is our first run of docbuild. This
          // means we will be uploading this file. The other scenario is that we've
          // just redundantly set the ID for a cache value that is already set in
          // cache and there is an valid and untouched lastModified value in that same
          // slot - this is fine, it means that we won't upload anything for this article.
        });
      });
}

// Used for both Category and FreshDesk
async function makeFreshDeskStructure(apiEndPoint, content) {
  return apiCallFreshDesk(
    'POST', apiEndPoint, content)
    .then((result) => { return result.id; });
}


async function uploadFiles() {
  // For our documents, we have a folder structure of
  // document/chapters/markdown-file. But FreshDesk has its own names for
  // this hierarchy. It's really important you remember this, because the
  // names can definitely get confusing and I probably used these terms
  // very interchangeably throughout the code:

  // Our 'Document' Folder == FreshDesk 'Category'
  // Our 'Chapter' Folder  == FreshDesk 'Folder'
  // Our 'Markdown' Files  == FreshDesk 'Article'

  // When you're running 'docbuild --freshdesk', (in our case) you'll be
  // running it in the terminal in the folder
  // 'sample_documents/ideal_sample_docs'. In this folder, there is a
  // folder called 'docs'. This will be the name of our FreshDesk
  // Category. In the case of PDF, the entirety of what is contained in
  // the docs folder will be one big PDF, but in the case of HTML, we have
  // to treat it very differently: we have to convert each MD file into an
  // individual HTML file, then put it into the right Folder on
  // FreshDesk.

  await cache.readOrCreateFreshDeskCacheFile();
  await images.uploadImages(argv.source, cache.imageCache);

  // get category name, check if its in cache. If not,
  // we need to get the ID from FreshDesk
  let categoryName = path.basename(argv.source);
  let categoryID;

  if (cache.categoryCache[categoryName])
    categoryID = cache.categoryCache[categoryName];
  else {
    // we'll set categoryID and equivalent area in the cache
    // at the same time
    categoryID = cache.categoryCache[categoryName] =
      await getFreshDeskCategoryID(
        categoryAPIEndPoint, categoryPOSTContent(categoryName));
  }

  let folderNames = getChapterNamesInDirectory(argv.source);

  let checkedOnline = false;

  for (let i = 0; i < folderNames.length; i++) {
    if (!cache.folderCache[folderNames[i]]) {

      // We'll only check online once, and only if one of our local
      // folders wasn't found in cache, this saves on API calls
      if (!checkedOnline) {
        await addOnlineFoldersToLocalCache(categoryID);
        checkedOnline = true;

        // If we found one online and it has been added to cache,
        // we can move on
        if (cache.folderCache[folderNames[i]]) continue;
      }

      cache.folderCache[folderNames[i]] =
      await makeFreshDeskStructure(
        folderInCategoryAPIEndPoint(categoryID), folderPOSTContent(folderNames[i]));
    }
  }

  // Trying to think of a cleaner way of doing this, but can't think
  // of anything. Iterate through the folders, getting all the articles
  // in each folder. Add them to cache, regardless of if they're in cache
  // already or not (although, if they are not in cache already, then
  // their ID value will be blank - we can use this for later to determine
  // if we should upload them)

  // Article Cache has following structure:
  // exports.articleCache = {
  //   'Article Name 1': {
  //     id: 1234,
  //     folderid: 9999,
  //     lastModified: 'somedate',
  //   },

  let dummyArticlePromises = [];

  folderNames.forEach(folderName => {

    checkedOnline = false;

    getArticleNamesInDirectory(argv.source + '/' + folderName).forEach(
      articleName => {
        let folderID = cache.folderCache[folderName];
        // if any of the articles in this folder are not
        // present in cache, then we'll check online and
        // add them to the cache. We'll only do this once
        // for each folder.
        if (!cache.articleCache[articleName]) {
          addOnlineArticlesToLocalCache(folderID);
          checkedOnline = true;
        }

        if (cache.articleCache[articleName] === undefined)
          cache.articleCache[articleName] = {};
        cache.articleCache[articleName].folderid = folderID;

        // If there is still no ID value set for this article, then
        // there is no online version - we need to upload a
        // dummy article. We won't set the lastModified date yet -
        // we can use this to our advantage later
        if (!cache.articleCache[articleName].id) {
          // we'll gather up all the dummy articles we need
          // to upload into an array and then post them all
          // at once - should be a good bit faster.
          dummyArticlePromises.push(articleUpload('POST', folderID, dummyHTML(articleName)));
        }
      });
  });

  await Promise.allSettled(dummyArticlePromises)
    .then(results => {
      results.forEach((result, num) => {
        if (result.status === 'fulfilled') {
          // Little awkwardly done, but articleUpload() returns an
          // object that looks like {article: 'article name', id: 1234},
          // so we just store this in cache
          console.log(result.value);
          cache.articleCache[result.value.article].id = result.value.id;
        }
        if (result.status === 'rejected') {
          // Replace with something more useful
          console.log(
            'ERROR POSTING ARTICLE',
          );
        }
      });
    });

  await cache.updateFreshDeskCacheFile();
}
//   // Now we have the Category/Document name, we check our cache for
//   // its ID, or create a Category with this name on FreshDesk, and add
//   // it to our cache

//   if (freshDeskCache.categoryName === categoryName)
//     categoryID = freshDeskCache.categoryID;
//   else {
//     categoryID = await getFreshDeskStructureID(
//       categoryAPIEndPoint, categoryPOSTContent(categoryName));
//     // If the category name was invalid for our history, then we
//     // have to create a new
//     freshDeskCache.categoryID = categoryID;
//     freshDeskCache.categoryName = categoryName;
//     freshDeskCache.folders = [];
//   }

//   // Now we need to know the names of all the Chapters/Folders in this
//   // Category/Document.

//   let chapters = getChapterNamesInDirectory(argv.source);
//   let numChapters = chapters.length;
//   let chapterCount = 0;

//   if (freshDeskCache.folders === undefined)
//     freshDeskCache.folders = [];

//   let knownFolders = freshDeskCache.folders;

//   // new loop here, so that article & folder IDs already generated (for purposes of linking)
//   for (const chapter of chapters) {
//     let thisFolder =
//       knownFolders.filter(({folderName}) => folderName === chapter)[0];
//     let folderID;

//     if (thisFolder === undefined) {
//       folderID = await getFreshDeskStructureID(
//         folderInCategoryAPIEndPoint(categoryID), folderPOSTContent(chapter));
//       knownFolders.push(
//         {
//           folderName: chapter,
//           folderID: folderID,
//           articles: [],
//         });

//       thisFolder = knownFolders[knownFolders.length - 1];
//     } else folderID = thisFolder.folderID;

//     let localArticles = getArticleNamesInDirectory(argv.source + '/' + chapter);
//     let numArticles = localArticles.length;
//     let articleCount = 0;

//     if (thisFolder.articles === undefined)
//       thisFolder.articles = [];
//     let uploadedArticles = thisFolder.articles;

//     for (const article of localArticles) {
//       let thisArticle =
//         uploadedArticles.filter(({articleName}) => articleName === article)[0];

//       let fileLastModified = getLastModifiedTime(
//         argv.source + '/' + chapter + '/' + article);

//       if (thisArticle === undefined) {
//         // if no matching article was found
//         // convert MD file to HTML and upload new article to FreshDesk

//         articleUpload('POST', folderID, dummyHTML(article))
//           .then(thisArticle => (
//             uploadedArticles.push(
//               {
//                 articleName: article,
//                 articleID: thisArticle,
//                 lastModified: fileLastModified,
//               },
//             )))
//           .then(() => articleCount++)
//           .then(() => {
//             if (articleCount === numArticles){
//               chapterCount++;
//               if (chapterCount === numChapters){
//                 updateFreshDeskCacheFile();
//                 uploadData(chapters, knownFolders);
//               }
//             }
//           });
//       }
//     }
//   }
// }


// function uploadData(chapters, knownFolders){
//   for (const chapter of chapters) {
//     let thisFolder =
//       knownFolders.filter(({folderName}) => folderName === chapter)[0];
//     let folderID = thisFolder.folderID;

//     let localArticles = getArticleNamesInDirectory(argv.source + '/' + chapter);

//     if (thisFolder.articles === undefined)
//       thisFolder.articles = [];
//     let uploadedArticles = thisFolder.articles;

//     for (const article of localArticles) {
//       let thisArticle =
//       uploadedArticles.filter(({articleName}) => articleName === article)[0];
//       // console.log(thisArticle);
//       let fileLastModified = getLastModifiedTime(
//         argv.source + '/' + chapter + '/' + article);

//       if (article.lastModified !== fileLastModified) {
//         // convert MD file to HTML and put update version on FreshDesk API

//         let converter = new showdown.Converter();
//         converter.setOption('tables', true);
//         converter.setOption('simpleLineBreaks', true);
//         let html = converter.makeHtml(fs.readFileSync(argv.source + '/' + chapter + '/' + article, 'utf-8'));

//         let htmlToUpload = htmlLinkRegex(html);

//         // console.log(desc);

//         let content = {
//           title: path.basename(article, '.md'),
//           description: htmlToUpload,
//           status: 1,
//         };

//         articleUpload('PUT', thisArticle.articleID, content);
//         thisArticle.lastModified = fileLastModified;
//       }
//     }
//   }
// }

// function htmlLinkRegex(html) {
//   return html.replace(
//     /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1>/gm,
//     function(match, text, link) {
//       let isExternalLink = (link.match(/https?:\/\/[^\s]+/g) !== null);
//       let isAnotherArticle = (link.match(/\.md/g) !== null);
//       let isImage = (link.match(/\.(gif)|(jpe?g)|(tiff)|(png)|(bmp)$/i) !== null);

//       // If it is an interal link, pointing to a section of this article
//       if (link[0] === '#') {
//         return `<a href="${link}">`;
//       }

//       // TODO: UNTESTED
//       if (!isExternalLink && isImage && localImages[link]) {
//         return `<img src="${localImages[link]}>`;
//       }

//       if (!isExternalLink && isImage) {
//         return `<img src="${localImages[link]}>`;
//       }

//       // if the link is to a different file
//       if (!isExternalLink && isAnotherArticle) {
//         let newLink = formatLink(link);
//         return `<a href="${newLink}">`;
//       }
//       // for anything else, just leave it unmodified
//       return match;
//     });
// }

const getChapterNamesInDirectory = source =>
  fs.readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

const getArticleNamesInDirectory = source =>
  fs.readdirSync(source, { withFileTypes: true })
    .filter(dirent => {
      return dirent.isFile() && dirent.name.match(/[^\.]*.md/g);
    })
    .map(dirent => dirent.name);

// const getLastModifiedTime = (path) => {
//   const stats = fs.statSync(path);
//   return stats.mtime;
// };

// /**
//  * If our document is trying to link to another article on FreshDesk,
//  * this function will find that article ID (in our cache) and format
//  * it so that it becomes a working link
//  * @param {String} link the MD article link
//  * @returns {String} The URL of the article that the document is trying
//  * to link to
//  */
// function formatLink(link){
//   let newLink = '';
//   let subsectionLink = '';
//   let article = path.basename(link);
//   let match = '';

//   // If the article link contains a link to a subsection of
//   // that article, then we need to extract the name of that
//   // subsection

//   // eslint-disable-next-line no-cond-assign
//   if (match = article.match(/([^#]*)(#.*)/)) {
//     article = match[1];
//     subsectionLink = match[2];
//   }

//   // extract the chapter name from the string
//   let chapterName = link.match(/([^/]*)\/.*/)[1];

//   // Search through folders and articles for matching article name
//   let knownFolders = freshDeskCache.folders;
//   let thisFolder = knownFolders.filter(({folderName}) => folderName === chapterName)[0];
//   let knownArticles = thisFolder.articles;
//   let thisArticle = knownArticles.filter(({articleName}) => articleName === article)[0];

//   // If we found a matching article
//   if (thisArticle !== undefined){
//     newLink =
//       'https://' + helpdeskName + '.freshdesk.com/a/solutions/articles/' + thisArticle.articleID + subsectionLink;
//     return newLink;
//   } else { // else there's nothing we can do with it, return as is.
//     return link;
//   }
// }

// // Lets say we have a doc/chapter/section folder hierarchy. We've
// // already uploaded this to FreshDesk, which means that the
// // category, folder and article already exist, and have been
// // assigned IDs by the FreshDesk API. We don't need to check if the
// // category/folder/article exists with sequential GET requests,
// // because that would be a waste of time. So what we'll do is store
// // a '.docbuild.json' file in the to level folder of the document.
// // This will save the name + id of the category, the name + id of
// // all the folders, and the name + id of all the articles, all as
// // one big object. This means that we will PUT (update) instead of
// // POST (create new) for each of these.

// // {
// //   categoryName : 'name of our document, same as the name of the doc file',
// //   categoryID : 'a unique ID assigned for this item by FreshDesk',
// //   folders : [  // array
// //     {
// //       folderName : 'name of chapter folder',
// //       folderID : '...',
// //       articles : [
// //         {
// //           articleName : 'name of MD file',
// //           articleID : '...',
// //           lastModified : 'a timestamp'
// //         },
// //         {
// //           articleName : 'name of MD file',
// //           articleID : '...',
// //           lastModified : 'a timestamp'
// //         },
// //       ]
// //     }
// //   ]
// // }

// // function readOrCreateFreshDeskCacheFile() {
// //   try {
// //     let data = fs.readFileSync(argv.source + logFileName);
// //     freshDeskCache = JSON.parse(data);
// //   } catch (err) {
// //     // if file does not exist, we make an empty file
// //     freshDeskCache = {};
// //     fs.writeFileSync(argv.source + logFileName,
// //       JSON.stringify(freshDeskCache, null, 4));
// //   }
// // }

// // function updateFreshDeskCacheFile() {
// //   fs.writeFileSync(argv.source + logFileName,
// //     JSON.stringify(freshDeskCache, null, 4));
// // }

