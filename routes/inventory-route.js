// Needed Resources 
const express = require("express")
const router = new express.Router() 
const inventoryController = require("../controllers/inventory-controller")
const utilities = require("../utilities/")

// Route to build inventory by classification view
router.get("/type/:classificationId",  utilities.handleErrors(inventoryController.buildByClassificationId));
router.get('/detail/:inv_id', utilities.handleErrors(inventoryController.getVehicleDetail));

// Inventory error handling route
router.get('/error', utilities.handleErrors(inventoryController.triggerError));

async function triggerError(req, res, next) {
  try {
    throw new Error('Intentional 500 Error');
  } catch (error) {
    error.status = 500;
    next(error);
  }
}

module.exports = {router, triggerError};