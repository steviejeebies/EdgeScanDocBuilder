//NOT TESTED! Probably doesn't need to be it's own file, but it will be while I try to make it work

const path = require('path');

const css = "defaultCSS.css"
const fileDirectory = process.cwd();

//for all files
var docName; //= name of file
var newDirectory = fileDirectory + "/" + path.relative(process.cwd(), path.resolve(docName));
exec("pandoc -s -c" + css + " " + docName + ".md -o " + newDirectory + "/" + docName".html") //should store html version in fileDirectory/[relativePath], with an as-of-yet uncreated css file