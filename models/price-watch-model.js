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

/* ***************************
 * Check price watches for a car
 * ************************** */
async function checkPriceWatches(inv_id, newPrice) {
  try {
    const sql =
      "SELECT pw.*, a.account_firstname " +
      "FROM public.PriceWatches pw " +
      "JOIN public.account a ON pw.account_id = a.account_id " +
      "WHERE pw.inv_id = $1 AND pw.inv_price >= $2";
    const data = await pool.query(sql, [inv_id, newPrice]);
    return data.rows;
  } catch (error) {
    throw new Error(`Price watch check error: ${error.message}`);
  }
}

module.exports = { createPriceWatch, getPriceWatchesByAccountId, deletePriceWatch, checkPriceWatches };