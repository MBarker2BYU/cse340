const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/account-controller")
const utilities = require("../utilities")

// Route to build login
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Route to build registration
router.get("/registration", utilities.handleErrors(accountController.buildRegister))

module.exports = router