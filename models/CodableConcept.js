const Joi = require('joi');
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

const codingSchema = Joi.object().keys({
  code: Joi.string().required(),
  system: Joi.string().uri(),
  display: Joi.string().required(),
});

const codableConceptJoiSchema = Joi.object().keys({
  coding: Joi.array().items(codingSchema),
});

const CodableConcept = mongoose.model('CodableConcept', codableConceptSchema);

module.exports.codableConceptJoiSchema = codableConceptJoiSchema;
module.exports.CodableConcept = CodableConcept;
module.exports.codableConceptSchema = codableConceptSchema;
