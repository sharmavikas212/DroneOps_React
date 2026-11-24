/**
 * Contract: Flight History UI Components
 * Feature: 003-flight-history-ui
 * Utilitarian tactical dark theme components for browsing, searching, inspecting, and deleting records.
 */

import { FlightRecord } from '../../../src/data/local/models/FlightRecordEntity';

export interface FlightHistoryCardProps {
  /** Flight record to display */
  record: FlightRecord;
  /** Callback when card is pressed to inspect details */
  onPress?: (record: FlightRecord) => void;
  /** Callback when delete icon button on card is pressed */
  onDeletePress?: (record: FlightRecord) => void;
  /** Test identifier */
  testID?: string;
}

export interface FlightSearchBarProps {
  /** Current search input string */
  query: string;
  /** Callback fired synchronously as the user types */
  onChangeQuery: (text: string) => void;
  /** Callback to reset search query */
  onClear: () => void;
  /** Number of matching records */
  resultCount: number;
  /** Total number of records available */
  totalCount: number;
  /** Test identifier */
  testID?: string;
}

export interface FlightDetailModalProps {
  /** Whether the detail modal is currently visible */
  visible: boolean;
  /** Flight record being inspected */
  record: FlightRecord | null;
  /** Callback to close the modal and return to list */
  onClose: () => void;
  /** Callback to initiate deletion from within the detail view */
  onDelete?: (record: FlightRecord) => void;
  /** Test identifier */
  testID?: string;
}

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
  /** Whether deletion is currently executing (shows spinner and disables buttons) */
  isLoading?: boolean;
  /** Callback when confirm button is pressed */
  onConfirm: () => void;
  /** Callback when cancel button or backdrop is pressed */
  onCancel: () => void;
  /** Test identifier */
  testID?: string;
}
