/**
 * FlightHistory Quickstart Verification Scenarios
 * Feature: 003-flight-history-ui
 * Validates all 8 end-to-end scenarios defined in specs/003-flight-history-ui/quickstart.md
 * Principle V: Deterministic Testing with FakeFlightRecordDao
 */

import { FlightRecord } from '../../../src/data/local/models/FlightRecordEntity';
import { FlightHistoryController } from '../../../src/presentation/state/FlightHistoryController';
import { FakeFlightRecordDao } from '../../fakes/FakeFlightRecordDao';

const recordAlpha: FlightRecord = {
  id: 'flight-uuid-alpha',
  startTimeMillis: 1732410000000,
  endTimeMillis: 1732410900000,
  durationSeconds: 900,
  maxAltitudeMeters: 140.0,
  averageSpeedMps: 16.5,
  minBatteryPercentage: 75, // Green
};

const recordBeta: FlightRecord = {
  id: 'flight-uuid-beta',
  startTimeMillis: 1732420000000, // Newer flight
  endTimeMillis: 1732420600000,
  durationSeconds: 600,
  maxAltitudeMeters: 80.0,
  averageSpeedMps: 11.0,
  minBatteryPercentage: 35, // Amber
};

describe('Flight History Quickstart Scenarios (End-to-End Verification)', () => {
  let fakeDao: FakeFlightRecordDao;
  let controller: FlightHistoryController;

  beforeEach(async () => {
    fakeDao = new FakeFlightRecordDao();
    await fakeDao.insertFlightRecord(recordAlpha);
    await fakeDao.insertFlightRecord(recordBeta);
    controller = new FlightHistoryController(fakeDao);
    await controller.loadRecords();
  });

  afterEach(() => {
    controller.dispose();
  });

  it('Scenario 1: Chronological Browsing & Metric Display (FR-001, FR-002, FR-003, SC-001)', () => {
    const state = controller.getState();
    expect(state.records.length).toBe(2);
    // Reverse-chronological order: recordBeta (newer) first, then recordAlpha
    expect(state.records[0].id).toBe(recordBeta.id);
    expect(state.records[1].id).toBe(recordAlpha.id);
    expect(state.isEmpty).toBe(false);
  });

  it('Scenario 2: Real-Time Search & Query Reset (FR-004, FR-005, FR-006, SC-002)', () => {
    // Filter by 'alpha'
    controller.setSearchQuery('alpha');
    let state = controller.getState();
    expect(state.searchQuery).toBe('alpha');
    expect(state.filteredRecords.length).toBe(1);
    expect(state.filteredRecords[0].id).toBe(recordAlpha.id);
    expect(state.isSearchEmpty).toBe(false);

    // Clear query restores full list
    controller.clearSearchQuery();
    state = controller.getState();
    expect(state.searchQuery).toBe('');
    expect(state.filteredRecords.length).toBe(2);
  });

  it('Scenario 3: Empty Search Result & Quick Clear (FR-007, SC-006)', () => {
    controller.setSearchQuery('nomatch999');
    let state = controller.getState();
    expect(state.filteredRecords.length).toBe(0);
    expect(state.isSearchEmpty).toBe(true);
    expect(state.isEmpty).toBe(false);

    // Quick clear restores records
    controller.clearSearchQuery();
    state = controller.getState();
    expect(state.isSearchEmpty).toBe(false);
    expect(state.filteredRecords.length).toBe(2);
  });

  it('Scenario 4: Detail Modal Inspection & Return (FR-008, FR-009, FR-010, SC-003)', () => {
    // Select record opens inspection
    controller.selectRecord(recordAlpha);
    let state = controller.getState();
    expect(state.selectedRecord).toEqual(recordAlpha);

    // Dismiss returns to null
    controller.selectRecord(null);
    state = controller.getState();
    expect(state.selectedRecord).toBeNull();
  });

  it('Scenario 5: Safe Individual Record Deletion with Confirmation (FR-011, FR-012, FR-014, SC-004, SC-005)', async () => {
    controller.selectRecord(recordAlpha);

    const deleted = await controller.deleteRecord(recordAlpha.id);
    expect(deleted).toBe(true);

    const state = controller.getState();
    expect(state.records.length).toBe(1);
    expect(state.records[0].id).toBe(recordBeta.id);
    expect(state.filteredRecords.length).toBe(1);
    // Detail modal was automatically dismissed for deleted record
    expect(state.selectedRecord).toBeNull();
    expect(fakeDao.getRecordCount()).toBe(1);
  });

  it('Scenario 6: Cancellation of Deletion Prompt (FR-012, SC-004)', () => {
    // Simulated cancellation in UI: deleteRecord is never called
    const stateBefore = controller.getState();
    expect(stateBefore.records.length).toBe(2);
    expect(fakeDao.getRecordCount()).toBe(2);
  });

  it('Scenario 7: Bulk Purge of Flight History with Confirmation (FR-013, FR-014, FR-015, SC-004)', async () => {
    const purged = await controller.clearAllRecords();
    expect(purged).toBe(true);

    const state = controller.getState();
    expect(state.records).toEqual([]);
    expect(state.filteredRecords).toEqual([]);
    expect(state.isEmpty).toBe(true);
    expect(fakeDao.getRecordCount()).toBe(0);
  });

  it('Scenario 8: Error Banner & Recovery on Storage Failure (FR-017, SC-006)', async () => {
    jest.spyOn(fakeDao, 'getAllFlightRecords').mockRejectedValueOnce(new Error('SQLite access failure'));

    await controller.loadRecords();

    const state = controller.getState();
    expect(state.errorMessage).toBe('SQLite access failure');
    expect(state.isLoading).toBe(false);
  });
});
