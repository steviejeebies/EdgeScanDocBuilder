
# Here are some sample command line arguments that we can use with DocBuild

# PDF only, with and without Stylesheets
docbuild --pdf --pdf_headerfooter=false --pdf-title="Guide on Markdown Formatting"
docbuild --pdf --stylesheet="../stylesheets/retro.css" --pdf-title="Guide on Markdown Formatting"

# Running FreshDesk only
docbuild --freshdesk 

# Running both at the same time
docbuild --freshdesk --pdf --pdf-title="Guide on Markdown Formatting"