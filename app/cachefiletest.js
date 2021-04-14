'use strict';
const marked = require('marked');
const fs = require('fs');


function runCacheFileTest() {

  // We're going to go with 4 cache files instead of 1, this will make
  // searching for cache stuff a lot easier, and make FreshDesk.js run
  // much faster. We'll have a categoryCache, folderCache, articleCache,
  // and imageCache (see images.js).

  // It'll have the general structure of below:

  let categoryCache = {name: 'Document Name', id: 2198791};
  let folderCache = {'Chapter 1': 12342, 'Chapter 2': 1342342};
  // eslint-disable-next-line max-len
  let articleCache = {'Article Name 1': {id: 1234, folderid: 9999, lastModified: 'somedate'}, 'Article Name 2': {id: 3423, folderid: 9334, lastModified: 'somedate'}};

  // This is just to show how quick we can search for Categories/Folders/IDs
  // now, no need for any for-loops in FreshDesk.js

  console.log(categoryCache.name);
  console.log(categoryCache.id);

  console.log(folderCache['folder1']);
  console.log(folderCache['folder2']);

  console.log(articleCache['Article Name 1'].id);
  console.log(articleCache['Article Name 1'].folderid);

  console.log(articleCache['Article Name 2'].id);
  console.log(articleCache['Article Name 2'].folderid);


  // The following is the code we need to switch from Showdown to Marked

  // this replaces links in Markdown with updated links *before* we convert
  // to HTML, meaning we don't have to regex <a> tags from already converted
  // html (regexing HTML is messy in general and we should avoid it).

  const renderer = new marked.Renderer();

  renderer.link = (href, title, text) => {
    if (href.match(/^\$\$(\/)|(\\)/)) {
      // eslint-disable-next-line max-len
      href = 'POINTING TO RIGHT AREA'; // this should point to the updated equivalent of formatLink() in FreshDesk.js
    }
    // for anything else (including #something links), just leave it unmodified
    return `<a href="${href}" title=${title}>${text}</a>`;
  };

  renderer.image = (href, title, text) => {
    // checking if our link starts with "$$/", i.e. it is an
    // internal link
    let regex = href.match(/(^\$\$(\/)|(\\))/);
    if (!regex) return 'unmodified link';

    // replace the $$/ at the start
    href = href.replace(regex[0], '');

    // We're going to set a rule that all images in the documentation
    // have to be uniquely named, this is arbitrary
    // but makes the following code a bit easier to read

    // The link will either be in the form "chapter/image", or "image".
    let splitLink = href.match(/([^/]*)\/(.*)/);

    // if link is 'something/abc', then this will get 'abc'. If link
    // is 'something', then this will get 'something'
    // eslint-disable-next-line no-unused-vars
    let imageName = (Array.isArray(splitLink) && splitLink[2])
      ? splitLink[2] : splitLink;

    // check cache for image
    // return <img src= "found image link...."></img>
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
