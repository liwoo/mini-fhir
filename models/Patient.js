const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  resourceType: { type: String, default: 'Patient' },
  name: { type: String, required: true, min: 3 },
});

const Patient = mongoose.model('Patient', patientSchema);

module.exports = {
  patientSchema,
  Patient,
};
