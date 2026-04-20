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
      {/* Strings, numbers, and string-plus-variable JSX (which React
          flattens to an array of string/number children) all need to be
          wrapped in <Text>. Only skip the wrapper when the caller passed
          a real element (e.g. a nested <View>/<Icon>). */}
      {React.isValidElement(children) ? children : <Text style={textStyle}>{children}</Text>}
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
