// Needed Resources 
const express = require("express")
const router = new express.Router() 
const inventoryController = require("../controllers/inventory-controller")
const utilities = require("../utilities/")
const inventoryValuation = require("../utilities/inventory-validation")


// Route to build inventory by classification view
router.get("/type/:classificationId",  utilities.handleErrors(inventoryController.buildByClassificationId));
router.get('/detail/:inv_id', utilities.handleErrors(inventoryController.getVehicleDetail));

// Inventory error handling route
router.get('/error', utilities.handleErrors(inventoryController.triggerError));

router.get("/", utilities.handleErrors(inventoryController.buildManagementView));

router.get("/newClassification", utilities.handleErrors(inventoryController.newClassificationView));

router.post("/addClassification", 
  inventoryValuation.classificationRule(),
  inventoryValuation.checkClassificationData,
  utilities.handleErrors(inventoryController.addClassification));

router.get("/newVehicle", utilities.handleErrors(inventoryController.newInventoryView));

router.post("/addInventory", 
  inventoryValuation.newInventoryRules(),
  inventoryValuation.checkInventoryData,
  utilities.handleErrors(inventoryController.addInventory));


router.get("/triggerError", (req, res) => 
  utilities.triggerError(res, "This is a test error for inventory route.")
);

module.exports = router;