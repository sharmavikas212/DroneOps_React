/**
 * Unit Tests for FlightRecordDao CRUD Operations (User Story 3)
 * Validates persistent summary records and query ordering.
 */

import { FakeFlightRecordDao } from '../../fakes/FakeFlightRecordDao';
import { FlightRecord } from '../../../src/data/local/models/FlightRecordEntity';

describe('FlightRecordDao - User Story 3 (Summary Persistence)', () => {
  let dao: FakeFlightRecordDao;

  const sampleRecord1: FlightRecord = {
    id: 'flight-uuid-1',
    startTimeMillis: 1700000000000,
    endTimeMillis: 1700000300000,
    durationSeconds: 300,
    maxAltitudeMeters: 120.5,
    averageSpeedMps: 14.2,
    minBatteryPercentage: 15.0,
  };

  const sampleRecord2: FlightRecord = {
    id: 'flight-uuid-2',
    startTimeMillis: 1700001000000,
    endTimeMillis: 1700001600000,
    durationSeconds: 600,
    maxAltitudeMeters: 150.0,
    averageSpeedMps: 18.5,
    minBatteryPercentage: 22.0,
  };

  beforeEach(async () => {
    dao = new FakeFlightRecordDao();
    await dao.initDatabase();
  });

  it('inserts and retrieves flight summary records', async () => {
    await dao.insertFlightRecord(sampleRecord1);

    const records = await dao.getAllFlightRecords();
    expect(records).toHaveLength(1);
    expect(records[0]).toEqual(sampleRecord1);
  });

  it('retrieves records ordered by startTimeMillis DESC', async () => {
    await dao.insertFlightRecord(sampleRecord1);
    await dao.insertFlightRecord(sampleRecord2);

    const records = await dao.getAllFlightRecords();
    expect(records).toHaveLength(2);
    // Record 2 was started after Record 1, so it should be first
    expect(records[0].id).toBe('flight-uuid-2');
    expect(records[1].id).toBe('flight-uuid-1');
  });

  it('deletes a flight record by ID', async () => {
    await dao.insertFlightRecord(sampleRecord1);
    await dao.insertFlightRecord(sampleRecord2);

    await dao.deleteFlightRecord('flight-uuid-1');

    const records = await dao.getAllFlightRecords();
    expect(records).toHaveLength(1);
    expect(records[0].id).toBe('flight-uuid-2');
  });

  it('clears all flight records', async () => {
    await dao.insertFlightRecord(sampleRecord1);
    await dao.insertFlightRecord(sampleRecord2);

    await dao.clearAllFlightRecords();

    const records = await dao.getAllFlightRecords();
    expect(records).toHaveLength(0);
  });
});
