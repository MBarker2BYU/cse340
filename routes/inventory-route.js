// Needed Resources 
const express = require("express")
const router = new express.Router() 
const inventoryController = require("../controllers/inventory-controller")
const utilities = require("../utilities/")
const inventoryValidation = require("../utilities/inventory-validation")

// Route to build inventory by classification view
router.get("/type/:classificationId",  utilities.handleErrors(inventoryController.buildByClassificationId));
router.get('/detail/:inv_id', utilities.handleErrors(inventoryController.getVehicleDetail));

// Inventory error handling route
router.get('/error', utilities.handleErrors(inventoryController.triggerError));

router.get("/", 
  utilities.checkAccountType,
  utilities.handleErrors(inventoryController.buildManagementView));

router.get("/newClassification", 
  utilities.checkAccountType,
  utilities.handleErrors(inventoryController.newClassificationView));

router.post("/addClassification",
  utilities.checkAccountType, 
  inventoryValidation.classificationRule(),
  inventoryValidation.checkClassificationData,
  utilities.handleErrors(inventoryController.addClassification));

router.get("/newVehicle", utilities.handleErrors(inventoryController.newInventoryView));

router.post("/addInventory",
  utilities.checkAccountType,
  inventoryValidation.newInventoryRules(),
  inventoryValidation.checkInventoryData,
  utilities.handleErrors(inventoryController.addInventory));

router.get(
  "/getInventory/:classification_id",
  utilities.checkAccountType,
  utilities.handleErrors(inventoryController.getInventoryJSON)
)

router.get(
  "/edit/:inv_id",
  utilities.checkAccountType,
  utilities.handleErrors(inventoryController.editInvItemView)
)

router.post(
  "/update",
  utilities.checkAccountType,
  inventoryValidation.newInventoryRules(),
  inventoryValidation.checkUpdateData,
  utilities.handleErrors(inventoryController.updateInventory)
)

router.get(
  "/delete/:inv_id",
  utilities.checkAccountType,
  utilities.handleErrors(inventoryController.deleteView)
)

router.post("/delete", 
utilities.checkAccountType, 
utilities.handleErrors(inventoryController.deleteItem)
)

router.get("/triggerError", (req, res) => 
  utilities.triggerError(res, "This is a test error for inventory route.")
);

module.exports = router;