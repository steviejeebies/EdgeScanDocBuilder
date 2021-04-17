#!/usr/bin/env node

'use strict';

const argv = require('./app/cli');

if (argv.test) {
  let cache = require('./app/cacheFreshDesk.js');
  cache.readOrCreateFreshDeskCacheFile();
  cache.updateFreshDeskCacheFile();
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
