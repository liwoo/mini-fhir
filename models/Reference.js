const Joi = require('joi');
const mongoose = require('mongoose');

const referenceSchema = new mongoose.Schema({
  reference: String,
});

const Reference = mongoose.model('Reference', referenceSchema);

const referenceJoiSchema = Joi.object().keys({
  reference: Joi.string().min(3),
});

module.exports.referenceJoiSchema = referenceJoiSchema;
module.exports.Reference = Reference;
module.exports.referenceSchema = referenceSchema;
