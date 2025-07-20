/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventory-route");
const utilities = require("./utilities/");

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root

app.use(async (req, res, next) => {
    try {
        res.locals.nav = await utilities.getNav();
        next();
    } catch (err) {
        next(err); // Pass any errors to the 500 handler
    }
});

/* ***********************
 * Routes
 *************************/
app.use(utilities.handleErrors(static))
app.get("/", utilities.handleErrors(baseController.buildHome))
app.use("/inv", utilities.handleErrors(inventoryRoute.router));

app.get("/test404", (req, res) => res.status(404).render('errors/error', { title: 'Test 404', message: 'Test 404 message' }));

// 404 Error Handler
app.use((req, res, next) => {
  console.log(`404 Handler: ${req.originalUrl}`);
    res.status(404).render('errors/error', {
      title: 'Error 404 - Page Not Found',
      message: 'The page you are looking for called in lost and won\'t be in today. Try again Tomorrow.',
  });
});

/* ***********************
 * Express Error Handler
 * For unhandled server errors only
 *************************/
app.use(async (err, req, res, next) => {
    console.error(`Error at: "${req.originalUrl}": ${err.message}`);
    try {
        res.status(500).render("errors/error", {
            title: "Server Error",
            message: "We've hit the wall in turn 4 doing a buck fifty and cracked up the car. Our pit crew is on it!"
            // nav is already in res.locals from the middleware
        });
    } catch (err) {
        next(err); // Handle any rendering errors
    }
});

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 3000
const host = process.env.HOST || "localhost"

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})