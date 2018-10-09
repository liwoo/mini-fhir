const request = require('supertest');
const { Observation } = require('../../models/Observation');
const { CodableConcept } = require('../../models/CodableConcept');

let server;

const createData = (overrides = {}, withValueString = true) => {
  return {
    ...overrides,
    status: 'preliminary',
    code: { coding: [{ code: '1234', display: 'Head Injury' }] },
    valueString: withValueString ? 'Headache' : null
  }
}

describe('create observation test', () => {
  beforeEach(async () => {
    Observation.remove();
    server = await require('../../index');
  })

  afterEach(async () => { await server.close(); })

  it('allows user to create fields', async () => {
    const data = {
      resourceType: 'Observation',
      subject: { reference: 'Patient/46441' },
      performer: { reference: 'Practitioner/34255' },
      effectiveDate: new Date(),
      issued: new Date(),
      basedOn: { reference: 'CarePlan' },
      context: { reference: 'Encounter' },
    }
    const res = await request(server).post('/fhir/Observation').send(createData(data));
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('resourceType', data.resourceType);
    expect(res.body.subject).toHaveProperty('reference', data.subject.reference);
    expect(res.body).toHaveProperty('status', 'preliminary');
    expect(res.body).toHaveProperty('effectiveDate', data.effectiveDate.toISOString());
    expect(res.body.basedOn).toHaveProperty('reference', data.basedOn.reference);
    expect(res.body.context).toHaveProperty('reference', data.context.reference);
    expect(res.body).toHaveProperty('issued', data.issued.toISOString());
    expect(res.body.performer).toHaveProperty('reference', data.performer.reference);
    expect(res.body.code.coding[0]).toHaveProperty('code', '1234');
  });

  it('allows user to create any number of Categories', async () => {
    const data = {
      resourceType: 'Observation',
      category: [
        {
          coding: [{ code: '24534j', system: 'https://coding-system.mw', display: 'Exam' }]
        }
      ]
    }

    const res = await request(server).post('/fhir/Observation').send(createData(data));
    expect(res.status).toBe(201);
    expect(res.body.category[0].coding[0]).toHaveProperty('code', '24534j');
  });

  it('allows user to create only one effective type', async () => {
    const periodData = {
      resourceType: 'Observation',
      effectiveDate: new Date,
      effectivePeriod: {
        start: new Date,
        end: new Date,
      },
    }

    const periodRes = await request(server).post('/fhir/Observation').send(createData(periodData));
    expect(periodRes.status).toBe(201);
    expect(periodRes.body.effective).toBe('effectivePeriod');
  });

  it('allows user to create valueQuantity', async () => {
    const data = {
      valueQuantity: { value: 140, unit: 'cm' },
    };

    const res = await request(server).post('/fhir/Observation').send(createData(data, false));
    expect(res.status).toBe(201);
    expect(res.body.value).toBe('valueQuantity');
  });

  it('allows user to create valueCodableQuantity', async () => {
    const data = {
      valueCodableQuantity: { coding: [{ code: 'LP74908-2', system: 'http://loinc.org', display: 'Headache' }] },
    };

    const res = await request(server).post('/fhir/Observation').send(createData(data, false));
    expect(res.status).toBe(201);
    expect(res.body.value).toBe('valueCodableQuantity');
  });

  it('allows user to create valueString', async () => {
    const data = { valueString: 'Headache' }

    const res = await request(server).post('/fhir/Observation').send(createData(data));
    expect(res.status).toBe(201);
    expect(res.body.value).toBe('valueString');
  });

  it('allows user to create valueBoolean', async () => {
    const data = { valueBoolean: true }

    const res = await request(server).post('/fhir/Observation').send(createData(data, false));
    expect(res.status).toBe(201);
    expect(res.body.value).toBe('valueBoolean');
  });

  it('requires data absent reason if value is null', async () => {
    const data = {
      dataAbsentReason: { coding: [{ code: '13244', display: 'Not Available' }] }
    }

    const res = await request(server).post('/fhir/Observation').send(createData(data));
    expect(res.status).toBe(201);
    expect(res.body.dataAbsentReason.coding[0]).toHaveProperty('display', 'Not Available');
  });

  it('returns an error if value is null and data absent reason is not provided', async () => {
    const res = await request(server).post('/fhir/Observation').send(createData({}, false));
    expect(res.status).toBe(422);
  });

  it('returns proper validation errors', async () => {
    const data = {
      dataAbsentReason: { code: "Some Code" },
    }

    const res = await request(server).post('/fhir/Observation').send(createData(data, false));
    expect(res.status).toBe(422);
  })

});