const mongoose = require('mongoose');

const valueQuantitySchema = new mongoose.Schema({
  value: String,
  unit: String,
});

const ValueQuantity = mongoose.model('ValueQuantity', valueQuantitySchema);

module.exports.ValueQuantity = ValueQuantity;
module.exports.valueQuantityShema = valueQuantitySchema;
