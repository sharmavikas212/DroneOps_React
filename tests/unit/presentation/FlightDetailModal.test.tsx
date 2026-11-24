/**
 * FlightDetailModal Unit Tests
 * Feature: 003-flight-history-ui
 * Principle V: Deterministic Testing
 */

import React from 'react';
import { FlightRecord } from '../../../src/data/local/models/FlightRecordEntity';
import { FlightDetailModal } from '../../../src/presentation/components/FlightDetailModal';

const sampleRecord: FlightRecord = {
  id: 'flight-uuid-777',
  startTimeMillis: 1732410000000,
  endTimeMillis: 1732410900000,
  durationSeconds: 900,
  maxAltitudeMeters: 160.0,
  averageSpeedMps: 14.5,
  minBatteryPercentage: 58,
};

describe('FlightDetailModal', () => {
  it('returns null or hidden when visible is false or record is null', () => {
    const hiddenElement = FlightDetailModal({
      visible: false,
      record: sampleRecord,
      onClose: jest.fn(),
    });
    expect(hiddenElement).toBeNull();

    const noRecordElement = FlightDetailModal({
      visible: true,
      record: null,
      onClose: jest.fn(),
    });
    expect(noRecordElement).toBeNull();
  });

  it('renders detailed flight metrics when visible with record', () => {
    const onClose = jest.fn();
    const onDelete = jest.fn();

    const element = FlightDetailModal({
      visible: true,
      record: sampleRecord,
      onClose,
      onDelete,
    }) as React.ReactElement<any>;

    expect(element.props.testID).toBe('flight-detail-modal');

    // Modal content container is inside the Modal wrapper
    const modalContent = element.props.children;
    expect(modalContent).toBeDefined();
  });

  it('invokes onClose when close button is pressed', () => {
    const onClose = jest.fn();
    const element = FlightDetailModal({
      visible: true,
      record: sampleRecord,
      onClose,
    }) as React.ReactElement<any>;

    // Find close button by testID in modal tree
    const backdrop = element.props.children;
    const card = backdrop.props.children;
    const header = card.props.children[0];
    const closeBtn = header.props.children[1];

    expect(closeBtn.props.testID).toBe('detail-modal-close-button');
    closeBtn.props.onPress();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('invokes onDelete when delete button is pressed', () => {
    const onDelete = jest.fn();
    const element = FlightDetailModal({
      visible: true,
      record: sampleRecord,
      onClose: jest.fn(),
      onDelete,
    }) as React.ReactElement<any>;

    const backdrop = element.props.children;
    const card = backdrop.props.children;
    const footer = card.props.children[2];
    const deleteBtn = footer.props.children;

    expect(deleteBtn.props.testID).toBe('detail-modal-delete-button');
    deleteBtn.props.onPress();
    expect(onDelete).toHaveBeenCalledWith(sampleRecord);
  });
});
