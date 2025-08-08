const express = require("express");
const router = new express.Router();
const priceWatchController = require("../controllers/price-watch-controller");
const utilities = require("../utilities");

// List price watches
router.get("/", utilities.checkLogin, utilities.handleErrors(priceWatchController.buildPriceWatchList));

// Create price watch
router.get("/create/:inv_id", utilities.checkLogin, utilities.handleErrors(priceWatchController.buildCreatePriceWatch));
router.post("/create", utilities.checkLogin, priceWatchController.createPriceWatch);

// Delete price watch
router.post("/delete", utilities.checkLogin, utilities.handleErrors(priceWatchController.deletePriceWatch));

module.exports = router;