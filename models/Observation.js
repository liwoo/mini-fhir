const mongoose = require('mongoose');
const { codableConceptSchema } = require('./CodableConcept');
const { referenceSchema } = require('./Reference');
const { effectivePeriodSchema } = require('./EffectivePeriod');
const { valueQuantityShema } = require('./ValueQuantity');

const observationSchema = new mongoose.Schema({
  resourceType: { type: String, default: 'Observation' },
  subject: referenceSchema,
  status: { type: String, required: true },
  effectiveDate: Date,
  effective: String,
  effectivePeriod: effectivePeriodSchema,
  performer: referenceSchema,
  category: [codableConceptSchema],
  code: { type: codableConceptSchema, required: true },
  basedOn: referenceSchema,
  context: referenceSchema,
  issued: Date,
  value: String,
  valueQuantity: valueQuantityShema,
  valueCodableQuantity: codableConceptSchema,
  valueString: String,
  valueBoolean: Boolean,
  dataAbsentReason: { type: codableConceptSchema, required: true },
});

const Observation = mongoose.model('Observation', observationSchema);

module.exports = Observation;
