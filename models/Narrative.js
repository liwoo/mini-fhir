const Joi = require('joi');
const mongoose = require('mongoose');

const narrativeSchema = new mongoose.Schema({
  status: { type: String, required: true },
  div: { type: String, required: true },
});

const Narrative = mongoose.model('Narrative', narrativeSchema);

const narrativeJoiSchema = Joi.object().keys({
  status: Joi.string().min(3),
  div: Joi.string().min(3),
});

module.exports = {
  narrativeSchema,
  Narrative,
  narrativeJoiSchema,
};
