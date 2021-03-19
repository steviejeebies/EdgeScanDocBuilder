'use strict';

const fetch = require('node-fetch');

const apiKey = process.env.FRESHDESK_TOKEN;
const helpdeskName = process.env.FRESHDESK_HELPDESK_NAME;

// eslint-disable-next-line no-unused-vars
const categoriesAPIEndPoint = '/api/v2/solutions/categories';
// eslint-disable-next-line no-unused-vars
const folderAPIEndPoint =
  (category) => `/api/v2/solutions/categories/${category}/folders`;

console.log(folderAPIEndPoint('12345'));

const baseUrl = `https://${helpdeskName}.freshdesk.com`;

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
function makeRequest(method, url, apiKey, content = undefined) {

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
    .then(text => JSON.parse(text));
}

/* makeArticle posts HTML formatted to a string to users endpoint */
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


if (!process.env.FRESHDESK_TOKEN || !process.env.FRESHDESK_HELPDESK_NAME) {
  throw new Error(`The environment variables FRESHDESK_TOKEN and
    FRESHDESK_HELPDESK_NAME must be set`);
}

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
makeRequest('GET', baseUrl + '/api/v2/solutions/categories', apiKey)
  .then(categories => console.log(categories));

// this was taken from the URL of a test folder I created on FreskDesk site
const testFolderID = 69000222574;

// Push an article to FreshDesk API, will be visible on site after
makeArticle('POST', baseUrl, apiKey, testFolderID, content);

