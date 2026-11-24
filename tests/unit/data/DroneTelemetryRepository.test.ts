/**
 * Unit Tests for DroneTelemetryRepository Session Aggregation & Persistence (User Story 3)
 * Tests scenarios SC-004, SC-005, SC-006.
 */

import { FakeTelemetrySource } from '../../fakes/FakeTelemetrySource';
import { FakeFlightRecordDao } from '../../fakes/FakeFlightRecordDao';
import { DroneTelemetryRepository } from '../../../src/data/repository/DroneTelemetryRepository';
import { DroneTelemetry } from '../../../src/data/model/DroneTelemetry';

describe('DroneTelemetryRepository - User Story 3 (Session Recording & Aggregation)', () => {
  let source: FakeTelemetrySource;
  let dao: FakeFlightRecordDao;
  let repository: DroneTelemetryRepository;

  const basePacket: DroneTelemetry = {
    timestamp: 1700000000000,
    latitude: 37.7749,
    longitude: -122.4194,
    altitudeMeters: 50.0,
    airspeedMps: 10.0,
    headingDegrees: 90.0,
    batteryPercentage: 90.0,
  };

  beforeEach(() => {
    source = new FakeTelemetrySource();
    dao = new FakeFlightRecordDao();
    repository = new DroneTelemetryRepository(source, dao);
  });

  afterEach(async () => {
    await repository.stopStream();
  });

  it('flight completion persists summary record with accurate aggregated metrics', async () => {
    repository.startStream();

    // Ingest first packet (T = 0s)
    source.emitPacket(basePacket);

    // Ingest second packet (T = 60s, higher altitude, faster speed, lower battery)
    source.emitPacket({
      ...basePacket,
      timestamp: basePacket.timestamp + 60000,
      altitudeMeters: 120.0,
      airspeedMps: 20.0,
      batteryPercentage: 70.0,
    });

    // Ingest third packet (T = 120s, lower altitude, slower speed, lower battery)
    source.emitPacket({
      ...basePacket,
      timestamp: basePacket.timestamp + 120000,
      altitudeMeters: 80.0,
      airspeedMps: 15.0,
      batteryPercentage: 50.0,
    });

    // Stop stream -> flight session terminates and persists
    const record = await repository.stopStream();

    expect(record).not.toBeNull();
    expect(record?.durationSeconds).toBe(120);
    expect(record?.maxAltitudeMeters).toBe(120.0);
    // Average speed: (10 + 20 + 15) / 3 = 15.0 m/s
    expect(record?.averageSpeedMps).toBe(15.0);
    expect(record?.minBatteryPercentage).toBe(50.0);

    // Verify DAO contains the single persisted summary
    const allRecords = await dao.getAllFlightRecords();
    expect(allRecords).toHaveLength(1);
    expect(allRecords[0]).toEqual(record);
  });

  it('temporary signal drops do NOT split a single flight into multiple records', async () => {
    repository.startStream();

    // Flight begins
    source.emitPacket(basePacket);

    // Temporary signal drop: simulate disconnect
    source.setConnectionState('Disconnected');

    // Signal recovers: emit next packet 30s later
    source.emitPacket({
      ...basePacket,
      timestamp: basePacket.timestamp + 30000,
      altitudeMeters: 85.0,
      airspeedMps: 12.0,
      batteryPercentage: 75.0,
    });

    // Final termination
    await repository.stopStream();

    // Verify only ONE consolidated record is saved
    const allRecords = await dao.getAllFlightRecords();
    expect(allRecords).toHaveLength(1);
    expect(allRecords[0].durationSeconds).toBe(30);
    expect(allRecords[0].maxAltitudeMeters).toBe(85.0);
  });

  it('battery reaching 0% triggers automatic flight termination and persistence', async () => {
    repository.startStream();

    source.emitPacket(basePacket);

    // Battery drops to 0%
    source.emitPacket({
      ...basePacket,
      timestamp: basePacket.timestamp + 180000,
      batteryPercentage: 0.0,
    });

    // Repository should have auto-terminated and saved
    const allRecords = await dao.getAllFlightRecords();
    expect(allRecords).toHaveLength(1);
    expect(allRecords[0].minBatteryPercentage).toBe(0.0);
    expect(allRecords[0].durationSeconds).toBe(180);
    expect(repository.isFlightActive()).toBe(false);
  });

  it('zero-duration connection with no packets does NOT create a spurious flight record', async () => {
    repository.startStream();

    // Immediately stop without any packet received
    const record = await repository.stopStream();

    expect(record).toBeNull();
    const allRecords = await dao.getAllFlightRecords();
    expect(allRecords).toHaveLength(0);
  });
});
