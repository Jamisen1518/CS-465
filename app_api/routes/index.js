const router = require('express').Router();
const controller = require('../controllers/trips');
router.get('/trips', controller.tripsList);
router.get('/trips/:tripCode', controller.tripsFindByCode);
router.use((req, res) => res.status(404).json({ message: 'API endpoint not found.' }));
router.use((err, req, res, next) => {
  res.status(err.status || 500).json({ message: err.status === 400 ? 'Invalid request.' : 'API request failed.' });
});
module.exports = router;
