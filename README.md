
# EdgeScanDocBuilder

### Description
A build script to take documentation written in markdown stored within a git
repository and render it to various output formats.

The formats it supports are:
* PDF
* HTML for uploading to Freshdesk

### Installation

#### Required
* NodeJS

#### Enviornment Variables
DocBuild requires 2 enviornment variables to be set on your local machine:
* **FRESHDESK_TOKEN** (See [FreshDesk's  support page](https://support.freshdesk.com/support/solutions/articles/215517-how-to-find-your-api-key))
* **FRESHDESK_HELPDESK_NAME**

#### For Command Line Usage
To install this program across your system, run the following command in this top-level directory
```
npm install -g
```
This will allow you to call the command "docbuild \[args\]" in any directory on your PC, with docbuild knowing the directory you called it from.
To uninstall:
```
npm uninstall -g
```
We didn't end up using the DockerFile at all.

### Usage
Your documents will have the folder structure documentFolder/ChapterFolder/article.md. Call ```docbuild [args]``` **in the directory containing documentFolder**. You must specify the name of the document folder with ```docbuild --source='./documentFolder'```, else it will default to ```./docs```.

We have given some sample documents to test docbuild out. In this folder we have 'ideal_sample_docs' and 'old_docs' (old_docs is likely out-of-date and doesn't follow the structure that docbuild expects, so you will probably get an error with that folder). We open up cmd inside either of these folders, then run 'docbuild --pdf' or whatever command you want, and it will produce the correct output. 

Within a document, there are a few rules:
* Linking to another file in this document, or a local image, requires ```$$/``` at the start of the link. See the ```.md``` files in ```ideal_sample_docs``` to see examples of this.
* All Article names in a document must be unique from each other, Chapter names must be unique from each other, and all Image names in a document must be unique from each other. If not, this will likely cause overwrites on the FreshDesk website.
* The program currently accepts GIF, JPEG, JPG, TIFF, PNG, BMP filetypes for images, see ```images.js```. Since we're using ImgBB, then this can probably be extended to whatever filetypes ImgBB accepts, or whatever image host you chose to use.

See ```docbuild --help``` for an detailed explanation of the flags you can use to customize your run.

### Styling
CSS can be inputted as a command line argument, but the following snippet from PDF.js determines the border around the document. You may need to play around with these values to see what looks well with the Header and Footer files, as well. See the [md-to-pdf documentation](https://github.com/simonhaenisch/md-to-pdf/blob/master/readme.md) for further customization.
```
    pdf_options: {
      printBackground: true,
      format: 'a4',
      margin: {
        top: '5mm',
        right: '5mm',
        bottom: '10mm',
        left: '5mm',
      },
```

### Group 30 - Team Members:
* Stephen Rowe
* James Rowland
* Kazuhiro Tobita
* Emmet McDonald
* Khushboo Jain
* Cian Mawhinney
