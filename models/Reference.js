const mongoose = require('mongoose');

const referenceSchema = new mongoose.Schema({
  reference: String,
});

const Reference = mongoose.model('Reference', referenceSchema);

module.exports.Reference = Reference;
module.exports.referenceSchema = referenceSchema;
