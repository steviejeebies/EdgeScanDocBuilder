'use strict';

const fetch = require('node-fetch');

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


// const testContent = `
//   <h1>Test Data</h1>
//   <p>
//     This piece of test data is to ensure content can be uploaded to freshdesk
//     successfully
//
//   Here is a link to the
//   <a href="https://developer.freshdesk.com/api/#solutions">freshdesk docs</a>
// `;

if (!process.env.FRESHDESK_TOKEN || !process.env.FRESHDESK_HELPDESK_NAME) {
  throw new Error(`The environment variables FRESHDESK_TOKEN and
    FRESHDESK_HELPDESK_NAME must be set`);
}

const apiKey = process.env.FRESHDESK_TOKEN;
const helpdeskName = process.env.FRESHDESK_HELPDESK_NAME;
const baseUrl = `https://${helpdeskName}.freshdesk.com`;


// Test auth by making a sample request
makeRequest('GET', baseUrl + '/api/v2/solutions/categories', apiKey)
  .then(categories => console.log(categories));
