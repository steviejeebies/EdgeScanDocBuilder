'use strict';

module.exports = {
  uploadFiles,
  articleUpload,
};

const fetch = require('node-fetch');
const fs = require('fs');
const argv = require('./cli');
const { singleHTML } = require('./html');

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
// eslint-disable-next-line no-unused-vars
const articleAPIEndPoint = baseUrl + '/api/v2/solutions/articles';
// eslint-disable-next-line no-unused-vars
const articleInFolderAPIEndPoint =
  (folder) => baseUrl + `/api/v2/solutions/folders/${folder}/articles`;

// Required for POST API calls. Creating a category requires only
// passing an object that contains a name, but creating a Folder
// requires passing an object that has a name and specifies the visibily
// of the folder
const categoryPOSTContent = function(name) { return {name: name}; };

const folderPOSTContent =
  function(name) { return {name: name, visibility: 1}; };

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
 * @param {Number} folderID the ID that FreshDesk has assigned the folder
 * @param {Object} [content] Object to be sent in the body of the API call
 * @returns {Promise<Object>} The ID of the new article
 */
function articleUpload(method, folderID, content) {
  let articleUploadURL = articleInFolderAPIEndPoint(folderID);

  const options = {
    method: method,
    body: JSON.stringify(content),
    headers: authorizationHeader,
  };

  return fetch(articleUploadURL, options)
    .then(res => res.json())
    .then(json => json.id) // returning ID of the article
    // pretty useless message atm, will need updating later
    .catch(err => console.log(err));
}

// This is just some test HTML to throw onto FreshDesk
// eslint-disable-next-line no-unused-vars
let testHTML = {
  title: 'testing Article with links3',
  description: `<h1>Test Data</h1>
  <p>
    This piece of test data is to ensure content can be uploaded to freshdesk
    successfully

  THIS IS UPDATED CONTENT
  <a href="https://developer.freshdesk.com/api/#solutions">freshdesk docs</a>`,
  status: 1,
};

// TEST CALLS TO ABOVE FUNCTIONS

// // Test auth by making a sample request
// makeRequest('GET', baseUrl + '/api/v2/solutions/categories', apiKey)
//   .then(categories => console.log(categories));

// this was taken from the URL of a test folder I created on FreskDesk site
// const testFolderID = 69000222574;

// Push an article to FreshDesk API, will be visible on site after
// makeArticle('POST', baseUrl, apiKey, testFolderID, content);

// FRESH DESK API CALLS

// 'Structure' means either 'FreshDesk Category' or 'FreshDesk Folder'

async function getFreshDeskStructureID(apiEndPoint, content) {
  return apiCallFreshDesk('GET', apiEndPoint)
    .then(
      structuresFound =>
        structuresFound.find(struct => struct.name === content.name))
    .then(result => {
      if (result === undefined) {
        return makeFreshDeskStructure(apiEndPoint, content);
      } else return result.id;
    });
}

async function makeFreshDeskStructure(apiEndPoint, content) {
  return apiCallFreshDesk(
    'POST', apiEndPoint, content)
    .then((result) => { return result.id; });
}

let docHistoryInfo; // our cache file, stores info about FreshDesk IDs

/**
 * This is the main method in freshdesk.js. When passed a directory
 * (through argv.source), this method will upload the files to FreshDesk
 * and keep a record of the files/IDs in .docbuild.js
 */

async function uploadFiles() {

  // For our documents, we have a folder structure of
  // document/chapters/markdown-file. But FreshDesk has its own names for
  // this hierarchy. It's really important you remember this, because the
  // names can definitely get confusing and I probably used these terms
  // very interchangeably throughout the code:

  // Our 'Document' Folder == FreshDesk 'Category'
  // Our 'Chapter' Folder == FreshDesk 'Folder'
  // Our 'Markdown' Files == FreshDesk 'Article'

  // Login to FreshDesk's website with the details I posted in the group
  // chat (DM me if you're not sure where to look on the site for the
  // Solutions page), and you'll see this in action.

  // When you're running 'docbuild --freshdesk', (in our case) you'll be
  // running it in the terminal in the folder
  // 'sample_documents/ideal_sample_docs'. In this folder, there is a
  // folder called 'docs'. This will be the name of our FreshDesk
  // Category. In the case of PDF, the entirety of what is contained in
  // the docs folder will be one big PDF, but in the case of HTML, we have
  // to treat it very differently: we have to convert each MD file into an
  // individual HTML file, then put it into the right Folder on
  // FreshDesk.

  // To save time on having to ask FreshDesk "do you have this
  // folder/file?" over and over and over for stuff that we have already
  // uploaded, we're using a JSON object called 'docHistoryInfo', which
  // keeps track of the unique IDs that FreshDesk has assigned our
  // Categories/Folders/Articles when we originally uploaded them (scroll
  // down to the bottom of this file, I've written out a comment to show
  // the structure of this object. Alternatively, if you run 'docbuild
  // --freshdesk' in one of the sample document folders, then open
  // '.docbuild.json' file, you'll see a real example). We're going to
  // write this object to a file called '.docbuild.json' when we're done
  // everything, which will be saved in the docs folder.

  // The method 'readOrCreateBackUpFile()' reads this file and stores its
  // contents back into 'docHistoryInfo' whenever we start up this app
  // again. 'uploadFiles()' is the main method in the FreskDesk.js file.
  // What it's doing (at the moment) is comparing the current names of
  // files/folders in our documentation folder with what is in
  // 'docHistoryInfo' to see if this info already exists on FreshDesk. If
  // it does, we can just grab the ID values from this object and work for
  // there. If anything is missing in the Object, then we create an
  // equivalent structure on FreshDesk through the API, grab the new ID,
  // and store it in this object.

  readOrCreateBackUpFile(argv.source);

  let parts = argv.source.split('/');
  let categoryName;
  let categoryID;

  // if the user has passed a directory like ./docs, then we want
  // 'docs'. If the user passes in './docs/', then we still want
  // to recognise this as docs.
  if (parts[parts.length - 1] === '')
    categoryName = parts[parts.length - 2].trim();
  else categoryName = parts[parts.length - 1].trim();

  if (docHistoryInfo.categoryName === categoryName)
    categoryID = docHistoryInfo.categoryID;
  else {
    categoryID = await getFreshDeskStructureID(
      categoryAPIEndPoint, categoryPOSTContent(categoryName));
    // If the category name was invalid for our history, then we
    // have to create a new
    docHistoryInfo.categoryID = categoryID;
    docHistoryInfo.categoryName = categoryName;
    docHistoryInfo.folders = [];
  }

  let chapters = getChapterNamesInDirectory(argv.source);

  if (docHistoryInfo.folders === undefined)
    docHistoryInfo.folders = [];

  let knownFolders = docHistoryInfo.folders;

  for (const chapter of chapters) {
    let thisFolder =
      knownFolders.filter(({folderName}) => folderName === chapter)[0];
      // getting first index of filter, maybe theres a better function for this

    let folderID;

    if (thisFolder === undefined) {
      // if no matching folder was found
      folderID = await getFreshDeskStructureID(
        folderInCategoryAPIEndPoint(categoryID), folderPOSTContent(chapter));

      knownFolders.push(
        {
          folderName: chapter,
          folderID: folderID,
          articles: [],
        });
      thisFolder = knownFolders[knownFolders.length - 1];
    } else folderID = thisFolder.folderID;

    let localArticles = getArticleNamesInDirectory(argv.source + '/' + chapter);

    if (thisFolder.articles === undefined)
      thisFolder.articles = [];

    let uploadedArticles = thisFolder.articles;

    for (const article of localArticles) {
      let thisArticle =
        uploadedArticles.filter(({articleName}) => articleName === article)[0];

      let fileLastModified = getLastModifiedTime(
        argv.source + '/' + chapter + '/' + article);


      if (thisArticle === undefined) {
        // if no matching article was found
        // convert MD file to HTML and upload new article to FreshDesk

        // htmlFile = singleHTML(path.resolve(thisArticle));
        // let content = fs.readFileSync(htmlFile, 'utf-8');

        // content = content.replace(
        //   /\[([^\[]+)\]\(([^\)]+)\)/gm,
        //   function(match, text, link) {
        //     let isExternalLink = link.match(/https?:\/\/[^\s]+/g);
        //     let isAnotherChapter = link.match(/.md/g);

        //     if (!isExternalLink && isAnotherChapter) {
        //       return `<a href ="#${link}">${text}</a>`;
        //     }

        //     else if (link[0] === '#') {
        //       return `<a href="#${filepath}${link}">${text}</a>`;
        //     }

        //     else {return match};
        //   }
        // );
        

        // articleUpload('POST', folderID, content)

        // The parameters here are:
        // * 'POST' - tells FreshDesk we're uploading a brand new article
        // * folderID - we already have this from earlier on in this method
        // * content - this is the HTML (as a string, see the variable
        //             'testHTML' above to see what this object should look like
        //             This 'content' variable needs to be generated by HTML.js
        //             for this particular MD file, so we should make our call
        //             to HTML.js in this block.

        // Note: the articleUpload() call returns the ID that FreshDesk has
        // assigned to this article (but this is wrapped in a promise, so you
        // will need to do something like:
        // .then(articleID =>                 // around the following push call
        uploadedArticles.push(
          {
            articleName: article,
            articleID: 1234567890, // dummy value at the moment!
            lastModified: fileLastModified,
          },
        );
      } else if (thisArticle.lastModified !== fileLastModified) {
        // convert MD file to HTML and update version on FreshDesk API

        // same as above, but we 'PUT' instead of 'POST' to update
        // Note: I might have to make a small change to the articleUpload()
        // method so that it accepts an Article ID, but for the time
        // being, if its just uploading duplicate articles, it's fine
        // // articleUpload('POST', folderID, content)
        // htmlFile = singleHTML(path.resolve(thisArticle));
        // let content = htmlFile.toString;         // UNTESTED, just throwing stuff up for now
        // //DO LINK-Y STUFF HERE
        // articleUpload('POST', folderID, content);

        // since we already have an entry in our docHistoryInfo for this
        // article, we only need to update its lastModified value
        thisArticle.lastModified = fileLastModified;
      }

    }
  }

  // this will be at the very end of the upload files method,
  // maybe we can make it its own function to make it cleaner
  fs.writeFileSync(argv.source + logFileName,
    JSON.stringify(docHistoryInfo, null, 4));
}

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

const getLastModifiedTime = (path) => {
  const stats = fs.statSync(path);
  return stats.mtime;
};

// Lets say we have a doc/chapter/section folder hierarchy. We've
// already uploaded this to FreshDesk, which means that the
// category, folder and article already exist, and have been
// assigned IDs by the FreshDesk API. We don't need to check if the
// category/folder/article exists with sequential GET requests,
// because that would be a waste of time. So what we'll do is store
// a '.docbuild.json' file in the to level folder of the document.
// This will save the name + id of the category, the name + id of
// all the folders, and the name + id of all the articles, all as
// one big object. This means that we will PUT (update) instead of
// POST (create new) for each of these.

// {
//   categoryName : 'name of our document, same as the name of the doc file',
//   categoryID : 'a unique ID assigned for this item by FreshDesk',
//   folders : [  // array
//     {
//       folderName : 'name of chapter folder',
//       folderID : '...',
//       articles : [
//         {
//           articleName : 'name of MD file',
//           articleID : '...',
//           lastModified : 'a timestamp'
//         },
//         {
//           articleName : 'name of MD file',
//           articleID : '...',
//           lastModified : 'a timestamp'
//         },
//       ]
//     }
//   ]
// }

function readOrCreateBackUpFile(docFolder) {
  try {
    let data = fs.readFileSync(docFolder + logFileName);
    docHistoryInfo = JSON.parse(data);
  } catch (err) {
    // if file does not exist, we make an empty file
    docHistoryInfo = {};
    fs.writeFileSync(docFolder + logFileName,
      JSON.stringify(docHistoryInfo, null, 4));
  }
}

