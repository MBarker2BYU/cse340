const pool = require("../database/")
const priceWatchModel = require("./price-watch-model");

async function registerAccount(account_firstname, account_lastname, account_email, account_password){
  try {
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
  } catch (error) {
    return error.message
  }
}

async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

async function getAccountById(account_id) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email FROM account WHERE account_id = $1',
      [account_id])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching account found")
  }
}

async function updateProfile(account_id, account_firstname, account_lastname, account_email) {
  try {
    const sql = "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *"
    const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_id])
    return result.rows[0]
  } catch (error) {
    return new Error("Error updating profile")
  }
}


async function updateAccountPassword(account_id, account_password) {
  try {
    const sql = "UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING *"
    const result = await pool.query(sql, [account_password, account_id])
    return result.rows[0]
  } catch (error) {
    return new Error("Error updating password")
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
        ? `Price drop! ${row.inv_year} ${row.inv_make} ${row.inv_model} is now $${parseInt(row.current_price)}, meeting your watch price of $${parseInt(row.target_price)}.`
        : "Price drop detected for an unknown vehicle.",
      carId: row.inv_id || null,
    })).filter(msg => msg.text !== "Price drop detected for an unknown vehicle."); // Filter out invalid rows

  } catch (error) {
    console.error("Price watch check error:", error.stack);
    throw new Error("Price watch check failed");
  }
}

module.exports = { registerAccount, checkExistingEmail, getAccountByEmail, getAccountById, updateProfile, updateAccountPassword, checkPriceWatchesOnManagement }