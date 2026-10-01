const mongoose = require('mongoose');
const Trip = require('./travlr');
const trips = require('../../data/trips.json');
async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || `mongodb://${process.env.DB_HOST || '127.0.0.1'}/travlr`);
    // Reset the course development database only.
    await Trip.deleteMany({});
    await Trip.insertMany(trips);
    console.log(`Seeded ${trips.length} trips.`);
  } catch (err) {
    console.error(err.message);
    process.exitCode = 1;
  } finally { await mongoose.disconnect(); }
}
seed();
