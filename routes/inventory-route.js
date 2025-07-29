// Needed Resources 
const express = require("express")
const router = new express.Router() 
const inventoryController = require("../controllers/inventory-controller")
const utilities = require("../utilities/")
const validation = require("../utilities/inventory-validation")

// Route to build inventory by classification view
router.get("/type/:classificationId",  utilities.handleErrors(inventoryController.buildByClassificationId));
router.get('/detail/:inv_id', utilities.handleErrors(inventoryController.getVehicleDetail));

// Inventory error handling route
router.get('/error', utilities.handleErrors(inventoryController.triggerError));

async function triggerError(req, res, next) {
  next(new Error('Intentional 500 Error'));  
}

router.get(
  "/broken",
  utilities.handleErrors(inventoryController.triggerError)
);

router.get(
  "/",
  //utilities.checkAccountType,
  utilities.handleErrors(inventoryController.buildManagementView)
);

// Route to build new classification view
router.get(
  "/newClassification",
  utilities.handleErrors(inventoryController.buildNewClassificationView)
);

// Route to add new classification
router.post(
  "/addClassification",
  validation.validateNewClassification,
  utilities.handleErrors(inventoryController.addClassification)
);

// Route to build new inventory view
router.get(
  "/newVehicle",
  utilities.handleErrors(inventoryController.buildNewInventoryView)
);

// Route to add new inventory
router.post(
  "/addInventory",
  validation.validateNewInventory,
  utilities.handleErrors(inventoryController.addInventory)
);


module.exports = {router, triggerError};