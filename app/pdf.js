'use strict';

const { mdToPdf } = require('md-to-pdf');
const path = require('path');
const fs = require('fs');
const glob = require('glob');

// for full md-to-pdf config options see:
// https://github.com/simonhaenisch/md-to-pdf/blob/master/src/lib/config.ts
const outputOptions = {
  // array of paths to stylesheets
  stylesheet:[path.resolve('./StyleSheets/Stylesheet2.css')], 

  // string of extra css properties
  css: '',

  // extra options to pass to marked (the .md to .html renderer)
  marked_options: {},

  // options to be passed to puppeteer's pdf renderer
  pdf_options: {
    printBackground: true,
    format: 'a4',
    margin: {
      top: '30mm',
      right: '40mm',
      bottom: '30mm',
      left: '20mm',
    },
  },

};

let docsDir = 'Sample_document';
let buildDir = './build';

if (!fs.existsSync(buildDir)){
  fs.mkdirSync(buildDir);
}

let targetFiles = glob.sync(`${docsDir}/**/*.md`);

// FIXME: literally no idea why this won't work forwards
targetFiles.reverse().forEach(inputFile => {
  // same name as the input file, and places it in the `build` directory
  let baseName = path.basename(inputFile, path.extname(inputFile));
  let pdfFilePath = path.join(buildDir, baseName + '.pdf');

  mdToPdf({path: inputFile}, outputOptions)
    .then(data => fs.writeFileSync(pdfFilePath, data.content))
    .then(() => console.log(`${path.basename(pdfFilePath)} created!`))
    .catch(console.error);
});
