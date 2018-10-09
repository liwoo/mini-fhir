const { makeObservations } = require('../../factories');
const { Observation } = require('../../models/Observation');
const request = require('supertest');

let server;

describe('Get Observation', () => {
  beforeEach(async () => {
    server = await require('../../index');
    await Observation.remove();
  });

  afterEach(async () => {
    await server.close()
  });

  it('allows user to get all observations', async () => {
    await makeObservations(10);
    const res = await request(server).get('/fhir/Observation');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(10)
  });

  it('allows user to get observations with default effective and value', async () => {
    const now = new Date;

    await makeObservations(1, {
      value: 'valueString',
      valueString: 'Fever',
      effectiveDate: now,
      effective: 'effectiveDate',
    });

    const res = await request(server).get('/fhir/Observation');
    expect(res.status).toBe(200);
    expect(res.body[0].valueString).toBe('Fever');
    expect(res.body[0].effectiveDate).toBe(now.toISOString());
  })

  it('allows user to get specific observation', async () => {
    const observation = await makeObservations(1, {
      value: 'valueString',
      valueString: 'Fever',
    });

    const res = await request(server).get(`/fhir/Observation/${observation.ops[0]._id}`);
    expect(res.status).toBe(200);
    expect(res.body.valueString).toBe('Fever');
  });

  it('allows user to query for all observations for a specific patient', async () => {
    await makeObservations(3);
    await makeObservations(1, {
      subject: { reference: 'Patient/123' }
    });

    const res = await request(server).get('/fhir/Observation?patient=123');
    expect(res.status).toBe(200);
    expect(res.body[0].subject.reference).toBe('Patient/123');
  });

  it('allows user to query for all observations of a specific code', async () => {
    await makeObservations(3);
    await makeObservations(1, {
      code: {
        coding: [{ code: '8480-6', system: 'http://loinc.org', display: 'Systolic blood pressure' }],
      }
    });
    const res = await request(server).get('/fhir/Observation?code=8480-6');
    expect(res.status).toBe(200);
    expect(res.body[0].code.coding.filter(coding => coding.code === '8480-6').length).toBeGreaterThan(0);
  });

  it('allows user to query for all observations that have any one of provided codes', async () => {
    await makeObservations(3);
    await makeObservations(1, {
      code: {
        coding: [{ code: '8480-6', system: 'http://loinc.org', display: 'Systolic blood pressure' }],
      }
    });
    await makeObservations(3);
    await makeObservations(1, {
      code: {
        coding: [{ code: '9279-1', system: 'http://loinc.org', display: 'Respiratory Rate' }],
      }
    });
    await makeObservations(3);

    const res = await request(server).get('/fhir/Observation?code=8480-6,9279-1');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
  });

  it('allows users to query for all observations before a certain date', async () => {
    const oldDate = new Date(Date.parse('1999-12-05'));

    await makeObservations(4, {
      effectiveDate: new Date(),
      effective: 'effectiveDate',
    });

    await makeObservations(1, {
      effectiveDate: oldDate,
      effective: 'effectiveDate',
    })

    const res = await request(server).get('/fhir/Observation?date=lt2001-01-01');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });

  it('allows users to query for all observations after a certain date', async () => {
    const oldDate = new Date(Date.parse('1999-12-05'));

    await makeObservations(3, {
      effectiveDate: new Date(),
      effecitve: 'effectiveDate',
    });

    await makeObservations(1, {
      effectiveDate: oldDate,
      effective: 'effectiveDate',
    })

    const res = await request(server).get('/fhir/Observation?date=gt2001-01-01');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(3);
  });

});