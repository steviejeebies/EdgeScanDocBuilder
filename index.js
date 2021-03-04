#!/usr/bin/env node

'use strict';

const yargs = require('yargs');


const argv = yargs
  .scriptName('docbuild')
  .command('freshdesk',
    'Renders documents, uploads to FreshDesk API')
  .command('pdf',
    'Renders documents, generates PDF document')

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

if (argv._.includes('pdf')) {
  // require('./app/pdf');
  console.log('PDF mode running');
}
if (argv._.includes('freshdesk')) {
  require('./app/freshdesk');
}
if(argv._.includes('html')) {
  //require('./app/html');
}
