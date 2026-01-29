import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, StyleSheet } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import WishlistScreen from './screens/WishlistScreen';
import AllItemsScreen from './screens/AllItemsScreen';
import SettingsScreen from './screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: '#C89B3C',
          tabBarInactiveTintColor: '#5A6B8C',
          tabBarLabelStyle: styles.tabBarLabel,
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <Image
                source={
                  focused
                    ? require('./assets/icons/icon_home_active.svg')
                    : require('./assets/icons/icon_home_inactive.svg')
                }
                style={styles.icon}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Wishlist"
          component={WishlistScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <Image
                source={
                  focused
                    ? require('./assets/icons/icon_heart_inactive.svg')
                    : require('./assets/icons/icon_heart_inactive.svg')
                }
                style={[styles.icon, focused && styles.activeIcon]}
              />
            ),
          }}
        />
        <Tab.Screen
          name="All Items"
          component={AllItemsScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <Image
                source={
                  focused
                    ? require('./assets/icons/icon_list_active.svg')
                    : require('./assets/icons/icon_list_inactive.svg')
                }
                style={styles.icon}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <Image
                source={require('./assets/icons/icon_settings_inactive.svg')}
                style={[styles.icon, focused && styles.activeIcon]}
              />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#121825',
    borderTopWidth: 2,
    borderTopColor: '#1F2937',
    height: 70,
    paddingBottom: 10,
    paddingTop: 10,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: '#5A6B8C',
  },
  activeIcon: {
    tintColor: '#C89B3C',
  },
});
