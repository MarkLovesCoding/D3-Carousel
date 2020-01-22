// index.js

/**
 * Required External Modules
 */


 const express = require('express');
 const path = require('path');
 const router = express.Router();
const sass = require('node-sass');
const fs = require('fs')
/**
 * App Variables
 */
 const app = express();
 const port = process.env.PORT || "8000";
/**
 *  App Configuration
 */
app.set("views", path.join(__dirname, "views"));
// app.use( '/' , express.static(path.join(__dirname ,'/..' ,'public')))
app.use(express.static('public'))
// app.use(express.static(path.join(__dirname, 'public')))
// app.use(express.static(path.join(__dirname, 'd3')))
/**
 * Routes Definitions
 */
 router.get("/", (req, res) => {
   res.sendFile(path.join(__dirname+'/views/index.html'));

 });
 app.use('/',router)

 sass.render({
     // file or data must be specified. In this case we're telling node-sass there's a SCSS file at source/style.scss
     file:__dirname+'/public/scss/style.scss'
   },
   // node-sass supports standard nod e style asynchronous callbacks with the signature of function(err, result).
   // In error conditions, the error argument is populated with the error object.
   // In success conditions, the result object is populated with an object describing the result of the render call.
   (error, result) => {
     if (!error) {
       // Asynchronously writes data to a file, replacing the file if it already exists.
       // In this case the file it's writing to is at `public/style.css`
       // The `result` object contains `css`, the compiled CSS. This is what's written to the style.css file
       fs.writeFile(__dirname+'/public/css/style.css', result.css.toString(), error => {
         if (error) {
           console.log(error,"sass write error");
         }
       });
     }
     else{
       console.log(error,"sass render error")
     }
   }
 );
/**
 * Server Activation
 */
 app.listen(port, () => {
   console.log(`Listening to requests on http://localhost:${port}`);
 });
