/**
 * FlightHistoryController Unit Tests
 * Feature: 003-flight-history-ui
 * Principle V: Deterministic Testing with FakeFlightRecordDao
 */

import { FlightRecord } from '../../../src/data/local/models/FlightRecordEntity';
import { FlightHistoryController } from '../../../src/presentation/state/FlightHistoryController';
import { FakeFlightRecordDao } from '../../fakes/FakeFlightRecordDao';

const mockFlight1: FlightRecord = {
  id: 'flight-uuid-001',
  startTimeMillis: 1732410000000, // Nov 24, 2024
  endTimeMillis: 1732410600000,
  durationSeconds: 600,
  maxAltitudeMeters: 120.5,
  averageSpeedMps: 15.2,
  minBatteryPercentage: 65,
};

const mockFlight2: FlightRecord = {
  id: 'flight-uuid-002',
  startTimeMillis: 1732420000000, // Later on Nov 24, 2024
  endTimeMillis: 1732421200000,
  durationSeconds: 1200,
  maxAltitudeMeters: 85.0,
  averageSpeedMps: 10.1,
  minBatteryPercentage: 35,
};

describe('FlightHistoryController', () => {
  let fakeDao: FakeFlightRecordDao;
  let controller: FlightHistoryController;

  beforeEach(() => {
    fakeDao = new FakeFlightRecordDao();
    controller = new FlightHistoryController(fakeDao);
  });

  afterEach(() => {
    controller.dispose();
  });

  describe('Initial State', () => {
    it('initializes with default state values', () => {
      const state = controller.getState();
      expect(state.records).toEqual([]);
      expect(state.filteredRecords).toEqual([]);
      expect(state.searchQuery).toBe('');
      expect(state.selectedRecord).toBeNull();
      expect(state.isLoading).toBe(true);
      expect(state.isDeleting).toBe(false);
      expect(state.errorMessage).toBeNull();
      expect(state.isEmpty).toBe(false);
      expect(state.isSearchEmpty).toBe(false);
    });
  });

  describe('loadRecords', () => {
    it('successfully loads records and sets filteredRecords', async () => {
      await fakeDao.insertFlightRecord(mockFlight1);
      await fakeDao.insertFlightRecord(mockFlight2);

      await controller.loadRecords();

      const state = controller.getState();
      expect(state.isLoading).toBe(false);
      expect(state.records.length).toBe(2);
      expect(state.filteredRecords.length).toBe(2);
      expect(state.isEmpty).toBe(false);
      expect(state.isSearchEmpty).toBe(false);
      expect(state.errorMessage).toBeNull();
    });

    it('sets isEmpty true when no records exist', async () => {
      await controller.loadRecords();

      const state = controller.getState();
      expect(state.isLoading).toBe(false);
      expect(state.records).toEqual([]);
      expect(state.filteredRecords).toEqual([]);
      expect(state.isEmpty).toBe(true);
      expect(state.isSearchEmpty).toBe(false);
    });

    it('handles database error gracefully', async () => {
      jest.spyOn(fakeDao, 'getAllFlightRecords').mockRejectedValueOnce(new Error('Disk I/O failure'));

      await controller.loadRecords();

      const state = controller.getState();
      expect(state.isLoading).toBe(false);
      expect(state.records).toEqual([]);
      expect(state.errorMessage).toBe('Disk I/O failure');
      expect(state.isEmpty).toBe(false);
    });
  });

  describe('Search & Filter', () => {
    beforeEach(async () => {
      await fakeDao.insertFlightRecord(mockFlight1);
      await fakeDao.insertFlightRecord(mockFlight2);
      await controller.loadRecords();
    });

    it('filters records by flight id substring', () => {
      controller.setSearchQuery('001');

      const state = controller.getState();
      expect(state.searchQuery).toBe('001');
      expect(state.filteredRecords.length).toBe(1);
      expect(state.filteredRecords[0].id).toBe('flight-uuid-001');
      expect(state.isSearchEmpty).toBe(false);
    });

    it('sets isSearchEmpty true when no records match query', () => {
      controller.setSearchQuery('non-existent-query');

      const state = controller.getState();
      expect(state.filteredRecords.length).toBe(0);
      expect(state.isSearchEmpty).toBe(true);
      expect(state.isEmpty).toBe(false); // Global records still exist
    });

    it('clears search query and restores filteredRecords', () => {
      controller.setSearchQuery('001');
      expect(controller.getState().filteredRecords.length).toBe(1);

      controller.clearSearchQuery();

      const state = controller.getState();
      expect(state.searchQuery).toBe('');
      expect(state.filteredRecords.length).toBe(2);
      expect(state.isSearchEmpty).toBe(false);
    });
  });

  describe('Record Selection (Detail Modal)', () => {
    it('sets and clears selectedRecord', () => {
      controller.selectRecord(mockFlight1);
      expect(controller.getState().selectedRecord).toEqual(mockFlight1);

      controller.selectRecord(null);
      expect(controller.getState().selectedRecord).toBeNull();
    });
  });

  describe('deleteRecord', () => {
    beforeEach(async () => {
      await fakeDao.insertFlightRecord(mockFlight1);
      await fakeDao.insertFlightRecord(mockFlight2);
      await controller.loadRecords();
    });

    it('deletes record from DAO and updates state', async () => {
      controller.selectRecord(mockFlight1);

      const success = await controller.deleteRecord(mockFlight1.id);

      expect(success).toBe(true);
      const state = controller.getState();
      expect(state.records.length).toBe(1);
      expect(state.records[0].id).toBe(mockFlight2.id);
      expect(state.filteredRecords.length).toBe(1);
      // Auto-closes modal if open record was deleted
      expect(state.selectedRecord).toBeNull();
      expect(fakeDao.getRecordCount()).toBe(1);
    });

    it('sets isEmpty true when last record is deleted', async () => {
      await controller.deleteRecord(mockFlight1.id);
      await controller.deleteRecord(mockFlight2.id);

      const state = controller.getState();
      expect(state.records.length).toBe(0);
      expect(state.filteredRecords.length).toBe(0);
      expect(state.isEmpty).toBe(true);
    });

    it('handles delete failure gracefully and retains records', async () => {
      jest.spyOn(fakeDao, 'deleteFlightRecord').mockRejectedValueOnce(new Error('Deletion locked'));

      const success = await controller.deleteRecord(mockFlight1.id);

      expect(success).toBe(false);
      const state = controller.getState();
      expect(state.records.length).toBe(2);
      expect(state.errorMessage).toBe('Deletion locked');
      expect(state.isDeleting).toBe(false);
    });
  });

  describe('clearAllRecords', () => {
    beforeEach(async () => {
      await fakeDao.insertFlightRecord(mockFlight1);
      await fakeDao.insertFlightRecord(mockFlight2);
      await controller.loadRecords();
    });

    it('clears all records from DAO and resets state to empty', async () => {
      controller.selectRecord(mockFlight1);

      const success = await controller.clearAllRecords();

      expect(success).toBe(true);
      const state = controller.getState();
      expect(state.records).toEqual([]);
      expect(state.filteredRecords).toEqual([]);
      expect(state.selectedRecord).toBeNull();
      expect(state.isEmpty).toBe(true);
      expect(fakeDao.getRecordCount()).toBe(0);
    });

    it('handles clearAll failure gracefully', async () => {
      jest.spyOn(fakeDao, 'clearAllFlightRecords').mockRejectedValueOnce(new Error('Purge failed'));

      const success = await controller.clearAllRecords();

      expect(success).toBe(false);
      const state = controller.getState();
      expect(state.records.length).toBe(2);
      expect(state.errorMessage).toBe('Purge failed');
      expect(state.isDeleting).toBe(false);
    });
  });

  describe('Subscription', () => {
    it('notifies listeners on state changes and un-subscribes', async () => {
      const listener = jest.fn();
      const unsubscribe = controller.subscribe(listener);

      controller.setSearchQuery('test');
      expect(listener).toHaveBeenCalledWith(expect.objectContaining({ searchQuery: 'test' }));

      unsubscribe();
      controller.setSearchQuery('another');
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });
});
