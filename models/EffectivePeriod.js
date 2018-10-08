const mongoose = require('mongoose');

const effectivePeriodSchema = new mongoose.Schema({
  start: Date,
  end: Date,
});

const EffectivePeriod = mongoose.model('EffectivePeriod', effectivePeriodSchema);

module.exports.EffectivePeriod = EffectivePeriod;
module.exports.effectivePeriodSchema = effectivePeriodSchema;
