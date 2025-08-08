const priceWatchModel = require("../models/price-watch-model");
const inventoryModel = require("../models/inventory-model");
const utilities = require("../utilities");
const { body, validationResult } = require("express-validator");

const priceWatchController = {};

/* Build price watch list view */
priceWatchController.buildPriceWatchList = async function (req, res, next) {
  try {
    const account_id = res.locals.accountData.account_id;
    const priceWatches = await priceWatchModel.getPriceWatchesByAccountId(account_id);
    const nav = await utilities.getNav();
    res.render("./price-watch/list", {
      title: "My Price Watches",
      nav,
      priceWatches,
      errors: null,
    });
  } catch (error) {
    next(error);
  }
};

/* Build price watch creation view */
priceWatchController.buildCreatePriceWatch = async function (req, res, next) {
  try {
    console.log("Loading create page for inv_id:", req.params.inv_id); // Debug log
    const inv_id = parseInt(req.params.inv_id);
    const vehicleData = await inventoryModel.getVehicleById(inv_id);
    if (!vehicleData) throw new Error("Vehicle not found");
    const nav = await utilities.getNav();
    res.render("./price-watch/create", {
      title: `Set Price Watch for ${vehicleData.inv_year} ${vehicleData.inv_make} ${vehicleData.inv_model}`,
      nav,
      vehicle: vehicleData,
      errors: null,
    });
  } catch (error) {
    next(error);
  }
};

/* Create a price watch */
priceWatchController.createPriceWatch = [
  body("inv_id").trim().isInt({ no_symbols: true }).withMessage("Invalid vehicle ID"),
  body("inv_price")
    .trim()
    .isInt({ min: 1, max: 999999999 })
    .withMessage("Target price must be a positive integer up to 999,999,999"),
  async function (req, res, next) {
    const { inv_id, inv_price } = req.body;
    const account_id = res.locals.accountData.account_id;
    let errors = validationResult(req);
    const nav = await utilities.getNav();
    const vehicleData = await inventoryModel.getVehicleById(inv_id);

    if (!errors.isEmpty()) {
      return res.status(400).render("./price-watch/create", {
        title: `Set Price Watch for ${vehicleData.inv_year} ${vehicleData.inv_make} ${vehicleData.inv_model}`,
        nav,
        vehicle: vehicleData,
        errors: errors.array(),
      });
    }

    try {
      const existing = await priceWatchModel.getPriceWatchesByAccountId(account_id);
      if (existing.some((watch) => watch.inv_id === parseInt(inv_id))) {
        req.flash("message warning", "You already have a price watch for this vehicle.");
        return res.redirect(`/inv/detail/${inv_id}`);
      }

      const result = await priceWatchModel.createPriceWatch(account_id, inv_id, inv_price);
      if (result) {
        req.flash("message success", "Price watch set successfully.");
        res.redirect("/account/");
      } else {
        req.flash("message warning", "Failed to set price watch.");
        res.status(500).render("./price-watch/create", {
          title: `Set Price Watch for ${vehicleData.inv_year} ${vehicleData.inv_make} ${vehicleData.inv_model}`,
          nav,
          vehicle: vehicleData,
          errors: null,
        });
      }
    } catch (error) {
      next(error);
    }
  },
];

/* Delete a price watch */
priceWatchController.deletePriceWatch = async function (req, res, next) {
  try {
    const watch_id = parseInt(req.body.watch_id);
    const account_id = res.locals.accountData.account_id;
    const result = await priceWatchModel.deletePriceWatch(watch_id, account_id);
    if (result) {
      req.flash("message success", "Price watch removed successfully.");
    } else {
      req.flash("message warning", "Failed to remove price watch.");
    }
    res.redirect("/price-watch/");
  } catch (error) {
    next(error);
  }
};

module.exports = priceWatchController;