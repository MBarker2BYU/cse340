const utilities = require('../utilities')
const accountModel = require('../models/account-model')
const jwt = require("jsonwebtoken")
const bcrypt = require('bcrypt')
const e = require('connect-flash')
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("./account/login", {
    title: "Login",
    nav,
    account_email: null,
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("./account/registration", {
    title: "Register",
    nav,
    errors: null
  })
}

async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    // Hash the password before storing
    let hashedPassword
    try {
        // regular password and cost (salt is generated automatically)
        hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error processing the registration.')
        res.status(500).render("./account/registration", {
            title: "Registration",
            nav,
            errors: null,
            [BodyElement.ACCOUNT_FIRSTNAME]: account_firstname,
            [BodyElement.ACCOUNT_LASTNAME]: account_lastname,
            [BodyElement.ACCOUNT_EMAIL]: account_email,
            [BodyElement.ACCOUNT_PASSWORD]: account_password,
        })
    }
  
    const regResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        hashedPassword
    )

    if (regResult) {
        req.flash(
            "notice",
            `Congratulations, you\'re registered, ${account_firstname}. Please log in.`
        )
        res.status(201).render("./account/login", {
            title: "Login",
            nav,
            errors: null
        })
    } else {
        req.flash("notice", "Sorry, the registration failed.")
        res.status(501).render("./account/registration", {
            title: "Registration",
            nav,
            errors: null,
            [BodyElement.ACCOUNT_FIRSTNAME]: account_firstname,
            [BodyElement.ACCOUNT_LASTNAME]: account_lastname,
            [BodyElement.ACCOUNT_EMAIL]: account_email,
            [BodyElement.ACCOUNT_PASSWORD]: account_password,
        })
    }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  
    let nav = await utilities.getNav()
  
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)

  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      email: account_email,
    })
    return
  }
  try {

    if (await bcrypt.compare(account_password, accountData.account_password)) {

      delete accountData.account_password
    
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
    
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        email: account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

async function buildManagement(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
    accountData: res.locals.accountData,
  })
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildManagement }