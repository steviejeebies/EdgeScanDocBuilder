// NOT TESTED! Probably doesn't need to be it's
// own file, but it will be while I try to make it work
// const path = require('path');
'use strict';

const { exec } = require('child_process');
const glob = require('glob');

const css = 'defaultCSS.css';
const fileDirectory = process.cwd();

// for all files
let targetFiles = glob.sync(`${fileDirectory}/**/*.md`);

// should store html version in fileDirectory/[relativePath],
// with an as-of-yet uncreated css file
targetFiles.forEach(inputFile => {
  exec(`pandoc -s -c ${css} "${inputFile}" -o "${inputFile}.html"`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(error);
        return;
      }
      console.log(stdout);
    });
});
