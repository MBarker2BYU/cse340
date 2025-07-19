const pool = require("../database/")

/* ***************************
 * Get all classification data
 * ************************** */
async function getClassifications() {
  try {
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name");
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows;
  } catch (error) {
    throw new Error(`Database error: ${error.message}`)
  }
}

async function getVehicleById(vehicleId) {
  try {
    const sql = 'SELECT * FROM inventory WHERE inv_id = $1';
    const result = await pool.query(sql, [vehicleId]);
    return result.rows[0]; // Return the first matching record
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
}

module.exports = { getClassifications, getInventoryByClassificationId, getVehicleById }