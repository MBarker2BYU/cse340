const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/account-controller")
const utilities = require("../utilities")
const regValidate = require('../utilities/account-validation')

// Route to build login
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Route to build registration
router.get("/registration", utilities.handleErrors(accountController.buildRegister))

// Process the registration data
router.post( "/register", 
  regValidate.registationRules(), 
  regValidate.checkRegData, 
  utilities.handleErrors(accountController.registerAccount))

// Process the login attempt
router.post(
  "/login",
  regValidate.registationRules(), 
  regValidate.checkRegData, 
  utilities.handleErrors(accountController.accountLogin)
)

module.exports = router