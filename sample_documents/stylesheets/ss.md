#### Guidelines to pass the CSS stylesheet 
1. Use --stylesheet_name.css before --pdf to provide the stylesheet you wish to use 
2. Make sure the stylesheet is in the stylesheet folder 
3. Or you just need to change the path in pdf.js file line number 12, change it $__dir/"..","..","stylesheet_name.css" if the stylesheet is held locally in the system  
4. Also for writing the stylesheet you need to specify the html tag for corresponding .md file    like ### stands for H3 , so you want the styling to work on it  
5. There are sample stylesheets under the Stylesheet  
6. for example for an image in the md file , for styling in the stylesheets its specified as:
    img{
        max-height:300px;
        max-width:300px;
    }
    and so on  

#### Some remaining issues 
1. The stylesheets don't seem to be overwriting each other and have to manually the stylesheet name  


