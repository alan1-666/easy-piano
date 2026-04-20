// Gradient helpers implemented with react-native-svg to avoid adding a
// native dependency on expo-linear-gradient. All components fill their
// parent; place them inside a View with explicit dimensions or flex sizing.
import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  RadialGradient as SvgRadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

type LinearProps = {
  from: string;
  to: string;
  angle?: number; // degrees — 0 is left-to-right, 90 is top-to-bottom
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

export function LinearBar({ from, to, angle = 0, radius = 0, style }: LinearProps) {
  const rad = (angle * Math.PI) / 180;
  const x1 = 0.5 - Math.cos(rad) / 2;
  const y1 = 0.5 - Math.sin(rad) / 2;
  const x2 = 0.5 + Math.cos(rad) / 2;
  const y2 = 0.5 + Math.sin(rad) / 2;
  return (
    <View style={[StyleSheet.absoluteFill, style]}>
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <SvgLinearGradient id="g" x1={x1} y1={y1} x2={x2} y2={y2}>
            <Stop offset="0" stopColor={from} />
            <Stop offset="1" stopColor={to} />
          </SvgLinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#g)" rx={radius} ry={radius} />
      </Svg>
    </View>
  );
}

type RadialProps = {
  from: string; // center color
  to: string; // edge color (usually transparent-ish)
  cx?: number; // 0..1
  cy?: number;
  rx?: number; // 0..1, radius ratio
  ry?: number;
  style?: StyleProp<ViewStyle>;
};

export function RadialBg({ from, to, cx = 0.5, cy = 0, rx = 0.7, ry = 1, style }: RadialProps) {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <SvgRadialGradient id="r" cx={cx} cy={cy} rx={rx} ry={ry} fx={cx} fy={cy}>
            <Stop offset="0" stopColor={from} stopOpacity={1} />
            <Stop offset="1" stopColor={to} stopOpacity={0} />
          </SvgRadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#r)" />
      </Svg>
    </View>
  );
}
