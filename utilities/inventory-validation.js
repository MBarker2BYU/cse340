const { body, validationResult } = require("express-validator");
const utilities = require(".");

const validation = {};

// Reusable utility to run validators and handle errors
const runValidators = async (req, res, next, validators, errorHandler) => {
  try {

    await Promise.all(validators.map(validator => validator.run(req)));
    
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array()); // Structured logging
      return errorHandler(errors.array(), req, res);
    }

    next();

  } catch (err) {
    
    console.error('Validation error:', err);
    
    res.status(500).json({ error: 'Internal server error' });

  }
};

// Classification validation for POST /addClassification
validation.validateNewClassification = async (req, res, next) => {
  
    const validators = [
  
    body('classification_name')
      .trim()
      .isLength({ min: 1 }).withMessage('Classification name must be at least 1 character.')
      .isAlpha().withMessage('Classification name must contain only letters.')
      .customSanitizer(value => {
        console.log(`Sanitized classification_name: "${value}"`); // Debug log
    
        return value;
    
    })
  ];

  const errorHandler = (errors, req, res) => {
    const { classification_name = '' } = req.body || {};

    return utilities.getNav().then(nav => {
      res.render('inventory/add-classification', {
        errors,
        title: 'Add Classification',
        nav,
        classification_name,
      });
    });

  };

  await runValidators(req, res, next, validators, errorHandler);
};

// Inventory validation for POST /add-inventory
validation.validateNewInventory = async (req, res, next) => {

  const validators = [
    body('inventoryMake')
      .trim()
      .isLength({ min: 3 }).withMessage('Make must be at least 3 characters.')
      .matches(/[a-zA-Z0-9\s]*/).withMessage('Make can only contain letters, numbers, and spaces.'),
    body('inventoryModel')
      .trim()
      .isLength({ min: 3 }).withMessage('Model must be at least 3 characters.')
      .matches(/[a-zA-Z0-9\s]*/).withMessage('Model can only contain letters, numbers, and spaces.'),
    body('inventoryDescription')
      .trim()
      .isLength({ min: 1 }).withMessage('Description is required.'),
    body('inventoryImage')
      .trim()
      .isString().withMessage('Image path must be a string.'),
    body('inventoryThumbnail')
      .trim()
      .isString().withMessage('Thumbnail path must be a string.'),
    body('inventoryPrice')
      .isNumeric({ min: 0 }).withMessage('Price must be a positive number.'),
    body('inventoryYear')
      .isInt({ min: 1886, max: new Date().getFullYear() }).withMessage('Year must be between 1886 and current year.'),
    body('inventoryMiles')
      .isInt({ min: 0 }).withMessage('Miles must be a non-negative integer.'),
    body('inventoryColor')
      .trim()
      .matches(/[a-zA-Z\s]*/).withMessage('Color can only contain letters and spaces.'),
    body('classification_id')
      .isInt().withMessage('Classification must be a valid ID.')
  ];

  const errorHandler = (errors, req, res) => {
    utilities.getNav().then(nav => {
      const classificationSelect = utilities.buildClassificationList(req.body.classification_id);
      res.render('inventory/add-inventory', {
        errors,
        title: 'Add New Inventory',
        nav,
        classificationSelect,
        // Pass back locals for stickiness (already handled)
      });
    });
  };

  await runValidators(req, res, next, validators, errorHandler);
};

module.exports = validation;