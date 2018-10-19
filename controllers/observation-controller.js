const Joi = require('joi');
const { Observation, schema } = require('../models/Observation');
const { CodableConcept } = require('../models/CodableConcept');
const { EffectivePeriod } = require('../models/EffectivePeriod');
const { Reference } = require('../models/Reference');
const { ValueQuantity } = require('../models/ValueQuantity');

const sanitizeObservation = (obs) => {
  const {
    id,
    value,
    effective,
    resourceType,
    subject,
    basedOn,
    context,
    performer,
    status,
    code,
    category,
    issued,
    dataAbsentReason,
  } = obs;

  return {
    id,
    resourceType,
    code,
    category,
    issued,
    subject,
    basedOn,
    [effective]: obs[effective],
    context,
    performer,
    status,
    [value]: obs[value],
    dataAbsentReason,
  };
};

const getDateOperator = op => `$${op}`;

module.exports.findAll = async (req, res) => {
  let query = {};

  const {
    patient, code, date, ...rest
  } = req.query;

  if (Object.keys(rest).length > 0) {
    return res.status(400).send('Invalid Query Parameter Provided.');
  }

  if (patient) query = { ...query, 'subject.reference': `Patient/${req.query.patient}` };

  if (code) {
    query = {
      ...query,
      'code.coding': { $elemMatch: { code: { $in: code.split(',') } } },
    };
  }

  if (date) {
    const operator = date.slice(0, 2);
    const dateVal = date.slice(2);
    query = {
      ...query,
      effectiveDateTime: { [getDateOperator(operator)]: dateVal },
    };
  }

  const observations = await Observation.find(query);

  const isNotSearched = Object.keys(query).length === 0;

  const resp = observations.map((obs) => {
    const { _id } = obs;
    return {
      fullUrl: `${req.headers.host}/fhir/Observation/${_id}`,
      resource: sanitizeObservation(obs),
    };
  });

  const genericResponse = {
    resourceType: 'Bundle',
    type: isNotSearched ? 'collection' : 'searchset',
    entry: resp,
  };

  if (isNotSearched) {
    return res.json(genericResponse);
  }

  return res.json({
    ...genericResponse,
    total: resp.length,
  });
};

module.exports.findOne = async (req, res) => {
  const { id } = req.params;
  const observation = await Observation.findById(id);
  const resp = sanitizeObservation(observation);
  return res.json(resp);
};

module.exports.create = async (req, res) => {
  const {
    id,
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
    effectiveDateTime,
    dataAbsentReason,
  } = req.body;

  let codableCategories = null;

  let effective = null;
  let value = null;

  const validation = Joi.validate(req.body, schema);

  if (validation.error) {
    return res.status(422).send(validation.error.details[0].message);
  }

  if (effectiveDateTime) effective = 'effectiveDateTime';
  if (effectivePeriod) effective = 'effectivePeriod';

  if (valueQuantity) value = 'valueQuantity';
  if (valueCodableQuantity) value = 'valueCodableQuantity';
  if (valueString) value = 'valueString';
  if (valueBoolean) value = 'valueBoolean';

  if (category) {
    codableCategories = category.filter(cat => cat != null).map(cat => new CodableConcept(cat));
  }

  if (!value && !dataAbsentReason) {
    return res.status(422).json({
      validationError: 'Both Value and Data Absent Reason Cannot be Blank',
    });
  }

  let observation = new Observation({
    id,
    resourceType,
    subject: new Reference(subject),
    basedOn: new Reference(basedOn),
    context: new Reference(context),
    performer: new Reference(performer),
    effective,
    status,
    code: new CodableConcept(code),
    effectiveDateTime,
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
