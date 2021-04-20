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
  // No use for this at the moment
  // .option('verbose', {
  //   description: 'Provide verbose output from the program',
  //   alias: 'v',
  //   type: 'boolean',
  // })
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
    freshdesk_start_fresh: {
      description: 'Clear current cache file and start over',
      type: 'boolean',
      default: false,
    },
    publish_public: {
      description: 'If `false`, then when the documentation is uploaded ' +
      'to FreshDesk, it will be saved as a draft and will only be visible to ' +
      'you. If `true`, visible to everyone immediately.',
      type: 'boolean',
      default: true,
    },
    // 'freshdesk-ignore-cache': {
    //   description: '',
    //   type: 'boolean',
    //   default: false,
    // },
  })
  .group(
    ['freshdesk', 'FRESHDESK_TOKEN', 'FRESHDESK_HELPDESK_NAME',
      'freshdesk_start_fresh', 'publish_public'],
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
    pdf_title: {
      description: 'The title on the first page of the generated PDF bundle',
      default: 'Documentation Bundle',
      type: 'string',
    },
    pdf_headerfooter: {
      description: 'Option to render the header and footer in the document',
      default: true,
      type: 'boolean',
    },
  })
  .group(
    ['pdf', 'pdf_destination', 'pdf_title', 'pdf_headerfooter', 'stylesheet'],
    'PDF:')
  // No use for this
  // .options({
  //   html: {
  //   description: 'Test command during development, produces HTML files only',
  //     type: 'boolean',
  //   },
  //   html_destination: {
  //     description: 'The folder to store the generated HTML',
  //     default: './html',
  //     type: 'string',
  //   },
  // })
  // .group(
  //   ['html', 'html_destination'],
  //   'HTML:')
  .help()
  .alias('help', 'h')
  .showHelpOnFail()

  // help message is at least 80 characters wide
  .wrap(Math.max(80, yargs.terminalWidth() * 0.75))
  .argv;
