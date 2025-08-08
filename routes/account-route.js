const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/account-controller")
const utilities = require("../utilities")
const accountValidate = require("../utilities/account-validation").validate

// Route to build login
router.get("/login", utilities.handleErrors(accountController.buildLogin))

router.get("/logout", utilities.handleErrors(accountController.accountLogout))

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

// Route to build account management
router.get(
  "/profile/:account_id",
  utilities.handleErrors(accountController.buildProfileManagement)
)

router.post(
  "/update",
  utilities.checkLogin, 
  accountValidate.updateProfileRules(),
  accountValidate.checkUpdateProfileData,
  utilities.handleErrors(accountController.updateProfile)
)

// Route to handle password change
router.post(
  "/password",
  utilities.checkLogin,
  accountValidate.changePasswordRules(),
  accountValidate.checkChangePasswordData,
  utilities.handleErrors(accountController.changePassword)
)

module.exports = router