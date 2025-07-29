const pool = require("../database/")

function executeQuery(sql, params = [], errorMessage = "Database query failed") {
  try {

    const data = pool.query(sql, params)

    return data;

  } catch (error) {
    
    // Capture detailed error information
    const detailedError = `${errorMessage}: ${error.message} (SQL: ${sql}, Params: ${JSON.stringify(params)})`;
    // Log the error for debugging
    console.error(detailedError); 
    // Throw a new error to propagate it to the controller/middleware
    throw new Error(detailedError);

  }
}

/* ***************************
 * Get all classification data
 * ************************** */
async function getClassifications() {
  try {
    return await executeQuery("SELECT * FROM public.classification ORDER BY classification_name");
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await executeQuery(
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

/* ***************************
 *  Get vehicle by ID
 * ************************** */
async function getVehicleById(vehicleId) {
  try {
    const sql = 'SELECT * FROM inventory WHERE inv_id = $1';
    const result = await executeQuery(sql, [vehicleId]);
    return result.rows[0]; // Return the first matching record
  } catch (error) {
    throw new Error(`Database error: ${error.message}`);
  }
}

// Insert a new classification
const addClassification = async (classificationData) => {
  const { classification_name } = classificationData;
  const sql = 'INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *';
  const result = await executeQuery(sql, [classification_name], 'addClassification: Failed to add classification', true);
  return result.rows[0];
};

// Insert a new vehicle
const addInventory = async (
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
) => {
  const sql = 'INSERT INTO public.inventory (inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *';
  
  console.log('Executing SQL:', sql);

  console.log('With parameters:', [
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
  ]);
  
  const result = await executeQuery(sql, [
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
  ], 'addInventory: Failed to add inventory', true);
  return result.rows[0];
};

module.exports = { getClassifications, getInventoryByClassificationId, getVehicleById, addClassification, addInventory }