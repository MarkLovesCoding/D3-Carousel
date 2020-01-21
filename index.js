// index.js

/**
 * Required External Modules
 */


 const express = require('express');
 const path = require('path');
 const router = express.Router();

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
/**
 * Server Activation
 */
 app.listen(port, () => {
   console.log(`Listening to requests on http://localhost:${port}`);
 });
