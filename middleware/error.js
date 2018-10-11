const { fileLogger } = require('../config/logging');

module.exports = async (err, req, res, _next) => {
  fileLogger.error('Something bad happened \u{1F613}', err);
  res.status(500).send('Looks like something really bad happened \u{1F613}');
};
