const utilities = require(".")
const accountModel = require("../models/account-model")
const { body, validationResult } = require("express-validator")
const validate = {}

const BodyElement = Object.freeze ({
    ACCOUNT_FIRSTNAME: "account_firstname",
    ACCOUNT_LASTNAME: "account_lastname",
    ACCOUNT_EMAIL: "account_email",
    ACCOUNT_PASSWORD: "account_password",
});

const ViewName = Object.freeze({
    REGISTRATION: "account/register",
    LOGIN: "account/login"
})

validate.registrationRules = () => {
  return [
    // name is required and must be string
    body(BodyElement.ACCOUNT_FIRSTNAME)
      .trim()
      .isString()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."), // on error this message is sent.

    // name is required and must be string
    body(BodyElement.ACCOUNT_LASTNAME)
      .trim()
      .isString()
      .isLength({ min: 1 })
      .withMessage("Please provide a last name."), // on error this message is sent.

    // valid email is required and cannot already exist in the database
    body(BodyElement.ACCOUNT_EMAIL)
      .trim()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists) {
          throw new Error("Email exists. Please login or use different email")
        }
      }),

    // password is required and must be strong password
    body(BodyElement.ACCOUNT_PASSWORD)
      .trim()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ]
}


validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()

    res.render(ViewName.REGISTRATION, {
      errors,
      title: "Registration",
      nav,
      [BodyElement.ACCOUNT_FIRSTNAME]: account_firstname,
      [BodyElement.ACCOUNT_LASTNAME]: account_lastname,
      [BodyElement.ACCOUNT_EMAIL]: account_email,
    })
    return
  }
  next()
}

validate.loginRules = () => {
  return [
    // valid email is required and cannot already exist in the database
    body(BodyElement.ACCOUNT_EMAIL)
      .trim()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required."),

    // password is required and must be strong password
    body(BodyElement.ACCOUNT_PASSWORD)
      .trim()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ]
}

validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render(ViewName.LOGIN, {
      errors,
      title: "Login",
      nav,
      [BodyElement.ACCOUNT_EMAIL]: account_email,
    })
    return
  }
  next()
}

module.exports = validate