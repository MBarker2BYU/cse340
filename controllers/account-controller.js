const utilities = require('../utilities')
const accountModel = require('../models/account-model')
const priceWatchModel = require("../models/price-watch-model");
const { BodyElement } = require('../utilities/account-validation')
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
  const account_id = res.locals.accountData.account_id;
  try {
    const priceWatchAlerts = await priceWatchModel.checkPriceWatchesOnManagement(account_id);
    // Add flash messages for triggered price watches
    if (priceWatchAlerts && priceWatchAlerts.length > 0) {
      priceWatchAlerts.forEach(alert => {
        req.flash(alert.type, alert.text);
      });
    }
    res.render("account/management", {
      title: "Account Management",
      nav,
      errors: null,
      accountData: res.locals.accountData,
    })
  } catch (error) {
    next(error);
  }
}

async function accountLogout(req, res) {
  res.clearCookie("jwt")
  req.flash("notice", "You have been logged out.")
  res.redirect("/account/login")
}


async function buildProfileManagement(req, res) {
  let nav = await utilities.getNav();
  const account_id = req.params.account_id; // From /account/profile/:account_id
  const accountData = await accountModel.getAccountById(account_id);
  if (!accountData) {
    req.flash("notice", "No account found with that ID.");
    return res.redirect("/account/");
  }
  res.render("account/profile-editor", {
    title: "Profile Management",
    nav,
    errors: null,
    accountData, // Pass as object
    account_id,
  });
}

async function updateProfile(req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_id } = req.body;
  try {
    const updatedAccount = await accountModel.getAccountById(account_id);
    if (!updatedAccount) {
      req.flash("notice", "No account found with that ID.");
      return res.redirect("/account/");
    }
    updatedAccount.account_firstname = account_firstname;
    updatedAccount.account_lastname = account_lastname;
    updatedAccount.account_email = account_email;

    const results = await accountModel.updateProfile(
      updatedAccount.account_id,
      updatedAccount.account_firstname,
      updatedAccount.account_lastname,
      updatedAccount.account_email
    );

    if (!results) {
      req.flash("notice", "Error updating profile. Please try again.");
      return res.redirect(`/account/profile/${account_id}`);
    }

    req.flash("notice", "Profile updated successfully.");
    return res.redirect("/account/");

  } catch (error) {
    req.flash("notice", "Error updating profile. Please try again.");
    res.redirect(`/account/profile/${account_id}`);
  }
}

async function changePassword(req, res) {
  let nav = await utilities.getNav();
  const { account_password, account_id } = req.body;
  try {
    const updatedAccount = await accountModel.getAccountById(account_id);
    if (!updatedAccount) {
      req.flash("notice", "No account found with that ID.");
      return res.redirect("/account/");
    }
    updatedAccount.account_password = await bcrypt.hashSync(account_password, 10);

    const results = await accountModel.updateAccountPassword(updatedAccount.account_id, updatedAccount.account_password);
    
    if (!results) {
      req.flash("notice", "Error updating password. Please try again.");
      return res.redirect(`/account/profile/${account_id}`);
    }
    
    req.flash("notice", "Password updated successfully.");
    return res.redirect("/account/");

  } catch (error) {
    req.flash("notice", "Error changing password. Please try again.");
    res.redirect(`/account/profile/${account_id}`);
  }
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildManagement, accountLogout, buildProfileManagement, updateProfile, changePassword }