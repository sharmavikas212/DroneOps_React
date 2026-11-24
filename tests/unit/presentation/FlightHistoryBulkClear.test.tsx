/**
 * FlightHistoryBulkClear Unit Tests
 * Feature: 003-flight-history-ui
 * Principle V: Deterministic Testing
 */

import { FlightRecord } from '../../../src/data/local/models/FlightRecordEntity';
import { FlightHistoryController } from '../../../src/presentation/state/FlightHistoryController';
import { FakeFlightRecordDao } from '../../fakes/FakeFlightRecordDao';

const record1: FlightRecord = {
  id: 'flight-uuid-1',
  startTimeMillis: 1732410000000,
  endTimeMillis: 1732410600000,
  durationSeconds: 600,
  maxAltitudeMeters: 100,
  averageSpeedMps: 12,
  minBatteryPercentage: 50,
};

const record2: FlightRecord = {
  id: 'flight-uuid-2',
  startTimeMillis: 1732420000000,
  endTimeMillis: 1732420600000,
  durationSeconds: 600,
  maxAltitudeMeters: 80,
  averageSpeedMps: 10,
  minBatteryPercentage: 40,
};

describe('FlightHistoryBulkClear (User Story 5)', () => {
  let fakeDao: FakeFlightRecordDao;
  let controller: FlightHistoryController;

  beforeEach(async () => {
    fakeDao = new FakeFlightRecordDao();
    await fakeDao.insertFlightRecord(record1);
    await fakeDao.insertFlightRecord(record2);
    controller = new FlightHistoryController(fakeDao);
    await controller.loadRecords();
  });

  afterEach(() => {
    controller.dispose();
  });

  it('purges all records from storage and transitions to empty state', async () => {
    expect(controller.getState().records.length).toBe(2);
    expect(controller.getState().isEmpty).toBe(false);

    controller.selectRecord(record1);
    expect(controller.getState().selectedRecord).toBeDefined();

    const success = await controller.clearAllRecords();

    expect(success).toBe(true);
    const state = controller.getState();
    expect(state.records).toEqual([]);
    expect(state.filteredRecords).toEqual([]);
    expect(state.selectedRecord).toBeNull();
    expect(state.isEmpty).toBe(true);
    expect(fakeDao.getRecordCount()).toBe(0);
  });

  it('handles DAO clear failure gracefully without corrupting state', async () => {
    jest.spyOn(fakeDao, 'clearAllFlightRecords').mockRejectedValueOnce(new Error('SQLite locked'));

    const success = await controller.clearAllRecords();

    expect(success).toBe(false);
    const state = controller.getState();
    expect(state.records.length).toBe(2);
    expect(state.isEmpty).toBe(false);
    expect(state.errorMessage).toBe('SQLite locked');
    expect(state.isDeleting).toBe(false);
  });
});
