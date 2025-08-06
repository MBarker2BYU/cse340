const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {} 

// Reduce Human Error with Enums
// These are used to ensure that the body elements and view names are consistent across the application.
const BodyElement = Object.freeze({
  CLASSIFICATION_NAME: "classification_name",
  CLASSIFICATION_ID: "classification_id",
  INV_MAKE: "inv_make",
  INV_MODEL: "inv_model",
  INV_DESCRIPTION: "inv_description",
  INV_IMAGE: "inv_image",
  INV_THUMBNAIL: "inv_thumbnail",
  INV_PRICE: "inv_price",
  INV_YEAR: "inv_year",
  INV_MILES: "inv_miles",
  INV_COLOR: "inv_color",
  INV_ID: "inv_id",
});

const ViewName = Object.freeze({
  ADD_CLASSIFICATION: "inventory/add-classification",
  ADD_INVENTORY: "inventory/add-inventory",
  EDIT_INVENTORY: "inventory/edit-inventory",
});

//export the enums for use in other files
// module.exports = { BodyElement, ViewName };

validate.classificationRule = () => {
  return [
    // name is required and must be string
    body(BodyElement.CLASSIFICATION_NAME)
      .trim()
      .isLength({ min: 1 })
      .isAlpha()
      .withMessage("Provide a correct classification name."),
  ]
}

validate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render(ViewName.ADD_CLASSIFICATION, {
      errors,
      title: "Add Classification",
      nav,
      classification_name,
    })
    return
  }
  next()
}

validate.newInventoryRules = () => {
  return [
    body(BodyElement.CLASSIFICATION_ID)
      .trim()
      .isInt({
        no_symbols: true,
      })
      .withMessage("The vehicle's classification is required."),

    body(BodyElement.INV_MAKE)
      .trim()
      .escape()
      .isLength({
        min: 3,
      })
      .withMessage("A vehicle make is required."),

    body(BodyElement.INV_MODEL)
      .trim()
      .escape()
      .isLength({
        min: 3,
      })
      .withMessage("A vehicle model is required."),

    body(BodyElement.INV_DESCRIPTION)
      .trim()
      .escape()
      .isLength({
        min: 3,
      })
      .withMessage("A vehicle description is required."),

      body(BodyElement.INV_IMAGE)
      .trim()
      .isLength({
        min: 6,
      })
      .matches(/\.(jpg|jpeg|png|webp)$/)
      .withMessage("A vehicle image path is required and must be an image."),

    body(BodyElement.INV_THUMBNAIL)
      .trim()
      .isLength({
        min: 6,
      })
      .matches(/\.(jpg|jpeg|png|webp)$/)
      .withMessage("A vehicle thumbnail path is required and must be an image."),

    body(BodyElement.INV_PRICE)
      .trim()
      .isDecimal()
      .withMessage("A vehicle price is required."),

    body(BodyElement.INV_YEAR)
      .trim()
      .isInt({
        min: 1900,
        max: 2099,
      })
      .withMessage("A vehicle year is required."),

    body(BodyElement.INV_MILES)
      .trim()
      .isInt({
        no_symbols: true,
      })
      .withMessage("The vehicle's miles is required."),

    body(BodyElement.INV_COLOR)
      .trim()
      .escape()
      .isLength({
        min: 3,
      })
      .withMessage("The vehicle's color is required."),
  ]
}

validate.checkInventoryData = async (req, res, next) => {
  const {
    [BodyElement.INV_MAKE]: inv_make,
    [BodyElement.INV_MODEL]: inv_model,
    [BodyElement.INV_DESCRIPTION]: inv_description,
    [BodyElement.INV_IMAGE]: inv_image,
    [BodyElement.INV_THUMBNAIL]: inv_thumbnail,
    [BodyElement.INV_PRICE]: inv_price,
    [BodyElement.INV_YEAR]: inv_year,
    [BodyElement.INV_MILES]: inv_miles,
    [BodyElement.INV_COLOR]: inv_color,
    [BodyElement.CLASSIFICATION_ID]: classification_id,
  } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList(
      classification_id
    )
    res.render(ViewName.ADD_INVENTORY, {
      errors,
      title: "Add Vehicle",
      nav,
      classificationSelect,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
    })
    return
  }
  next()
}

validate.checkUpdateData = async (req, res, next) => {
  const {
    [BodyElement.INV_MAKE]: inv_make,
    [BodyElement.INV_MODEL]: inv_model,
    [BodyElement.INV_DESCRIPTION]: inv_description,
    [BodyElement.INV_IMAGE]: inv_image,
    [BodyElement.INV_THUMBNAIL]: inv_thumbnail,
    [BodyElement.INV_PRICE]: inv_price,
    [BodyElement.INV_YEAR]: inv_year,
    [BodyElement.INV_MILES]: inv_miles,
    [BodyElement.INV_COLOR]: inv_color,
    [BodyElement.CLASSIFICATION_ID]: classification_id,
    [BodyElement.INV_ID]: inv_id,
  } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList(
      classification_id
    )
    res.render(ViewName.EDIT_INVENTORY, {
      errors,
      title: `Edit ${inv_make} ${inv_model}`,
      nav,
      classificationSelect,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      inv_id,
    })
    return
  }
  next()
}

module.exports = validate