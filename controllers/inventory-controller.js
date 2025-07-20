const inventoryModel = require("../models/inventory-model")
const utilities = require("../utilities")

const inventoryController = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
inventoryController.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await inventoryModel.getInventoryByClassificationId(classification_id)
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
    const vehicleData = await inventoryModel.getVehicleById(vehicleId);

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
};

/* ***************************
 *  Trigger intentional error
 * ************************** */
inventoryController.triggerError = async (req, res, next) => {
  throw new Error('Intentional 500 Error');
};

module.exports = inventoryController;