'use strict';

const yargs = require('yargs');


module.exports = yargs
  .scriptName('docbuild')

  // allow environment variables to be read by yargs
  .env()

  // Global options
  .option('source', {
    description: 'The source folder containing the markdown documents',
    default: './docs',
    type: 'string',
  })
  .option('verbose', {
    description: 'Provide verbose output from the program',
    alias: 'v',
    type: 'boolean',
  })
  .option('stylesheet', {
    description: 'Provide a stylesheet for the markdown document',
    type: 'string',
  })

  // Freshdesk related options
  .options({
    freshdesk: {
      description: 'Renders documents then uploads to FreshDesk API\n' +
      'Requires the FRESHDESK_TOKEN and FRESHDESK_HELPDESK_NAME environment ' +
      'variables be specified. (or --freshdesk-token and ' +
      '--freshdesk-helpdesk-name CLI arguments be given).\n',
      implies: ['freshdesk-token', 'freshdesk-helpdesk-name'],
      type: 'boolean',
    },
    // The prefered way to pass these sensitive arguments is through environment
    // variables. So name the option like this so the user is reminded to
    // specify `FRESHDESK_TOKEN` rather than `freshdesk-token` for example
    FRESHDESK_TOKEN: {
      description: 'API token to be used for interacting with freshdesk.',
      // Counterintuitively, setting the alias allows this variable to be
      // presented in the args object as `FRESHDESK_TOKEN` rather than
      // `freshdesk-token`.
      alias: 'freshdesk-token',
      hidden: true,
      type: 'string',
    },
    FRESHDESK_HELPDESK_NAME: {
      description: 'Freshdesk site documentation should be uploaded to',
      alias: 'freshdesk-helpdesk-name',
      hidden: true,
      type: 'string',
    },
  })
  .group(
    ['freshdesk', 'FRESHDESK_TOKEN', 'FRESHDESK_HELPDESK_NAME'],
    'Freshdesk Upload:')

  // PDF Renderer related options
  .options({
    pdf: {
      description: 'Renders documents to PDF format',
      type: 'boolean',
    },
    pdf_destination: {
      description: 'The folder to store the generated PDFs',
      default: './pdf',
      type: 'string',
    },
    // TODO: complete this set of options
  })
  .group(
    ['pdf', 'pdf_destination'],
    'PDF:')
  .options({
    html: {
      description: 'Test command during development, produces HTML files only',
      type: 'boolean',
    },
    html_destination: {
      description: 'The folder to store the generated HTML',
      default: './html',
      type: 'string',
    },
  })
  .group(
    ['html', 'html_destination'],
    'HTML:')
  .help()
  .alias('help', 'h')
  .showHelpOnFail()

  // help message is at least 80 characters wide
  .wrap(Math.max(80, yargs.terminalWidth() * 0.75))
  .argv;
