/**
 * FlightSearchBar Unit Tests
 * Feature: 003-flight-history-ui
 * Principle V: Deterministic Testing
 */

import React from 'react';
import { FlightSearchBar } from '../../../src/presentation/components/FlightSearchBar';

describe('FlightSearchBar', () => {
  it('renders search input with current query and placeholder', () => {
    const onChangeQuery = jest.fn();
    const onClear = jest.fn();

    const element = FlightSearchBar({
      query: 'Nov 24',
      onChangeQuery,
      onClear,
      resultCount: 2,
      totalCount: 5,
    }) as React.ReactElement<any>;

    expect(element.props.testID).toBe('flight-search-bar');

    // Find search input
    const inputContainer = element.props.children[0];
    const textInput = inputContainer.props.children[1];

    expect(textInput.props.testID).toBe('flight-search-input');
    expect(textInput.props.value).toBe('Nov 24');

    textInput.props.onChangeText('Nov 25');
    expect(onChangeQuery).toHaveBeenCalledWith('Nov 25');
  });

  it('renders clear button when query is present and triggers onClear', () => {
    const onClear = jest.fn();
    const element = FlightSearchBar({
      query: '001',
      onChangeQuery: jest.fn(),
      onClear,
      resultCount: 1,
      totalCount: 4,
    }) as React.ReactElement<any>;

    const inputContainer = element.props.children[0];
    const clearButton = inputContainer.props.children[2];

    expect(clearButton).toBeDefined();
    expect(clearButton.props.testID).toBe('clear-search-button');

    clearButton.props.onPress();
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('hides clear button when query is empty', () => {
    const element = FlightSearchBar({
      query: '',
      onChangeQuery: jest.fn(),
      onClear: jest.fn(),
      resultCount: 5,
      totalCount: 5,
    }) as React.ReactElement<any>;

    const inputContainer = element.props.children[0];
    const clearButton = inputContainer.props.children[2];

    expect(clearButton).toBeNull();
  });

  it('displays badge showing result count vs total count when filtered', () => {
    const element = FlightSearchBar({
      query: 'uuid',
      onChangeQuery: jest.fn(),
      onClear: jest.fn(),
      resultCount: 3,
      totalCount: 8,
    }) as React.ReactElement<any>;

    const countBadge = element.props.children[1];
    expect(countBadge.props.testID).toBe('search-result-count-badge');
  });
});
