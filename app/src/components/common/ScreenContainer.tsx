import React from 'react';
import { View, ScrollView, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Palette, Spacing } from '../../theme';

interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  padded?: boolean;
  bg?: string;
  paddingBottom?: number;
}

export default function ScreenContainer({
  children,
  scrollable = false,
  style,
  contentStyle,
  padded = true,
  bg = Palette.bg,
  paddingBottom = Spacing.xxl,
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();
  const horizontalPadding = padded ? 20 : 0;

  if (scrollable) {
    return (
      <View style={[styles.container, { backgroundColor: bg, paddingTop: insets.top }, style]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            { paddingHorizontal: horizontalPadding, paddingBottom: paddingBottom + insets.bottom },
            contentStyle,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: bg,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingHorizontal: horizontalPadding,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
});
