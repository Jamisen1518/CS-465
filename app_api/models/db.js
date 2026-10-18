const mongoose = require('mongoose');
require('./travlr');
const dbURI = process.env.MONGODB_URI || `mongodb://${process.env.DB_HOST || '127.0.0.1'}/travlr`;
mongoose.connect(dbURI, { serverSelectionTimeoutMS: 5000 }).catch(err => {
  console.error('MongoDB connection failed:', err.message);
});
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, async () => {
    await mongoose.connection.close();
    process.exit(0);
  });
}
module.exports = mongoose;
