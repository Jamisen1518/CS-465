const trips = require('./data/trips.json');

/* GET travel page */
const travel = (req, res) => {
  res.render('travel', {
    title: 'Travlr Getaways - Travel',
    trips
  });
};

module.exports = {
  travel
};