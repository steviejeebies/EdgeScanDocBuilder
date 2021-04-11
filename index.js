#!/usr/bin/env node

'use strict';

const argv = require('./app/cli');
const fs = require('fs');

if(argv.test) {
  let images = require('./app/images');
  images.uploadImages('./docs');
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