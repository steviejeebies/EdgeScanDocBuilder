'use strict';

const fetch = require('node-fetch');

if (!process.env.FRESHDESK_TOKEN || !process.env.FRESHDESK_HELPDESK_NAME) {
  throw new Error(`The environment variables FRESHDESK_TOKEN and
    FRESHDESK_HELPDESK_NAME must be set`);
}

const apiKey = process.env.FRESHDESK_TOKEN;
const helpdeskName = process.env.FRESHDESK_HELPDESK_NAME;

const authorizationHeader =
{
  Authorization: Buffer.from(`${apiKey}:nopass`).toString('base64'),
  'Content-Type': 'application/json',
}

const baseUrl = `https://${helpdeskName}.freshdesk.com`;

// API ENDPOINT CONSTANTS
// Remember: None of the following have trailing '/', you'll
// need to add that if you want to append a value to the end
// of one of these endpoints

// eslint-disable-next-line no-unused-vars
const categoriesAPIEndPoint = baseUrl + '/api/v2/solutions/categories';
// eslint-disable-next-line no-unused-vars
const folderAPIEndPoint = baseUrl + '/api/v2/solutions/folders';

// If we are creating a Folder, we need to use the
// following string instead of the above one, as we need
// to specify which category it is in, but for (almost)
// all other folder operations, all we need is the folder
// ID (where we can use the above foldersAPIEndPoint variable).
// We also need the following string if we want to list all
// Folders in a specific Category.
// eslint-disable-next-line no-unused-vars
const folderCategoryAPIEndPoint =
  (category) => baseUrl + `/api/v2/solutions/categories/${category}/folders`;

// We must have a similar strcture for Articles

// eslint-disable-next-line no-unused-vars
const articleAPIEndPoint = baseUrl + '/api/v2/solutions/articles';
// eslint-disable-next-line no-unused-vars
const articleFolderAPIEndPoint =
  (folder) => baseUrl + `/api/v2/solutions/folders/${folder}/articles`;

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

async function apiCallFreshDesk(method, url, apiKey, content = undefined) {

  if (typeof content !== 'undefined') {
    content = JSON.stringify(content);
  }

  const options = {
    method: method,
    body: content,
    headers: {
      // API key acts as a 'username' with any characters as a password
      // This 'username' and password combination should be base64 encoded
      Authorization: Buffer.from(`${apiKey}:nopass`).toString('base64'),
      'Content-Type': 'application/json',
    },
  };

  // TODO: Check response is ok
  // TODO: Handle any rate limiting

  return fetch(url, options)
    .then(response => response.text())
    .then(text => { return JSON.parse(text); });
}

/* makeArticle posts HTML formatted to a string to users endpoint */
// eslint-disable-next-line no-unused-vars
function makeArticle(method, baseUrl, apiKey, folderID, content) {

  let url =
    baseUrl + '/api/v2/solutions/folders/'
    + folderID.toString() + '/articles';

  const options = {
    method: method,
    body: JSON.stringify(content),
    headers: {
      Authorization: Buffer.from(`${apiKey}:nopass`).toString('base64'),
      'Content-Type': 'application/json',
    },
  };

  return fetch(url, options)
    .then(res => res.json())
    .then(json => console.log(json))
    .catch(err => console.log(err));
}




// eslint-disable-next-line no-unused-vars
let content = {
  title: 'testing Article with links3',
  description: `<h1>Test Data</h1>
  <p>
    This piece of test data is to ensure content can be uploaded to freshdesk
    successfully

  Here is a link to the
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

// The first method I'm going to make is one which takes the name of the
// Document the user wants to make. This will likely be the name of the
// top level directory (i.e. document_name/chapter_name/section_name). We
// want to know if this Category already exists on the user's FreshDesk
// portal. If it DOESN'T, we create a category for it, and work from there.
// If it DOES, then we need to get it's ID, and update whatever we need to
// update inside. It might be worth thinking in future about how we could
// save ID-stuff locally in the doc folder so that we don't constantly have
// to check if Category/Folders are on FreshDesk, but we'll put that aside
// for the moment

async function outer(documentName) {
  let id = await getFreshDeskStructureID(documentName, categoriesAPIEndPoint);
  console.log('SUCCESS: ' + id);
}

async function getFreshDeskStructureID(documentName, apiEndPoint) {
  return apiCallFreshDesk('GET', apiEndPoint, apiKey)
    .then(categories => categories.find(item => item.name === documentName))
    .then(result => {
      if (result === undefined) { return makeFreshDeskStructure(documentName); }
      else return result.id;
    });
}

async function makeFreshDeskStructure(documentName, apiEndPoint) {
  return apiCallFreshDesk(
    'POST', apiEndPoint, apiKey, { name: documentName })
    .then((result) => { return result.id; });
}

outer('from the bottom');
