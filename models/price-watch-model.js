const pool = require("../database/");

/* ***************************
 * Create a new price watch
 * ************************** */
async function createPriceWatch(account_id, inv_id, inv_price) {
  try {
    const sql =
      "INSERT INTO public.PriceWatches (account_id, inv_id, inv_price) VALUES ($1, $2, $3) RETURNING *";
    const data = await pool.query(sql, [account_id, inv_id, inv_price]);
    return data.rows[0];
  } catch (error) {
    throw new Error(`Price watch creation error: ${error.message}`);
  }
}

/* ***************************
 * Get price watches by account ID
 * ************************** */
async function getPriceWatchesByAccountId(account_id) {
  try {
    const sql =
      "SELECT pw.*, i.inv_make, i.inv_model, i.inv_year, i.inv_price as current_price, pw.inv_price as target_price " +
      "FROM public.PriceWatches pw " +
      "JOIN public.inventory i ON pw.inv_id = i.inv_id " +
      "WHERE pw.account_id = $1";
    const data = await pool.query(sql, [account_id]);
    return data.rows;
  } catch (error) {
    throw new Error(`Price watch retrieval error: ${error.message}`);
  }
}

/* ***************************
 * Delete a price watch
 * ************************** */
async function deletePriceWatch(watch_id, account_id) {
  try {
    const sql =
      "DELETE FROM public.PriceWatches WHERE watch_id = $1 AND account_id = $2 RETURNING *";
    const data = await pool.query(sql, [watch_id, account_id]);
    return data.rows[0];
  } catch (error) {
    throw new Error(`Price watch deletion error: ${error.message}`);
  }
}

async function checkPriceWatchesOnManagement(account_id) {
  try {
    const sql =
      "SELECT pw.watch_id, pw.inv_price AS target_price, i.inv_id, i.inv_price AS current_price, i.inv_year, i.inv_make, i.inv_model " +
      "FROM public.PriceWatches pw " +
      "JOIN public.inventory i ON pw.inv_id = i.inv_id " +
      "WHERE pw.account_id = $1 AND i.inv_price <= pw.inv_price";
    const result = await pool.query(sql, [account_id]);

    if (result.rowCount === 0) {
      return [];
    }    

    return result.rows.map((row) => ({
      type: "message success",
      text: row.inv_year && row.inv_make && row.inv_model && row.current_price && row.target_price
        ? `Price drop! ${row.inv_year} ${row.inv_make} ${row.inv_model} is now ${parseInt(row.current_price).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 })}, meeting your watch price of ${parseInt(row.target_price).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 })}.`
        : "Price drop detected for an unknown vehicle.",
      carId: row.inv_id || null,
    })).filter(msg => msg.text !== "Price drop detected for an unknown vehicle.");

  } catch (error) {
    console.error("Price watch check error:", error.stack);
    throw new Error("Price watch check failed");
  }
}

module.exports = { createPriceWatch, getPriceWatchesByAccountId, deletePriceWatch, checkPriceWatchesOnManagement };