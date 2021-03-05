
# EdgeScanDocBuilder

### Required
* NodeJS

### Description
A build script to take documentation written in markdown stored within a git
repository and render it to various output formats.

The formats it (will) support are:
* PDF
* HTML for uploading to Freshdesk

### Installation
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


### Group 30 - Team Members:
* Stephen Rowe
* James Rowland
* Kazuhiro Tobita
* Emmet McDonald
* Khushboo Jain
* Cian Mawhinney
