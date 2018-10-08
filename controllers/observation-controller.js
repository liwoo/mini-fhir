const Joi = require('joi');
const Observation = require('../models/Observation');
const { CodableConcept } = require('../models/CodableConcept');
const { EffectivePeriod } = require('../models/EffectivePeriod');
const { Reference } = require('../models/Reference');
const { ValueQuantity } = require('../models/ValueQuantity');

module.exports.create = async (req, res) => {
  const {
    subject,
    basedOn,
    context,
    resourceType,
    effectivePeriod,
    status,
    issued,
    performer,
    category,
    code,
    valueQuantity,
    valueCodableQuantity,
    valueString,
    valueBoolean,
    effectiveDate,
    dataAbsentReason,
  } = req.body;

  let codableCategories = null;

  let effective = null;
  let value = null;

  const codingSchema = Joi.object().keys({
    code: Joi.string().required(),
    system: Joi.string().uri(),
    display: Joi.string().required(),
  });

  const codableConceptJoiSchema = Joi.object().keys({
    coding: Joi.array().items(codingSchema),
  });

  const referenceJoiSchema = Joi.object().keys({
    reference: Joi.string().min(3),
  });

  const schema = Joi.object().keys({
    resourceType: Joi.string().min(3),
    subject: referenceJoiSchema,
    performer: referenceJoiSchema,
    issued: Joi.date(),
    basedOn: referenceJoiSchema,
    context: referenceJoiSchema,
    category: Joi.array().items(codableConceptJoiSchema),
    status: Joi.string().valid('preliminary', 'registered', 'final', 'amended'),
    code: codableConceptJoiSchema,
    valueString: Joi.string().allow(null).min(3),
    effectiveDate: Joi.date(),
    effectivePeriod: Joi.object().keys({
      start: Joi.date(),
      end: Joi.date(),
    }),
    valueQuantity: Joi.object().keys({
      value: Joi.number(),
      unit: Joi.string().valid('cm', 'mm', 'ml', 'lbs'),
    }),
    valueCodableQuantity: codableConceptJoiSchema,
    valueBoolean: Joi.bool(),
    dataAbsentReason: codableConceptJoiSchema,
  });

  const validation = Joi.validate(req.body, schema);

  if (validation.error) {
    return res.status(422).send(validation.error.details[0].message);
  }

  if (effectiveDate) effective = 'effectiveDate';
  if (effectivePeriod) effective = 'effectivePeriod';

  if (valueQuantity) value = 'valueQuantity';
  if (valueCodableQuantity) value = 'valueCodableQuantity';
  if (valueString) value = 'valueString';
  if (valueBoolean) value = 'valueBoolean';

  if (category) {
    codableCategories = category.filter(cat => cat != null).map(cat => new CodableConcept(cat));
  }

  if (!value && !dataAbsentReason) {
    return res.status(422).json({ validationError: 'Both Value and Data Absent Reason Cannot be Blank' });
  }

  let observation = new Observation({
    resourceType,
    subject: new Reference(subject),
    basedOn: new Reference(basedOn),
    context: new Reference(context),
    performer: new Reference(performer),
    effective,
    status,
    code: new CodableConcept(code),
    effectiveDate,
    effectivePeriod: new EffectivePeriod(effectivePeriod),
    category: codableCategories,
    issued,
    value,
    valueQuantity: new ValueQuantity(valueQuantity),
    valueCodableQuantity: new CodableConcept(valueCodableQuantity),
    valueString,
    valueBoolean,
    dataAbsentReason: new CodableConcept(dataAbsentReason),
  });

  observation = await observation.save();
  return res.status(201).json(observation);
};
