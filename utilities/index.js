const inventoryModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const Util = {}


/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await inventoryModel.getClassifications()
  let list = '<ul class="nav-list">'
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data) {
  let grid = '';
  if (data.length > 0) {
    grid = '<div class="inventory-grid">';
    data.forEach(vehicle => { 
      grid += '<div class="inventory-card">';
      grid += '<div class="card-image-container">'; // New div wrapper
      grid += '<a href="/inv/detail/' + vehicle.inv_id +
        '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">';
      grid += '<img src="' + vehicle.inv_thumbnail +
        '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model +
        ' on CSE Motors" class="card-image">';
      grid += '</a>';
      grid += '</div>'; // Close image container
      grid += '<div class="card-content">';
      grid += '<h2>';
      grid += '<a href="/inv/detail/' + vehicle.inv_id + '" title="View ' +
        vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' +
        vehicle.inv_make + ' ' + vehicle.inv_model + '</a>';
      grid += '</h2>';
      grid += '<span>$' +
        new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>';
      grid += '</div>';
      grid += '</div>';
    });
    grid += '</div>';
  } else { 
    throw new Error('No matching vehicles found');
  }
  return grid;
};

Util.buildClassificationList = async function (classification_id = null) {
    let data = await inventoryModel.getClassifications()
    let classificationList =
        '<select name="classification_id" id="classificationList" required>'
    classificationList += "<option value=''>Choose a Classification</option>"
    data.rows.forEach((row) => {
        classificationList += '<option value="' + row.classification_id + '"'
        if (
            classification_id != null &&
            row.classification_id == classification_id
        ) {
            classificationList += " selected "
        }
        classificationList += ">" + row.classification_name + "</option>"
    })
    classificationList += "</select>"
    return classificationList
}

Util.buildSingleVehicleDisplay = async function (data) {
    let grid = '<section id="vehicle-display">'
    grid += `<div>`
    grid += '<section class="imagePrice">'
    grid += `<img src="${data.inv_image}" alt="Image of ${data.inv_make} ${data.inv_model}">`
    grid += '</section>'
    grid += '<section class="vehicleDetail">'
    grid += "<h3> " + data.inv_make + " " + data.inv_model + " Details</h3>"
    grid += '<ul id="vehicle-details">'
    grid +=
        "<li><h4>Price: $" +
        new Intl.NumberFormat("en-US").format(data.inv_price) +
        "</h4></li>"
    grid += "<li><h4>Description:</h4> " + data.inv_description + "</li>"
    grid += "<li><h4>Color:</h4> " + data.inv_color + "</li>"
    grid +=
        "<li><h4>Miles:</h4> " +
        new Intl.NumberFormat("en-US").format(data.inv_miles) +
        "</li>"
    grid += "</ul>"
    grid += "</section>"
    grid += `</div>`
    return grid
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
 if (req.cookies.jwt) {
  jwt.verify(
   req.cookies.jwt,
   process.env.ACCESS_TOKEN_SECRET,
   function (err, accountData) {
    if (err) {
     req.flash("notice", "Please log in")
     res.clearCookie("jwt")
     return res.redirect("/account/login")
    }
    res.locals.accountData = accountData
    res.locals.loggedin = 1
    next()
   })
 } else {
  next()
 }
}

Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

Util.checkAccountType = (req, res, next) => {
  if (res.locals.accountData && (res.locals.accountData.account_type.toLowerCase() === 'admin' || res.locals.accountData.account_type.toLowerCase() === 'employee')) {
    next()
  } else {
    req.flash("notice", "You do not have permission to perform this action.")
    return res.redirect("/account/login")
  }
}

module.exports = Util