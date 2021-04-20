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
        top: '5mm',
        right: '5mm',
        bottom: '10mm',
        left: '5mm',
      },
      displayHeaderFooter: argv['pdf-headerfooter'],
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

  // Take a look at
  // https://github.com/steviejeebies/EdgeScanDocBuilder/issues/27
  // for a run-through of what the following code is doing

  let firstPageTitle = (argv['pdf-title']) ?
    argv['pdf-title'] : path.basename(argv.source);

  let groupedInput = `# ${firstPageTitle}`;
  targetFiles.forEach(inputFile => {
    let trimmedPath = path.relative(inputDir, inputFile);
    let filePath = trimmedPath.replace('\\', '/');
    console.log(`${trimmedPath} found, adding to PDF...`);

    // break from the previous page
    groupedInput += '<br><div style="page-break-after:always;"></div>\n';

    // indicate the start of a new file
    groupedInput += `<span id=${filePath}></span>`;

    let content = fs.readFileSync(inputFile, 'utf-8');

    // render headers with an ID that includes the file it came from
    // ie. use the file's path as a namespace for the ID
    content = content.replace(
      /^ {0,3}(#{1,6})(.*)(?:\n+|$)/gm,
      function(match, hashes, text) {
        let level = hashes.length;
        let title = text.trim();
        let id = text.toLowerCase().trim()
          .replace(/<[!\/a-z].*?>/ig, '') // remove html tags
          .replace(/[^\w\s]/g, '') // remove invalid chars
          .replace(/\s/g, '-'); // replace whitespace with a hyphen

        return `<span id="${id}"></span>\n` + // this line might be unnecessary
          `<h${level} id="${filePath}#${id}">${title}</h${level}>\n`;
      });

    // allow linking to local images prefixed with `$$/`
    content = content.replace(
      /\!\[([^\[]+)\]\(([^\)]+)\)/gm,
      function(match, title, path) {
        let href = path.replace('$$/', '');
        return `<img src=${href} alt="${title}" />`;
      });

    // allow links to the namespaced IDs
    content = content.replace(
      /\[([^\[]+)\]\(([^\)]+)\)/gm,
      function(match, text, link) {
        // links to another local file begin `$$/`
        let isLocalFile = link.match(/^\$\$\/.*/g);

        // if the link is to a different file
        if (isLocalFile) {
          return `<a href="#${link.replace('$$/', '')}">${text}</a>`;
        }

        // if the link is to within its own file
        if (link[0] === '#') {
          return `<a href="#${filePath}${link}">${text}</a>`;
        }

        // for anything else, just leave it unmodified
        return match;
      });

    groupedInput += content;
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
