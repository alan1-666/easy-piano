import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Home, Music, BarChart3, User } from '../../src/components/Icons';
import { Colors } from '../../src/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          tabBarIcon: ({ color, size }) => (
            <Home size={22} color={color} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="songs"
        options={{
          title: '曲库',
          tabBarIcon: ({ color, size }) => (
            <Music size={22} color={color} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: '练习',
          tabBarIcon: ({ color, size }) => (
            <BarChart3 size={22} color={color} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ color, size }) => (
            <User size={22} color={color} strokeWidth={1.8} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.bgSecondary,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    height: 56,
    paddingBottom: 4,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
});
