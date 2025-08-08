require("dotenv").config({ path: "../.env" });
const accountModel = require("../models/account-model");

async function test() {
  try {
    const flashes = await accountModel.checkPriceWatchesOnManagement(1);
    console.log("Flash messages:", flashes);
  } catch (error) {
    console.error("Test error:", error.stack);
  }
}

test().then(() => {
  console.log("Test completed, exiting...");
  process.exit(0); // Force exit
}).catch((error) => {
  console.error("Exit error:", error.stack);
  process.exit(1);
});