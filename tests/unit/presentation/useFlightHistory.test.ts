/**
 * Unit Tests for Flight History Presentation Controller & State (User Story 1 - FR-008)
 * Validates empty state detection, populated record loading, and error states using FakeFlightRecordDao.
 */

import { FakeFlightRecordDao } from '../../fakes/FakeFlightRecordDao';
import { FlightHistoryController } from '../../../src/presentation/state/FlightHistoryController';
import { FlightRecord } from '../../../src/data/local/models/FlightRecordEntity';

describe('FlightHistoryController - User Story 1 (History & Empty State)', () => {
  let dao: FakeFlightRecordDao;
  let controller: FlightHistoryController;

  const sampleRecord1: FlightRecord = {
    id: 'flight-uuid-001',
    startTimeMillis: 1700000000000,
    endTimeMillis: 1700000600000,
    durationSeconds: 600,
    maxAltitudeMeters: 120.5,
    averageSpeedMps: 8.2,
    minBatteryPercentage: 42.0,
  };

  const sampleRecord2: FlightRecord = {
    id: 'flight-uuid-002',
    startTimeMillis: 1700001000000,
    endTimeMillis: 1700001900000,
    durationSeconds: 900,
    maxAltitudeMeters: 150.0,
    averageSpeedMps: 9.5,
    minBatteryPercentage: 25.0,
  };

  beforeEach(() => {
    dao = new FakeFlightRecordDao();
    controller = new FlightHistoryController(dao);
  });

  afterEach(() => {
    controller.dispose();
  });

  it('initializes with loading state, empty records, and no error', () => {
    const state = controller.getState();
    expect(state.isLoading).toBe(true);
    expect(state.records).toEqual([]);
    expect(state.errorMessage).toBeNull();
    expect(state.isEmpty).toBe(false);
  });

  it('detects empty state when DAO has zero records (FR-008)', async () => {
    await controller.loadRecords();

    const state = controller.getState();
    expect(state.isLoading).toBe(false);
    expect(state.records).toHaveLength(0);
    expect(state.isEmpty).toBe(true);
    expect(state.errorMessage).toBeNull();
  });

  it('loads and orders flight records when records are present in DAO', async () => {
    await dao.insertFlightRecord(sampleRecord1);
    await dao.insertFlightRecord(sampleRecord2);

    await controller.loadRecords();

    const state = controller.getState();
    expect(state.isLoading).toBe(false);
    expect(state.isEmpty).toBe(false);
    expect(state.records).toHaveLength(2);
    // Most recent start time should be first
    expect(state.records[0].id).toBe('flight-uuid-002');
    expect(state.records[1].id).toBe('flight-uuid-001');
  });

  it('handles DAO query errors gracefully', async () => {
    jest.spyOn(dao, 'getAllFlightRecords').mockRejectedValueOnce(new Error('SQLite disk I/O failure'));

    await controller.loadRecords();

    const state = controller.getState();
    expect(state.isLoading).toBe(false);
    expect(state.records).toHaveLength(0);
    expect(state.isEmpty).toBe(false);
    expect(state.errorMessage).toBe('SQLite disk I/O failure');
  });

  it('notifies subscribers on state updates', async () => {
    const listener = jest.fn();
    const unsubscribe = controller.subscribe(listener);

    await dao.insertFlightRecord(sampleRecord1);
    await controller.loadRecords();

    expect(listener).toHaveBeenCalled();
    const finalState = controller.getState();
    expect(finalState.records).toHaveLength(1);

    unsubscribe();
  });
});
