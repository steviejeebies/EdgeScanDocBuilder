'use strict';
/* eslint-disable */

const fetch = require('node-fetch');
const fs = require('fs');

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



function makeCategoryFolder() {

  let listSpecificCategory = 'https://newaccount1614434119374.freshdesk.com/api/v2/solutions/categories/80000231432'
  let listAllCategories = 'https://newaccount1614434119374.freshdesk.com/api/v2/solutions/categories'
  let makeFolder = 'https://newaccount1614434119374.freshdesk.com/api/v2/solutions/categories/80000231432/folders'
  let getFolder = 'https://newaccount1614434119374.freshdesk.com/api/v2/solutions/folders/80000341119'
  
  let bodyContentFolder = {
    name : "testingFolder",
    description : "testingFolder",
    visibility : 1
  }
  let bodyContentCategory = {
    name : "testingCategory",
    description : "testingCategory",
  }
  
  const apiKey = 'tFq8yPvZvHwxe3fjJQko'
  const options = {
    method: method,
    body : JSON.stringify(bodyContent),
    headers: {
      Authorization: Buffer.from(`${apiKey}:nopass`).toString('base64'),
      'Content-Type': 'application/json',
    },
  };

  return fetch(listSpecificCategory, options)
  .then(res => res.json())
  .then(json => console.log(json))
  .catch(err => console.log(err))
}

const testingApiKey = 'tFq8yPvZvHwxe3fjJQko';
const testingHelpdeskName = 'newaccount1614434119374'
const baseUrl = `https://${helpdeskName}.freshdesk.com`;
let method = 'POST'
let folderID = 80000341119
let content = {
    title : "testing Article with links3",
    description : `<h1>Test Data</h1>
    <p>
      This piece of test data is to ensure content can be uploaded to freshdesk
      successfully
  
    Here is a link to the
    <a href="https://developer.freshdesk.com/api/#solutions">freshdesk docs</a>`,
    status : 1
}

makeArticle("POST", baseUrl, apiKey, folderID, content)

// fs.readFile("./index.html", function read(error, data) {
//     if (error) {
//         throw(error)
//     }
//     content = data
// });
