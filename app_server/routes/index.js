const express = require('express');
const router = express.Router();
const travelerController = require('../controllers/traveler');

router.get(['/travel', '/travel.html'], travelerController.travel);

module.exports = router;
