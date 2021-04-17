'use strict';

// We've separated the HTML generation into it's own file,
// and tried to keep FreshDesk-specific stuff to a minimum.

const marked = require('marked');
const renderer = new marked.Renderer();
const fs = require('fs');

// importing cache, so that we don't need to pass it
// as a parameter from FreshDesk.js
const cache = require('./cacheFreshDesk');

renderer.link = (href, title, text) => {

  let internalLink = href.match(/^\$\$\/[^/]*\/?([^#]*)(#(.*))?/);
  // if it is a valid internal link, i.e. starts with "$$/",
  // then this will produce an array in the form
  // internalLink[1] = "article name"
  // if(internalLink[2]), then section is specified
  // internalLink[3] = "section name"

  let sectionLinkOnly = href.match(/^#(.*)$/);
  // if it is just a "#something" link, we still
  // need to update the ID, but don't change anything else

  if (sectionLinkOnly) { // if a section link is specified an nothing else
    href = '#DOCBUILD' + sectionLinkOnly[1]
      .toLowerCase()
      .replace(/[^\w]/g, '');
  } else if (internalLink) { // if it is an internal document
    // eslint-disable-next-line no-unused-vars
    let articleName = internalLink[1];
    let sectionIsSpecified = internalLink[2]; // boolean
    let sectionName = internalLink[3];

    // we need to change the formatting of the section string so
    // that the ID of "#This is a Heading" in HTML is
    // id="#DOCBUILDthisisaheading", we need it to be unique
    // because we don't know how FreshDesk is going to modify
    // the IDs when it renders it in HTML
    if (sectionIsSpecified) {
      sectionName =
        '#DOCBUILD' + text
          .toLowerCase()
          .replace(/[^\w]/g, '');
    } else sectionName = ''; // if no section specified, we leave this blank

    let articleID = cache.articleCache[articleName].id;

    // FRESHDESK SPECIFIC:
    let helpdeskName = process.env.FRESHDESK_HELPDESK_NAME;
    // eslint-disable-next-line max-len
    href = 'https://' + helpdeskName + '.freshdesk.com/a/solutions/articles/' + articleID + sectionName;
  }
  // for anything else, just leave it unmodified

  // We now just return a <a> tag with our href link
  return `<a href="${href}">${text}</a>`;
};

// For when the MD file contains an image link:
renderer.image = (href, title, text) => {
  // checking if our link starts with "$$/", i.e. it is an
  // internal link
  let imgLink = href.match(/^\$\$\/(.*)/);
  if (imgLink) href = cache.imageCache[imgLink[1]];

  return `<img src=${href} title="${title}">${text}</img>`;
};

// For when the MD file contains an heading, we need to
// modify it's ID for the HTML
renderer.heading = (text, level) => {
  let updatedHeaderID =
    'DOCBUILD' + text
      .toLowerCase()
      .replace(/[^\w]/g, '');

  return `<h${level} id="${updatedHeaderID}">${text}</h${level}>`;
};

marked.use({ renderer });

function convertHTML(directory) {
  return marked(fs.readFileSync(directory, 'utf-8'));
}


// required to pass command line arguments from index.js
module.exports = {
  convertHTML: convertHTML,
};

