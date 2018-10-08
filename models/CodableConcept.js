const mongoose = require('mongoose');

const concept = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  system: String,
  display: {
    type: String,
    required: true,
  },
});

const codableConceptSchema = new mongoose.Schema({
  coding: [concept],
});

const CodableConcept = mongoose.model('CodableConcept', codableConceptSchema);

module.exports.CodableConcept = CodableConcept;
module.exports.codableConceptSchema = codableConceptSchema;
