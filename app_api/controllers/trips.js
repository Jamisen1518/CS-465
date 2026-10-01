const Trip = require('../models/travlr');

const tripsList = async (req, res) => {
  try {
    const trips = await Trip.find({}).exec();
    return res.status(200).json(trips);
  } catch (err) {
    console.error('Trip list query failed:', err.message);
    return res.status(500).json({ message: 'Unable to retrieve trips.' });
  }
};

const tripsFindByCode = async (req, res) => {
  const tripCode = req.params.tripCode;
  if (!tripCode || !/^[A-Za-z0-9_-]+$/.test(tripCode)) {
    return res.status(400).json({ message: 'A valid trip code is required.' });
  }
  try {
    const trips = await Trip.find({ code: tripCode }).exec();
    if (!trips.length) return res.status(404).json({ message: 'Trip not found.' });
    return res.status(200).json(trips);
  } catch (err) {
    console.error('Trip query failed:', err.message);
    return res.status(500).json({ message: 'Unable to retrieve trip.' });
  }
};
module.exports = { tripsList, tripsFindByCode };
