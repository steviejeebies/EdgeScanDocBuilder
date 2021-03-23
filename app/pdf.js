'use strict';


const { mdToPdf } = require('md-to-pdf');
const path = require('path');
const fs = require('fs');
const glob = require('glob');
const argv = require('./cli');

async function docbuildPDF() {
  let inputDir = argv.source;
  let outputDir = argv.pdf_destination;
  let templatesDir = path.join(__dirname, 'resources');

  // for full md-to-pdf config options see:
  // https://github.com/simonhaenisch/md-to-pdf/blob/master/src/lib/config.ts
  const outputOptions = {
    basedir: inputDir,

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
      displayHeaderFooter: true,
      headerTemplate: fs.readFileSync(`${templatesDir}/header.html`, 'utf-8'),
      footerTemplate: fs.readFileSync(`${templatesDir}/footer.html`, 'utf-8'),
    },
  };

  // add any stylesheets in a way that it doesn't override the default one when
  // none are explicitly passed to docbuild
  if (argv.stylesheet !== undefined) {
    outputOptions.stylesheet = [argv.stylesheet];
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  let targetFiles = glob.sync(`${inputDir}/**/*.md`);

  // TODO: make title configurable
  let groupedInput = '# Documentation Bundle';
  targetFiles.forEach(inputFile => {
    let trimmedPath = path.relative(inputDir, inputFile);
    console.log(`${trimmedPath} found, adding to PDF...`);

    // break from the previous page...
    groupedInput += '<br><div style="page-break-after:always;"></div>\n';
    // ...then append the contents of the file
    groupedInput += fs.readFileSync(inputFile, 'utf-8');
  });

  let pdfFilePath = path.join(outputDir, 'documentation.pdf');

  mdToPdf({ content: groupedInput }, outputOptions)
    .then(data => fs.writeFileSync(pdfFilePath, data.content))
    .then(() => console.log(`Final PDF ${path.basename(pdfFilePath)} created!`))
    .catch(console.error);
}

// allow resources to be accessed from outside this module
module.exports = {
  docbuildPDF,
};
