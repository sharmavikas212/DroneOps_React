/**
 * Deterministic Mock for expo-sqlite
 * Complies with Constitution Principle V.
 */

export const openDatabaseSync = jest.fn(() => ({
  execAsync: jest.fn().mockResolvedValue(undefined),
  runAsync: jest.fn().mockResolvedValue(undefined),
  getAllAsync: jest.fn().mockResolvedValue([]),
}));

export default {
  openDatabaseSync,
};
