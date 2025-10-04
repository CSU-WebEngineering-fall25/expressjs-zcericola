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

// TODO: Implement GET /api/comics/random
router.get('/random', async (req, res, next) => {
  try {
    // Use xkcdService.getRandom() to get a random comic
    const randomComic = await xkcdService.getRandom();
    return res.status(200).json(randomComic);
  } catch (error) {
    // Handle any errors appropriately
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
      let { q, page, limit } = req.query;
      // Set defaults: page = 1, limit = 10
      if (!page) page = 1;
      if (!limit) limit = 10;
      // convert from string to number
      page = +page;
      limit = +limit;
      
      // Use xkcdService.search(q, page, limit)
      const results = await xkcdService.search(q, page, limit);
      // Return the search results
      return res.status(200).json(results);
    } catch (error) {
      next(error);
    }
  }
);

// TODO: Implement GET /api/comics/:id
// NOTE: moved this to the bottom because Express was matching
// other endpoints and routing it to this one since :id is a variable
// so everything else was matching. Putting it last allows the other 
// endpoints to be properly routed.
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
      const id = parseInt(req.params.id);
      const comic = await xkcdService.getById(id);
      return res.status(200).json(comic);
    } catch (error) {
      // Pass any errors to next()
      next(error);
    }
  }
);

module.exports = router;