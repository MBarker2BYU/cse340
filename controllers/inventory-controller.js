const inventoryModel = require("../models/inventory-model")
const utilities = require("../utilities")

const inventoryController = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
inventoryController.buildByClassificationId = async function (req, res, next) {

  const classification_id = req.params.classificationId
  let data = await inventoryModel.getInventoryByClassificationId(classification_id)

  let nav = await utilities.getNav()

  if (!data || data.length === 0) {

      data = await inventoryModel.getClassificationName(classification_id);

      let className = data && data[0] ? data[0].classification_name : 'Unknown';

      return res.render("./inventory/classification", {
      title: `${className} Vehicles`,
      nav,
      grid: "No vehicles found for this classification.",
    });
  }

  const grid = await utilities.buildClassificationGrid(data)
  className = data && data[0] ? data[0].classification_name : 'Unknown';
  
  res.render("./inventory/classification", {
    title: `${className} Vehicles`,
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

inventoryController.buildManagementView = async function (req, res, next) {
  let nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList()
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
    errors: null,
    classificationSelect,
  })
}

inventoryController.newClassificationView = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
  })
}

inventoryController.addClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  const { classification_name } = req.body
  const insertResult = await inventoryModel.addClassification(classification_name)

  if (insertResult) {
    nav = await utilities.getNav()
    req.flash("message success", `The ${insertResult.classification_name} classification was successfully added.`)
    res.status(201).render("inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null,
    })
  } else {
    req.flash("message warning", "Sorry, the insert failed.")
    res.status(501).render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null,
    })
  }
}

inventoryController.newInventoryView = async function (req, res, next) {

  let nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList()
  
  res.render("./inventory/add-inventory", {
    title: "Add New Inventory",
    nav,
    classificationSelect: classificationSelect,
    errors: null,
  })
}

inventoryController.addInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const insertResult = await inventoryModel.addInventory(
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (insertResult) {
    const itemName = insertResult.inv_make + " " + insertResult.inv_model
    const classificationSelect = await utilities.buildClassificationList()
    req.flash("message success", `The ${itemName} was successfully added.`)
    res.status(201).render("./inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null,
      classificationSelect,
    })
  } else {
    const classificationSelect = await utilities.buildClassificationList()
    req.flash("message warning", "Sorry, the insert failed.")
    res.status(501).render("./inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationSelect: classificationSelect,
      errors: null,
    })
  }
}

/* ***************************
 *  Trigger intentional error
 * ************************** */
inventoryController.triggerError = async (req, res, next) => {
  throw new Error('Intentional 500 Error');
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
inventoryController.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await inventoryModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

inventoryController.editInvItemView = async function (req, res, next) {

  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const invData = await inventoryModel.getVehicleById(inv_id)
  const classificationSelect = await utilities.buildClassificationList(invData.classification_id)
  const itemName = `${invData.inv_make} ${invData.inv_model}`
  
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: invData.inv_id,
    inv_make: invData.inv_make,
    inv_model: invData.inv_model,
    inv_year: invData.inv_year,
    inv_description: invData.inv_description,
    inv_image: invData.inv_image,
    inv_thumbnail: invData.inv_thumbnail,
    inv_price: invData.inv_price,
    inv_miles: invData.inv_miles,
    inv_color: invData.inv_color,
    classification_id: invData.classification_id
  })
  
}

inventoryController.updateInventory = async function (req, res, next) {

  let nav = await utilities.getNav()

  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  } = req.body

  const updateResult = await inventoryModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {

    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    
    req.flash("message success", itemName+' was successfully updated.')
    res.redirect("/inv/")

  } else {
    
    const classificationSelect = await utilities.buildClassificationList(
      classification_id)
    const itemName = `${inv_make} ${inv_model}`
    
    req.flash("message warning", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    })
    
  }
}

inventoryController.deleteView = async function (req, res, next) {

  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()

  const itemData = await inventoryModel.getVehicleById(inv_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  
  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
  })
  
}

inventoryController.deleteItem = async function (req, res, next) {

  let nav = await utilities.getNav()
  
  const inv_id  = parseInt(req.body.inv_id)
  const deleteResult = await inventoryModel.deleteInventoryItem(inv_id)

  if (deleteResult) {
    req.flash("message success", 'The deletion was successful.')
    res.redirect('/inv/')
  } else {
    req.flash("message warning", 'Sorry, the delete failed.')
    res.redirect("/inv/delete/inv_id")
  }

}

module.exports = inventoryController;