import React from 'react';
import { View, ScrollView, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../../theme';

interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
}

export default function ScreenContainer({
  children,
  scrollable = false,
  style,
  padded = true,
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();
  const horizontalPadding = padded ? Spacing.lg : 0;

  if (scrollable) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            { paddingHorizontal: horizontalPadding, paddingBottom: Spacing.xxl },
            style,
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
        { paddingTop: insets.top, paddingBottom: insets.bottom, paddingHorizontal: horizontalPadding },
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
    backgroundColor: Colors.bgPrimary,
  },
  scrollView: {
    flex: 1,
  },
});
