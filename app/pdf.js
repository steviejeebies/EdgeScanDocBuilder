'use strict';


const { mdToPdf } = require('md-to-pdf');
const path = require('path');
const fs = require('fs');
const glob = require('glob');
const argv = require('./cli');

// Marked documentation says that this is what is used for syntax highlighting,
// but it seems to be enabled by default. To change the syntax highlighter, set
// marked_options: {highlight : yourHighlightingFunction } in the below
// outputOptions variable below.

// eslint-disable-next-line no-unused-vars
let highlight = function(code, lang, callback) {
  // eslint-disable-next-line max-len
  // require('pygmentize-bundled')({ lang: lang, format: 'html' }, code, function(err, result) {
  //   callback(err, result.toString());
  // });
};

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
  groupedInput += '<br><div style="page-break-after:always;"></div>\n';

  // add contents page placeholder
  groupedInput += '<h1 id="toc">Table of contents</h1>\n';
  let toc = [];
  let tocPlaceholder = '<span id="toc-placeholder"></span>';
  groupedInput += `${tocPlaceholder}\n`;

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
        let anchor = `${filePath}#${id}`;

        // add heading details to table of contents
        toc.push({
          title: title,
          level: level,
          anchor: anchor,
        });

        return `<span id="${id}"></span>\n` + // this line might be unnecessary
          `<h${level} id="${anchor}">${title}</h${level}>\n`;
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

  // render the table of contents and add it to the PDF in the appropriate place
  let table = '';
  toc.forEach((heading) => {
    table += `<p style="margin-left: ${(heading.level - 1) * 10}px">
    <a href="#${heading.anchor}">${heading.title}</a>
    </p>
    `;
  });
  groupedInput = groupedInput.replace(tocPlaceholder, table);

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
