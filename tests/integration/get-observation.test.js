const { makeObservations, makePatients } = require('../../factories');
const { Observation } = require('../../models/Observation');
const { Patient } = require('../../models/Patient');
const request = require('supertest');

let server;

describe('Get Observation', () => {
  beforeEach(async () => {
    server = await require('../../index');
    await Observation.remove();
    await makePatients(5);
  });

  afterEach(async () => {
    await Observation.remove();
    await Patient.remove();
    await server.close();
  });

  it('allows user to get all observations', async () => {
    await makeObservations(10);
    const res = await request(server).get('/fhir/Observation');
    expect(res.status).toBe(200);
    expect(res.body.entry.length).toBe(10);
  });

  it('allows user to get observations with default effective and value', async () => {
    const now = new Date();

    await makeObservations(1, {
      value: 'valueString',
      valueString: 'Fever',
      effectiveDateTime: now,
      effective: 'effectiveDateTime',
    });

    const res = await request(server).get('/fhir/Observation');
    expect(res.status).toBe(200);
    expect(res.body.entry[0].resource.valueString).toBe('Fever');
    expect(res.body.entry[0].resource.effectiveDateTime).toBe(now.toISOString());
  });

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
      subject: { reference: 'Patient/123' },
    });

    const res = await request(server).get('/fhir/Observation?patient=123');
    expect(res.status).toBe(200);
    expect(res.body.entry[0].resource.subject.reference).toBe('Patient/123');
  });

  it('allows user to query for all observations of a specific category', async () => {
    await makeObservations(3);
    await makeObservations(1, {
      category: [
        {
          coding: [
            {
              system: 'http://hl7.org/fhir/observation-category',
              code: 'vital-signs',
              display: 'Vital Signs',
            },
          ],
        },
      ],
    });
    await makeObservations(3);

    const res = await request(server).get('/fhir/Observation?category=vital-signs');
    expect(res.status).toBe(200);
    expect(res.body.entry.length).toBe(1);
  });

  it('allows user to query for all observations of a specific code', async () => {
    await makeObservations(3);
    await makeObservations(1, {
      code: {
        coding: [
          { code: '8480-6', system: 'http://loinc.org', display: 'Systolic blood pressure' },
        ],
      },
    });
    const res = await request(server).get('/fhir/Observation?code=8480-6');
    expect(res.status).toBe(200);
    expect(
      res.body.entry[0].resource.code.coding.filter(coding => coding.code === '8480-6').length,
    ).toBeGreaterThan(0);
  });

  it('allows user to query for all observations that have any one of provided codes', async () => {
    await makeObservations(3);
    await makeObservations(1, {
      code: {
        coding: [
          { code: '8480-6', system: 'http://loinc.org', display: 'Systolic blood pressure' },
        ],
      },
    });
    await makeObservations(3);
    await makeObservations(1, {
      code: {
        coding: [{ code: '9279-1', system: 'http://loinc.org', display: 'Respiratory Rate' }],
      },
    });
    await makeObservations(3);

    const res = await request(server).get('/fhir/Observation?code=8480-6,9279-1');
    expect(res.status).toBe(200);
    expect(res.body.entry.length).toBe(2);
  });

  it('allows users to query for all observations before a certain date', async () => {
    const oldDate = new Date(Date.parse('1999-12-05'));

    await makeObservations(4, {
      effectiveDateTime: new Date(),
      effective: 'effectiveDateTime',
    });

    await makeObservations(1, {
      effectiveDateTime: oldDate,
      effective: 'effectiveDateTime',
    });

    const res = await request(server).get('/fhir/Observation?date=lt2001-01-01');
    expect(res.status).toBe(200);
    expect(res.body.entry.length).toBe(1);
  });

  it('allows users to query for all observations after a certain date', async () => {
    const oldDate = new Date(Date.parse('1999-12-05'));

    await makeObservations(3, {
      effectiveDateTime: new Date(),
      effecitve: 'effectiveDateTime',
    });

    await makeObservations(1, {
      effectiveDateTime: oldDate,
      effective: 'effectiveDateTime',
    });

    const res = await request(server).get('/fhir/Observation?date=gt2001-01-01');
    expect(res.status).toBe(200);
    expect(res.body.entry.length).toBe(3);
  });

  it('allows user to get back data as a bundle with type of collection', async () => {
    await makeObservations(3);

    const res = await request(server).get('/fhir/Observation');
    expect(res.status).toBe(200);
    expect(res.body.resourceType).toBe('Bundle');
    expect(res.body.type).toBe('collection');
  });

  it('allows user to get back a bundle of type searchset if there are search params', async () => {
    await makeObservations(3);

    const res = await request(server).get('/fhir/Observation?patient=1234');
    expect(res.status).toBe(200);
    expect(res.body.resourceType).toBe('Bundle');
    expect(res.body.type).toBe('searchset');
  });

  it('allows user to get back total number of search matches', async () => {
    await makeObservations(3);

    const res = await request(server).get('/fhir/Observation?patient=1234');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(0);
  });

  it('returns a 400 status code if the parameter is invalid', async () => {
    await makeObservations(3);

    const res = await request(server).get('/fhir/Observation?patiens=1234');
    expect(res.status).toBe(400);
  });
});
