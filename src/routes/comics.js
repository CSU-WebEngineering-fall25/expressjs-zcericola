const express = require('express');
const router = express.Router();
const xkcdService = require('../services/xkcdService');
const { param, query, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: errors.array()[0].msg
    });
  }
  next();
};

// GET /api/comics/latest
router.get('/latest', async (req, res, next) => {
  try {
    const comic = await xkcdService.getLatest();
    res.json(comic);
  } catch (error) {
    next(error);
  }
});

// TODO: Implement GET /api/comics/:id
router.get('/:id',
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Comic ID must be a positive integer')
  ],
  validate,
  async (req, res, next) => {
    try {
      // Get comic by ID using xkcdService.getById()
      // Parse req.params.id to integer
      // Pass any errors to next()
      res.status(501).json({ error: 'Not implemented' });
    } catch (error) {
      next(error);
    }
  }
);

// TODO: Implement GET /api/comics/random
router.get('/random', async (req, res, next) => {
  try {
    // Use xkcdService.getRandom() to get a random comic
    // Handle any errors appropriately
    res.status(501).json({ error: 'Not implemented' });
  } catch (error) {
    next(error);
  }
});

// TODO: Implement GET /api/comics/search
router.get('/search',
  [
    query('q')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Query must be between 1 and 100 characters'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50')
  ],
  validate,
  async (req, res, next) => {
    try {
      // Extract q, page, limit from req.query
      // Set defaults: page = 1, limit = 10
      // Use xkcdService.search(q, page, limit)
      // Return the search results
      res.status(501).json({ error: 'Not implemented' });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;