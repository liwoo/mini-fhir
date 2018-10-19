const Joi = require('joi');
const mongoose = require('mongoose');
const { codableConceptSchema, codableConceptJoiSchema } = require('./CodableConcept');
const { referenceSchema, referenceJoiSchema } = require('./Reference');
const { effectivePeriodSchema } = require('./EffectivePeriod');
const { valueQuantityShema } = require('./ValueQuantity');
const { narrativeSchema, narrativeJoiSchema } = require('./Narrative');

const observationSchema = new mongoose.Schema({
  resourceType: { type: String, default: 'Observation' },
  id: { type: String, required: true },
  subject: referenceSchema,
  status: { type: String, required: true },
  effectiveDateTime: Date,
  effective: String,
  text: narrativeSchema,
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
  dataAbsentReason: { type: codableConceptSchema },
});

const Observation = mongoose.model('Observation', observationSchema);

const schema = Joi.object().keys({
  id: Joi.string().required(),
  resourceType: Joi.string().min(3),
  subject: referenceJoiSchema,
  performer: referenceJoiSchema,
  issued: Joi.date(),
  text: narrativeJoiSchema,
  basedOn: referenceJoiSchema,
  context: referenceJoiSchema,
  category: Joi.array().items(codableConceptJoiSchema),
  status: Joi.string().valid('preliminary', 'registered', 'final', 'amended'),
  code: codableConceptJoiSchema,
  valueString: Joi.string()
    .allow(null)
    .min(3),
  effectiveDateTime: Joi.date(),
  effectivePeriod: Joi.object().keys({
    start: Joi.date(),
    end: Joi.date(),
  }),
  valueQuantity: Joi.object().keys({
    value: Joi.number(),
    unit: Joi.string().valid('cm', 'mm', 'ml', 'lbs'),
    system: Joi.string(),
    code: Joi.string(),
  }),
  valueCodableQuantity: codableConceptJoiSchema,
  valueBoolean: Joi.bool(),
  dataAbsentReason: codableConceptJoiSchema,
});

module.exports.schema = schema;
module.exports.Observation = Observation;
