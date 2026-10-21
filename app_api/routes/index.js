const router = require('express').Router();
const trips = require('../controllers/trips');
const authentication = require('../controllers/authentication');
const authenticateJWT = require('../middleware/authenticateJWT');

router.post('/register', authentication.register);
router.post('/login', authentication.login);

router.get('/trips', trips.tripsList);
router.get('/trips/:tripCode', trips.tripsFindByCode);

router.post('/trips', authenticateJWT, trips.tripsCreate);
router.put('/trips/:tripCode', authenticateJWT, trips.tripsUpdate);
router.delete('/trips/:tripCode', authenticateJWT, trips.tripsDelete);

router.use((req, res) => {
  res.status(404).json({ message: 'API endpoint not found.' });
});

router.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.status === 400 ? 'Invalid request.' : 'API request failed.'
  });
});

module.exports = router;