'use strict';

module.exports = {
  uploadFiles: uploadFiles,
};

// const glob = require('glob');
const fetch = require('node-fetch');
const fs = require('fs');
const argv = require('./cli');

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

/* makeArticle posts HTML formatted to a string to users endpoint */
// eslint-disable-next-line no-unused-vars
function articleUpload(method, folderID, content) {
  let articleUploadURL = articleInFolderAPIEndPoint(folderID);

  const options = {
    method: method,
    body: JSON.stringify(content),
    headers: authorizationHeader,
  };

  return fetch(articleUploadURL, options)
    .then(res => res.json())
    .then(json => console.log('ARTICLE UPLOADED'))
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

// this is currently just a test function, but it's purpose
// of feeding one output into an input will be how we will
// used similarly anyway

// eslint-disable-next-line no-unused-vars
async function outer(documentName, folderName) {
  let categoryID =
    await getFreshDeskStructureID(
      categoryAPIEndPoint, categoryPOSTContent(documentName));

  let folderID =
    await getFreshDeskStructureID(
      folderInCategoryAPIEndPoint(categoryID), folderPOSTContent(folderName));

  // At this point, Category has been found/made, Folder has been found/made.

  articleUpload(folderID, testHTML);
}

// outer('here is a category', 'here is a folder');

// This function is similar to outer(), but we will actually
// be using it. At this point, it's only started, doesn't do
// anything useful yet.

async function uploadFiles() {
  readBackUpFile(argv.source);

  let parts = argv.source.split('/');
  let categoryName;
  let categoryID;

  // if the user has passed a directory like ./docs, then we want
  // 'docs'. If the user passes in './docs/', then we still want
  // to recognise this as docs.
  if (parts[parts.length - 1] === '') categoryName = parts[parts.length - 2];
  else categoryName = parts[parts.length - 2];

  console.log("categoryName IS " + categoryName);

  if (docHistoryInfo.categoryName === categoryName)
    categoryID = docHistoryInfo.categoryID;
  else {
    categoryID = await getFreshDeskStructureID(
      categoryAPIEndPoint, categoryPOSTContent(categoryName));
    // If the category name was invalid for our history, then we
    // have to create a new
    console.log(categoryID);
  }

}

let docHistoryInfo; // global in file

// Lets say we have a doc/chapter/section folder hierarchy. We've already
// uploaded this to FreshDesk, which means that the category,
// folder and article already exist. We don't need to check
// if the category/folder/article exists with sequential GET
// requests, because that would be a waste of time. So what we'll
// do is store a '.docbuild.json' file in the folder. This will
// save the name + id of the category, the name + id of all the
// folders, and the name + id of all the articles. This means
// that we will PUT (update) instead of POST (create new) for each
// of these.
function readBackUpFile(docFolder) {
  fs.readFile(docFolder + '/.docbuild.json', (err, data) => {
    if (err) {
      // if file does not exist, we make an empty file
      fs.writeFileSync(docFolder + '/.docbuild.json', '');
      docHistoryInfo = {};
    } else {
      docHistoryInfo = JSON.parse(data);
      console.log(docHistoryInfo);
    }
  });
}

