pandoc doc.md -s -o doc.html # create a new document, doc.html that is doc.md in HTML
pandoc -s -c doc.css -B header.html -A footer.html doc.md -o doc.html # new document with header, footer, and css file doc.css
# Can't see need for commands beyond these two
# -c, -B, and -A don't all need to be used together