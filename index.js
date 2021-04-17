#!/usr/bin/env node

'use strict';

const argv = require('./app/cli');

const fs = require('fs');
const path = require('path');

if (argv.test) {

}
if (argv['freshdesk-start-fresh']) {
  // delete the cache file to start over
  console.log(path.resolve(argv.source + '/.DOCBUILD_articleCache.json'));
  fs.rmSync(path.resolve(argv.source + '/.DOCBUILD_articleCache.json'));
  fs.rmSync(path.resolve(argv.source + '/.DOCBUILD_folderCache.json'));
  fs.rmSync(path.resolve(argv.source + '/.DOCBUILD_categoryCache.json'));
  fs.rmSync(path.resolve(argv.source + '/.DOCBUILD_imageCache.json'));
}
if (argv.pdf) {
  let pdf = require('./app/pdf');
  pdf.docbuildPDF();
}
if (argv.freshdesk) {
  let freshdesk = require('./app/freshdesk');
  freshdesk.uploadFiles();
}
// TODO: Remove this once it's definitely no longer needed
if (argv.html) {
  let html = require('./app/html');
  html.docbuildHTML(argv);
}
