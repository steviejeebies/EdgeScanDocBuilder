#!/usr/bin/env node

'use strict';
// documenation for the yargs library can be found here:
// http://yargs.js.org/docs/
// we can also use this for the environment variable token

const yargs = require('yargs');

// If you run 'docbuild' in cmd in the folder C:/Something/Folder, then this
// will be the string 'C:/Something/Folder'
// const fileDirectory = process.cwd();


// reference for .command():
// http://yargs.js.org/docs/#api-reference-commandcmd-desc-module
const argv = yargs
  .scriptName('docbuild')
  .command('api-call',
    'Makes a call to the FreshDesk API, showing that authentication works')
  .command('freshdesk <url>',
    'Renders documents, uploads to FreshDesk API')
  .command('pdf <url>',
    'Renders documents, generates PDF document')
  .command('full <url>',
    'Renders documents, generates PDF document and uploads to FreshDesk API')

  // seems to be working properly when 0 commands are inputted, but can't
  // figure out for forcing either FreshDesk/PDF/Full modes and refusing input
  // if user inputted more than 1
  .demandCommand(1, 1, 'Need to select a mode', 'Too many modes selected')
  .option('supress', {
    alias: 's',
    description: 'Supress text output from docbuilder, unless error found',
    type: 'boolean',
  })
  .help()
  .alias('help', 'h')
  .argv;

// these are just dummy functions to show how to use the arguments, you can
// change these completely if you want
if (argv._.includes('full')) {
  doFull();
}
if (argv._.includes('pdf')) {
  doPDF();
}
if (argv._.includes('freshdesk')) {
  doFreshDesk();
}
if (argv._.includes('api-call')) {
  makeSimpleAPICall();
}

function makeSimpleAPICall() { console.log('Simple API call made!'); }
function doFull() { console.log('PDF+FRESH CALLED'); }
function doPDF() { console.log('PDF ONLY CALLED'); }
function doFreshDesk() { console.log('FRESH ONLY CALLED'); }

console.log('DIRECTORY PROGRAM WAS CALLED FROM: ' + process.cwd());
console.log('ARGUMENTS AS THEY WERE PROCESSED BY YARG:');
console.log(argv);
