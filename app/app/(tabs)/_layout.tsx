import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { IconHome, IconLibrary, IconBook, IconUser } from '../../src/components/Icons';
import { Palette } from '../../src/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Palette.primary,
        tabBarInactiveTintColor: Palette.ink3,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          tabBarIcon: ({ color, focused }) => (
            <IconHome size={22} color={color} fill={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="songs"
        options={{
          title: '曲库',
          tabBarIcon: ({ color, focused }) => (
            <IconLibrary size={22} color={color} fill={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: '课程',
          tabBarIcon: ({ color, focused }) => (
            <IconBook size={22} color={color} fill={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ color, focused }) => (
            <IconUser size={22} color={color} fill={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderTopColor: Palette.line,
    borderTopWidth: StyleSheet.hairlineWidth,
    height: 84,
    paddingTop: 8,
    paddingBottom: 28,
  },
  tabBarLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    letterSpacing: -0.1,
    marginTop: 2,
  },
});
