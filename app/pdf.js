'use strict';

// required to pass command line arguments from index.js
module.exports = {
  docbuildPDF: docbuildPDF,
};

function docbuildPDF(argv) {
  const { mdToPdf } = require('md-to-pdf');
  const path = require('path');
  const fs = require('fs');
  const glob = require('glob');

  // for full md-to-pdf config options see:
  // https://github.com/simonhaenisch/md-to-pdf/blob/master/src/lib/config.ts
  const outputOptions = {
    // array of paths to stylesheets
    // stylesheet:[path.resolve('./StyleSheets/Stylesheet2.css')],

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

  let inputDir = argv.source;
  let outputDir = argv.pdf_destination;

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  let targetFiles = glob.sync(`${inputDir}/**/*.md`);

  // FIXME: literally no idea why this won't work forwards
  // Stephen: I removed .reverse(), but `docbuild --pdf` needs to be called
  // in the sample_documents folder (i.e the directory that contains the
  // docs/ folder)
  targetFiles.reverse().forEach(inputFile => {
    // same name as the input file, and places it in the `build` directory
    let baseName = path.basename(inputFile, path.extname(inputFile));

    console.log('BASE NAME' + baseName.toUpperCase());
    let pdfFilePath = path.join(outputDir, baseName + '.pdf');

    mdToPdf({ path: inputFile }, outputOptions)
      .then(data => fs.writeFileSync(pdfFilePath, data.content))
      .then(() => console.log(`${path.basename(pdfFilePath)} created!`))
      .catch(console.error);
  });
}
