/**
 * TacticalConfirmDialog Component
 * Feature: 003-flight-history-ui
 * High-visibility tactical danger confirmation dialog for individual record deletion and bulk history purging.
 * Conforms to contracts/flight-history-components.contract.ts
 */

import React from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../../theme/colors';

export interface TacticalConfirmDialogProps {
  /** Whether the confirmation dialog is visible */
  visible: boolean;
  /** Dialog title (e.g. "CONFIRM RECORD DELETION") */
  title: string;
  /** Warning message or explanation */
  message: string;
  /** Label for confirm button (e.g. "DELETE RECORD" or "PURGE ALL") */
  confirmLabel?: string;
  /** Label for cancel button (e.g. "CANCEL") */
  cancelLabel?: string;
  /** Whether the confirm button should use danger (red) styling */
  isDanger?: boolean;
  /** Whether deletion is currently executing */
  isLoading?: boolean;
  /** Callback when confirm button is pressed */
  onConfirm: () => void;
  /** Callback when cancel button or backdrop is pressed */
  onCancel: () => void;
  /** Test identifier */
  testID?: string;
}

export const TacticalConfirmDialog: React.FC<TacticalConfirmDialogProps> = ({
  visible,
  title,
  message,
  confirmLabel = 'CONFIRM',
  cancelLabel = 'CANCEL',
  isDanger = true,
  isLoading = false,
  onConfirm,
  onCancel,
  testID = 'tactical-confirm-dialog',
}) => {
  if (!visible) {
    return null;
  }

  const confirmColor = isDanger ? colors.status.error : colors.metric.cyan;
  const confirmBg = isDanger ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0, 229, 255, 0.2)';

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={isLoading ? undefined : onCancel}
      testID={testID}
    >
      <View style={styles.backdrop}>
        <View style={[styles.dialogCard, isDanger && styles.dangerCard]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.title}>{title}</Text>
          </View>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              testID="confirm-dialog-cancel"
              style={styles.cancelButton}
              disabled={isLoading}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>{cancelLabel}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              testID="confirm-dialog-confirm"
              style={[
                styles.confirmButton,
                { borderColor: confirmColor, backgroundColor: confirmBg },
              ]}
              disabled={isLoading}
              onPress={onConfirm}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={confirmColor} />
              ) : (
                <Text style={[styles.confirmButtonText, { color: confirmColor }]}>
                  {confirmLabel}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 8,
    padding: 20,
  },
  dangerCard: {
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  warningIcon: {
    fontSize: 18,
  },
  title: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: 0.8,
  },
  message: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  confirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  confirmButtonText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
