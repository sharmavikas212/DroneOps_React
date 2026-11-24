/**
 * Deterministic React Native Mock for Unit Tests
 * Complies with Constitution Principle V.
 */

import React from 'react';

export const StyleSheet = {
  create: (styles: any) => styles,
};

export const View = (props: any) => React.createElement('View', props, props?.children);
export const Text = (props: any) => React.createElement('Text', props, props?.children);
export const TouchableOpacity = (props: any) =>
  React.createElement('TouchableOpacity', props, props?.children);
export const Pressable = (props: any) =>
  React.createElement('Pressable', props, props?.children);
export const TextInput = (props: any) =>
  React.createElement('TextInput', props, props?.children);
export const Modal = (props: any) =>
  props?.visible !== false ? React.createElement('Modal', props, props?.children) : null;
export const ActivityIndicator = (props: any) =>
  React.createElement('ActivityIndicator', props, props?.children);
export const ScrollView = (props: any) =>
  React.createElement('ScrollView', props, props?.children);
export const RefreshControl = (props: any) =>
  React.createElement('RefreshControl', props, props?.children);
export const SafeAreaView = (props: any) =>
  React.createElement('SafeAreaView', props, props?.children);

export const Platform = {
  OS: 'android',
  select: (objs: any) => objs.android ?? objs.default,
};

export const PanResponder = {
  create: (config: any) => ({
    panHandlers: {},
  }),
};

export default {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  TextInput,
  Modal,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  Platform,
  PanResponder,
};
