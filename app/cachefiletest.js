'use strict';
const marked = require('marked');
const fs = require('fs');

let cache = require('./FreshDeskCacheFile');

function runCacheFileTest() {
  let category = cache.categoryCache;
  let folder = cache.folderCache;
  let article = cache.articleCache;

  // We're going to go with 4 cache files instead of 1, this will make
  // searching for cache stuff a lot easier, and make FreshDesk.js run
  // much faster. We'll have a categoryCache, folderCache, articleCache,
  // and imageCache (see images.js).

  // It'll have the general structure of below:

  // let categoryCache = {name: 'Document Name', id: 2198791};
  // let folderCache = {'Chapter 1': 12342, 'Chapter 2': 1342342};
  // eslint-disable-next-line max-len
  // let articleCache = {'Article Name 1': {id: 1234, folderid: 9999, lastModified: 'somedate'}, 'Article Name 2': {id: 3423, folderid: 9334, lastModified: 'somedate'}};

  // imageCache = {'image directory': 'url to image'};

  // This is just to show how quick we can search for Categories/Folders/IDs
  // now, no need for any for-loops in FreshDesk.js


  console.log(category.name);
  console.log(category.id);

  console.log(folder['folder1']);
  console.log(folder['folder2']);

  console.log(article['Article Name 1'].id);
  console.log(article['Article Name 1'].folderid);

  console.log(article['Article Name 2'].id);
  console.log(article['Article Name 2'].folderid);


  // The following is the code we need to switch from Showdown to Marked

  // this replaces links in Markdown with updated links *before* we convert
  // to HTML, meaning we don't have to regex <a> tags from already converted
  // html (regexing HTML is messy in general and we should avoid it).

  const renderer = new marked.Renderer();

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

      // dummy value, look at comment:
      let articleID = 1234567890; // articleCache[articleName]

      // !!!remove this next line when adding to freshdesk.js!!!
      let helpdeskName = 'dummyvalue';

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
    if (imgLink) href = 'imageURL'; // replace this with imageCache[imgLink[1]];

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

  // This directory string is a literal directory on my computer, replace it
  // with whatever you want for testing.

  console.log(marked(fs.readFileSync(
    // eslint-disable-next-line max-len
    'C:/Users/Stephen/Documents/GitHub/EdgeScanDocBuilder/sample_documents/ideal_sample_docs/docs/1_formatting_test_section/1_formatting_test_chapter.md',
    'utf-8')));
}

module.exports = {
  runCacheFileTest,
};
