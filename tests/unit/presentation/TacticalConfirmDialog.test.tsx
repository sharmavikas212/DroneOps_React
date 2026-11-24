/**
 * TacticalConfirmDialog Unit Tests
 * Feature: 003-flight-history-ui
 * Principle V: Deterministic Testing
 */

import React from 'react';
import { TacticalConfirmDialog } from '../../../src/presentation/components/TacticalConfirmDialog';

describe('TacticalConfirmDialog', () => {
  it('returns null when visible is false', () => {
    const element = TacticalConfirmDialog({
      visible: false,
      title: 'DELETE RECORD',
      message: 'Are you sure?',
      onConfirm: jest.fn(),
      onCancel: jest.fn(),
    });

    expect(element).toBeNull();
  });

  it('renders title, message, and action buttons when visible', () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();

    const element = TacticalConfirmDialog({
      visible: true,
      title: 'CONFIRM RECORD DELETION',
      message: 'This operation cannot be undone.',
      confirmLabel: 'DELETE RECORD',
      cancelLabel: 'CANCEL',
      onConfirm,
      onCancel,
    }) as React.ReactElement<any>;

    expect(element.props.testID).toBe('tactical-confirm-dialog');

    const backdrop = element.props.children;
    const dialogCard = backdrop.props.children;
    const actionsRow = dialogCard.props.children[2];

    const cancelBtn = actionsRow.props.children[0];
    const confirmBtn = actionsRow.props.children[1];

    expect(cancelBtn.props.testID).toBe('confirm-dialog-cancel');
    expect(confirmBtn.props.testID).toBe('confirm-dialog-confirm');

    cancelBtn.props.onPress();
    expect(onCancel).toHaveBeenCalledTimes(1);

    confirmBtn.props.onPress();
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('renders loading indicator and disables actions when isLoading is true', () => {
    const element = TacticalConfirmDialog({
      visible: true,
      title: 'DELETING RECORD',
      message: 'Removing from local storage...',
      isLoading: true,
      onConfirm: jest.fn(),
      onCancel: jest.fn(),
    }) as React.ReactElement<any>;

    const backdrop = element.props.children;
    const dialogCard = backdrop.props.children;
    const actionsRow = dialogCard.props.children[2];

    const cancelBtn = actionsRow.props.children[0];
    const confirmBtn = actionsRow.props.children[1];

    expect(cancelBtn.props.disabled).toBe(true);
    expect(confirmBtn.props.disabled).toBe(true);
  });
});
