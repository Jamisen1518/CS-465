const Trip = require('../models/travlr');

const editableFields = ['name', 'length', 'start', 'resort', 'perPerson', 'image', 'description', 'description2'];
const validCode = value => typeof value === 'string' && /^[A-Za-z0-9_-]{2,32}$/.test(value);

function tripValues(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const values = {};
  for (const field of editableFields) {
    if (field === 'description2' && body[field] === undefined) values[field] = '';
    else if (typeof body[field] === 'string') values[field] = body[field].trim();
    else return null;
  }
  if (editableFields.slice(0, 7).some(field => !values[field])) return null;
  if (Number.isNaN(Date.parse(values.start))) return null;
  return values;
}

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
  if (!validCode(tripCode)) return res.status(400).json({ message: 'A valid trip code is required.' });
  try {
    const trip = await Trip.findOne({ code: tripCode }).exec();
    if (!trip) return res.status(404).json({ message: 'Trip not found.' });
    return res.status(200).json([trip]);
  } catch (err) {
    console.error('Trip query failed:', err.message);
    return res.status(500).json({ message: 'Unable to retrieve trip.' });
  }
};

const tripsCreate = async (req, res) => {
  const code = req.body && req.body.code;
  const values = tripValues(req.body);
  if (!validCode(code) || !values) return res.status(400).json({ message: 'Provide a valid trip code and all required trip details.' });
  try {
    const trip = await Trip.create({ code: code.trim(), ...values });
    return res.status(201).json(trip);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'A trip with this code already exists.' });
    if (err.name === 'ValidationError') return res.status(400).json({ message: 'Trip details are invalid.' });
    console.error('Trip creation failed:', err.message);
    return res.status(500).json({ message: 'Unable to create trip.' });
  }
};

const tripsUpdate = async (req, res) => {
  const tripCode = req.params.tripCode;
  const values = tripValues(req.body);
  if (!validCode(tripCode) || !values) return res.status(400).json({ message: 'Provide a valid trip code and all required trip details.' });
  try {
    const trip = await Trip.findOneAndUpdate({ code: tripCode }, values, { new: true, runValidators: true }).exec();
    if (!trip) return res.status(404).json({ message: 'Trip not found.' });
    return res.status(200).json(trip);
  } catch (err) {
    if (err.name === 'ValidationError') return res.status(400).json({ message: 'Trip details are invalid.' });
    console.error('Trip update failed:', err.message);
    return res.status(500).json({ message: 'Unable to update trip.' });
  }
};

const tripsDelete = async (req, res) => {
  const tripCode = req.params.tripCode;
  if (!validCode(tripCode)) return res.status(400).json({ message: 'A valid trip code is required.' });
  try {
    const trip = await Trip.findOneAndDelete({ code: tripCode }).exec();
    if (!trip) return res.status(404).json({ message: 'Trip not found.' });
    return res.status(200).json({ message: 'Trip deleted.', code: tripCode });
  } catch (err) {
    console.error('Trip deletion failed:', err.message);
    return res.status(500).json({ message: 'Unable to delete trip.' });
  }
};

module.exports = { tripsList, tripsFindByCode, tripsCreate, tripsUpdate, tripsDelete };
