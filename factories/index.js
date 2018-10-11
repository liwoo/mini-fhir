const faker = require('faker');
const { Observation } = require('../models/Observation');
const { Patient } = require('../models/Patient');

const randomFrom = (options) => {
  const index = Math.ceil(Math.random(options.length) * options.length) - 1;
  return options[index];
};

const genRandomNumber = factor => Math.ceil(Math.random(factor) * 2334);

const genRandomIndex = factor => Math.ceil(Math.random(factor) * factor) - 1;

const basedOnOptions = [
  'CarePlan',
  'DeviceRequest',
  'ImmunizationRecommendation',
  'MedicationRequest',
  'NutritionOrder',
  'ProcedureRequest',
  'ReferalRequest',
];

const statusOptions = ['registered', 'preliminary', 'final', 'amended'];

const contextOptions = ['Encounter', 'EpisodeOfCare'];

const performerOptions = ['Practitioner', 'Organization', 'Patient', 'RelatedPerson'];

const randomStartDate = faker.date.between('2001-01-16', new Date());

const effectiveOptions = [
  { effective: 'effectiveDate', value: faker.date.between('1990-05-09', new Date()) },
  {
    effective: 'effectivePeriod',
    value: {
      start: randomStartDate,
      end: faker.date.between(randomStartDate, new Date()),
    },
  },
];

const valueOptions = [
  { key: 'valueString', value: faker.name.findName() },
  { key: 'valueBoolean', value: true },
  {
    key: 'valueCodableQuantity',
    value: {
      coding: [
        {
          code: faker.internet.mac(),
          system: faker.internet.url(),
          display: faker.name.findName(),
        },
      ],
    },
  },
  { key: 'valueQuantity', value: { value: genRandomNumber(10), unit: 'cm' } },
];

const makePatients = async (instance = 1) => {
  const patientData = [...Array(instance).keys()].map(_i => ({ name: faker.name.findName() }));

  const patient = await Patient.collection.insertMany(patientData);
  return patient;
};

const makeObservations = async (instance = 1, overrides = {}) => {
  const patients = await Patient.find({});
  const observationData = [...Array(instance).keys()].map((i) => {
    const patientCount = patients.length;
    const randomPatient = patients[genRandomIndex(patientCount)] || { _id: 1 };
    const { _id } = randomPatient;
    const code = genRandomNumber(i);
    const eff = randomFrom(effectiveOptions);
    const val = randomFrom(valueOptions);
    return {
      subject: { reference: `Patient/${_id}` },
      basedOn: { reference: randomFrom(basedOnOptions) },
      context: { reference: randomFrom(contextOptions) },
      performer: { reference: `${randomFrom(performerOptions)}/${genRandomNumber(14)}` },
      resourceType: 'Observation',
      code: {
        coding: [
          { code: String(code), system: faker.internet.url(), display: faker.name.findName() },
        ],
      },
      category: [
        {
          coding: [
            {
              code: `CO-${code + 5121}`,
              system: faker.internet.url(),
              display: faker.name.jobTitle(),
            },
          ],
        },
      ],
      issued: randomStartDate,
      status: randomFrom(statusOptions),
      effective: eff.effective,
      [eff.effective]: eff.value,
      value: val.key,
      [val.key]: val.value,
      ...overrides,
    };
  });
  const observation = await Observation.collection.insertMany(observationData);
  return observation;
};

module.exports = {
  makeObservations,
  makePatients,
};
