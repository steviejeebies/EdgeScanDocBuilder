/* eslint-disable no-unused-vars */
// Stephen: Commenting this part out just so we have to demo
// version working. This is more-or-less a copy of Cian's PDF file

// // NOT TESTED! Probably doesn't need to be it's
// // own file, but it will be while I try to make it work
// // const path = require('path');
// 'use strict';

// const { exec } = require('child_process');
// const glob = require('glob');

// const css = 'defaultCSS.css';
// const fileDirectory = process.cwd();

// // for all files
// let targetFiles = glob.sync(`${fileDirectory}/**/*.md`);

// // should store html version in fileDirectory/[relativePath],
// // with an as-of-yet uncreated css file
// targetFiles.forEach(inputFile => {
//   exec(`pandoc -s -c ${css} "${inputFile}" -o "${inputFile}.html"`,
//     (error, stdout, stderr) => {
//       if (error) {
//         console.error(error);
//         return;
//       }
//       console.log(stdout);
//     });
// });

'use strict';

// required to pass command line arguments from index.js
module.exports = {
  docbuildHTML: docbuildHTML,
};

// for full md-to-pdf config options see:
// https://github.com/simonhaenisch/md-to-pdf/blob/master/src/lib/config.ts
const outputOptions = {
  // array of paths to stylesheets
  // stylesheet:[path.resolve('./StyleSheets/Stylesheet2.css')],

  // string of extra css properties
  css: '',
  as_html: true,

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

function docbuildHTML(argv) {
  const { mdToPdf } = require('md-to-pdf');
  const path = require('path');
  const fs = require('fs');
  const glob = require('glob');

  let inputDir = argv.source;
  let outputDir = argv.html_destination;

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  let targetFiles = glob.sync(`${inputDir}/**/*.md`);

  // // FIXME: literally no idea why this won't work forwards
  // // Stephen: I removed .reverse(), but `docbuild --html` needs to be called
  // // in the sample_documents folder (i.e the directory that contains
  // // the docs/ folder)
  targetFiles.reverse().forEach(inputFile => {
    // same name as the input file, and places it in the `build` directory
    let baseName = path.basename(inputFile, path.extname(inputFile));

    console.log('BASE NAME' + baseName.toUpperCase());
    let htmlFilePath = path.join(outputDir, baseName + '.html');

    mdToPdf({ path: inputFile }, outputOptions)
      .then(data => fs.writeFileSync(htmlFilePath, data.content))
      .then(() => console.log(`${path.basename(htmlFilePath)} created!`))
      .catch(console.error);
  });
}
