/* Retrieve trip data through the API using Node's built-in fetch. */
const travel = async (req, res, next) => {
  const base = process.env.API_BASE_URL || `http://127.0.0.1:${process.env.PORT || '3000'}/api/`;
  try {
    const url = new URL('trips', base.endsWith('/') ? base : base + '/');
    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) {
      const error = new Error('Unable to load trips from the API.');
      error.status = 502;
      throw error;
    }
    let trips = await response.json();
    let message = '';
    if (!Array.isArray(trips)) {
      message = 'API lookup error';
      trips = [];
    } else if (trips.length === 0) {
      message = 'No trips exist in our database!';
    }
    return res.render('travel', { title: 'Travlr Getaways - Travel', trips, message });
  } catch (error) { return next(error); }
};
module.exports = { travel };
