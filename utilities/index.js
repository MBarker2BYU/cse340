const inventoryModel = require("../models/inventory-model")
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

module.exports = Util

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
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};


// /* **************************************
// * Build the classification view HTML
// * ************************************ */
// Util.buildClassificationGrid = async function(data){
//   let grid = '';

//   if(data.length > 0){
//     grid = '<ul id="inv-display">'
//     data.forEach(vehicle => { 
//       grid += '<li>'
//       grid +=  '<a href="/inv/detail/'+ vehicle.inv_id 
//       + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
//       + ' details"><img src="' + vehicle.inv_thumbnail 
//       +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
//       +' on CSE Motors" /></a>'
//       grid += '<div class="namePrice">'
//       grid += '<hr />'
//       grid += '<h2>'
//       grid += '<a href="/inv/detail/' + vehicle.inv_id +'" title="View ' 
//       + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
//       + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
//       grid += '</h2>'
//       grid += '<span>$' 
//       + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
//       grid += '</div>'
//       grid += '</li>'
//     })
//     grid += '</ul>'
//   } else { 
//     grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
//   }
//   return grid
// }

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)


// Util.buildVehicleDetailHTML = function(vehicle) {
//   const formattedPrice = vehicle.inv_price.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
//   const formattedMileage = vehicle.inv_miles.toLocaleString('en-US');
//   return `
//     <div class="vehicle-detail">
//       <img src="${vehicle.inv_image}" alt="${vehicle.inv_make} ${vehicle.inv_model}" class="vehicle-image">
//       <div class="vehicle-info">
//         <h1>${vehicle.inv_make} ${vehicle.inv_model}</h1>
//         <p>Year: ${vehicle.inv_year}</p>
//         <p>Price: ${formattedPrice}</p>
//         <p>Mileage: ${formattedMileage} miles</p>
//         <p>Description: ${vehicle.inv_description}</p>
//       </div>
//     </div>
//   `;
// }