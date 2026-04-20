import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp, TextStyle } from 'react-native';
import { Palette, FontWeight } from '../../theme';

interface PillProps {
  children: React.ReactNode;
  bg?: string;
  color?: string;
  size?: 'xs' | 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
  leading?: React.ReactNode;
}

const SIZES = {
  xs: { padV: 2, padH: 8, font: 10 },
  sm: { padV: 3, padH: 9, font: 11 },
  md: { padV: 5, padH: 10, font: 11.5 },
};

export default function Pill({
  children,
  bg = Palette.chip,
  color = Palette.ink2,
  size = 'md',
  style,
  leading,
}: PillProps) {
  const { padV, padH, font } = SIZES[size];
  const textStyle: TextStyle = {
    fontSize: font,
    fontWeight: FontWeight.semibold,
    color,
    letterSpacing: -0.1,
  };
  return (
    <View
      style={[
        styles.base,
        { backgroundColor: bg, paddingVertical: padV, paddingHorizontal: padH },
        style,
      ]}
    >
      {leading}
      {typeof children === 'string' ? <Text style={textStyle}>{children}</Text> : children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
});
