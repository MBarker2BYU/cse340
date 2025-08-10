require("dotenv").config({ path: "../.env" });
const priceWatchModel = require("../models/price-watch-model");

async function test() {
  try {
    
    const accountId = 1; // Replace with valid ID
    const invId = 1;    // Replace with valid ID
    const targetPrice = 14000;

    const watch = await priceWatchModel.createPriceWatch(accountId, invId, targetPrice);
    console.log("Created:", watch);
    // Test retrieve
    const watches = await priceWatchModel.getPriceWatchesByAccountId(1);
    console.log("Watches:", watches);
    // Test check price watches

    const priceWatches = await priceWatchModel.checkPriceWatchesOnManagement(accountId);
    console.log("Price Watches:", priceWatches);

    // Test delete
    const deleted = await priceWatchModel.deletePriceWatch(watch.watch_id, accountId);
    console.log("Deleted:", deleted);
  } catch (error) {
    console.error("Test error:", error.message);
  }
}
test();