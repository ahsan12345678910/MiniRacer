import React from 'react';
import { Text as RNText, StyleSheet, TextStyle } from 'react-native';

interface TextProps {
  children: React.ReactNode;
  style?: TextStyle;
  variant?: 'title' | 'subtitle' | 'body' | 'caption';
}

export const Text: React.FC<TextProps> = ({
  children,
  style,
  variant = 'body',
}) => {
  return <RNText style={[styles[variant], style]}>{children}</RNText>;
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  body: {
    fontSize: 16,
    color: '#ffffff',
  },
  caption: {
    fontSize: 14,
    color: '#cccccc',
  },
});
