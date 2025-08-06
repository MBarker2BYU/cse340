const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/account-controller")
const utilities = require("../utilities")
const accountValidate = require("../utilities/account-validation")

// Route to build login
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Route to build registration
router.get("/registration", utilities.handleErrors(accountController.buildRegister))

// Route to register account management
router.post(
  "/registration",
  accountValidate.registrationRules(),
  accountValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Route to handle account login
router.post(
  "/login",
  accountValidate.loginRules(),
  accountValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildManagement)
)

module.exports = router