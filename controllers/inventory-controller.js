const invModel = require("../models/inventory-model")
const utilities = require("../utilities")

const inventoryController = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
inventoryController.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)

  let nav = await utilities.getNav()

  const className = data && data[0] ? data[0].classification_name : 'Unknown';
  
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

inventoryController.getVehicleDetail = async function (req, res, next) {  
    const vehicleId = req.params.inv_id;
    const vehicleData = await invModel.getVehicleById(vehicleId);

    console.log(`Fetching vehicle with ID: ${vehicleId}`);
    console.log(`Vehicle data: ${JSON.stringify(vehicleData)}`);

    if (!vehicleData) 
        throw new Error('Vehicle not found');

    const nav = await utilities.getNav();
    
    res.render("./inventory/detail", {
      title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
      nav,
      vehicle: vehicleData // Pass vehicle data directly

    });
}

inventoryController.buildManagementView = async (req, res, next) => 
  {
    const nav = await utilities.getNav();
    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null
    });
  }

inventoryController.buildNewClassificationView = async (req, res, next) => 
  {
    const nav = await utilities.getNav();
    res.render("./inventory/add-classification", {
      title: "New Vehicle Classification",
      nav,
      errors: null
    });
  }

const handleInsertResults = async (req, res, results, successTitle, successMessage, failureTitle, failureView) => {

  let nav = await utilities.getNav().catch(() => null || []);

  try {

    if (results) {

      req.flash("message success", successMessage(results));

      res.status(201).render("inventory/management", {
        title: successTitle,
        navigation: nav,
        errors: null
      });

    } else {

      req.flash("message warning", "Sorry, the insert failed.");

      res.status(501).render(failureView, {
        title: failureTitle,  
        nav,
        errors: null
      });

    }

  } catch (error) {

    console.error(`${failureTitle} error`, error);

    req.flash("message warning", "Sorry, the insert failed.");

    res.status(501).render(failureView, {
      title: failureTitle,
      nav,
      errors: null
    });

  }
}

inventoryController.addClassification = async (req, res, next) => {

  const { classification_name } = req.body;
  const insertResult = await invModel.addClassification({ classification_name });

  await handleInsertResults(
    req,
    res,
    insertResult,
    "Vehicle Management",
    (result) => `The ${result.classification_name} classification was successfully added.`,
    "Add New Classification",
    "inventory/add-classification"
  );
  
}

inventoryController.buildNewInventoryView = async (req, res, next) =>{
  const nav = await utilities.getNav();
  const classificationSelect = await utilities.buildClassificationList()

  res.render("./inventory/add-inventory", {
    title: "Add New Inventory",
    nav,
    classificationSelect: classificationSelect,
    errors: null
  });
}

inventoryController.addInventory = async function (req, res, next) {

  try {
    
    const {
      inventoryMake,
      inventoryModel,
      inventoryDescription,
      inventoryImage,
      inventoryThumbnail,
      inventoryPrice,
      inventoryYear,
      inventoryMiles,
      inventoryColor,
      classification_id,
    } = req.body;  

    const insertResult = await invModel.addInventory(
      inventoryMake,
      inventoryModel,
      inventoryDescription,
      inventoryImage,
      inventoryThumbnail,
      inventoryPrice,
      inventoryYear,
      inventoryMiles,
      inventoryColor,
      classification_id
    );

    await handleInsertResults(
      req,
      res,
      insertResult,
      "Inventory Management",
      (result) => `The ${result.inv_Make} ${result.inv_Model} was successfully added.`,
      "Add New Inventory",
      "inventory/add-inventory",
      { classificationSelect: await utilities.buildClassificationList(classification_id) }
    );  

  } catch (error) {

    console.error('Error adding inventory:', error);
    req.flash('error', 'Failed to add inventory item. Please try again.');
    
    return res.redirect('/inv/add-inventory');

  }

};

/* ***************************
 *  Trigger intentional error
 * ************************** */
inventoryController.triggerError = async (req, res, next) => {
  throw new Error('Intentional 500 Error');
};

module.exports = inventoryController;