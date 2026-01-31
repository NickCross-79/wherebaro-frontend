import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, StatusBar, View, Text } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import * as NavigationBar from 'expo-navigation-bar';
import HomeScreen from './screens/HomeScreen';
import ItemDetailScreen from './screens/ItemDetailScreen';
import WishlistScreen from './screens/WishlistScreen';
import AllItemsScreen from './screens/AllItemsScreen';
import SettingsScreen from './screens/SettingsScreen';
import FeedbackScreen from './screens/FeedbackScreen';
import HomeActive from './assets/icons/icon_home_active.svg';
import HomeInactive from './assets/icons/icon_home_inactive.svg';
import ListActive from './assets/icons/icon_list_active.svg';
import ListInactive from './assets/icons/icon_list_inactive.svg';
import HeartInactive from './assets/icons/icon_heart_inactive.svg';
import SettingsInactive from './assets/icons/icon_settings_inactive.svg';
import Ionicons from '@expo/vector-icons/Ionicons';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const WishlistStack = createNativeStackNavigator();
const AllItemsStack = createNativeStackNavigator();
const SettingsStack = createNativeStackNavigator();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <HomeStack.Screen name="HomeList" component={HomeScreen} />
      <HomeStack.Screen name="ItemDetail" component={ItemDetailScreen} />
    </HomeStack.Navigator>
  );
}

function WishlistStackNavigator() {
  return (
    <WishlistStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <WishlistStack.Screen name="WishlistList" component={WishlistScreen} />
      <WishlistStack.Screen name="ItemDetail" component={ItemDetailScreen} />
    </WishlistStack.Navigator>
  );
}

function AllItemsStackNavigator() {
  return (
    <AllItemsStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AllItemsStack.Screen name="AllItemsList" component={AllItemsScreen} />
      <AllItemsStack.Screen name="ItemDetail" component={ItemDetailScreen} />
    </AllItemsStack.Navigator>
  );
}

function SettingsStackNavigator() {
  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <SettingsStack.Screen name="SettingsMain" component={SettingsScreen} />
      <SettingsStack.Screen name="Feedback" component={FeedbackScreen} />
    </SettingsStack.Navigator>
  );
}

function TabNavigatorWithSafeArea() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          ...styles.tabBar,
          paddingBottom: insets.bottom + 10,
          height: insets.bottom + 70,
        },
                tabBarBackground: () => (
                  <LinearGradient
                    colors={['rgba(15, 20, 25, 0.15)', 'rgba(15, 20, 25, 0.85)', '#0F1419']}
                    locations={[0, 0.45, 1]}
                    style={{ flex: 1 }}
                  />
                ),
        tabBarActiveTintColor: '#D4A574',
        tabBarInactiveTintColor: '#5A6B8C',
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
        <Tab.Screen
          name="Home"
          component={HomeStackNavigator}
          options={{
            unmountOnBlur: true,
            tabBarIcon: ({ focused }) => (
              <Ionicons 
                name="home" 
                size={24} 
                color={focused ? '#D4A574' : '#5A6B8C'} 
              />
            ),
          }}
        />
        <Tab.Screen
          name="Wishlist"
          component={WishlistStackNavigator}
          options={{
            unmountOnBlur: true,
            tabBarBadge: 1,
            tabBarBadgeStyle: {
              backgroundColor: '#D4A574',
              color: '#0A0E1A',
              fontSize: 10,
              fontWeight: '700',
              minWidth: 18,
              height: 18,
              borderRadius: 9,
              marginTop: 2,
            },
            tabBarIcon: ({ focused }) => (
              <Ionicons 
                name="heart" 
                size={24} 
                color={focused ? '#D4A574' : '#5A6B8C'} 
              />
            ),
          }}
        />
        <Tab.Screen
          name="All Items"
          component={AllItemsStackNavigator}
          options={{
            unmountOnBlur: true,
            tabBarIcon: ({ focused }) => (
              <Ionicons 
                name="list" 
                size={24} 
                color={focused ? '#D4A574' : '#5A6B8C'} 
              />
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsStackNavigator}
          options={{
            tabBarIcon: ({ focused }) => (
              <Ionicons 
                name="settings" 
                size={24} 
                color={focused ? '#D4A574' : '#5A6B8C'} 
              />
            ),
          }}
        />
      </Tab.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    NavigationBar.setBackgroundColorAsync('#0F1419');
    NavigationBar.setButtonStyleAsync('light');
    NavigationBar.setVisibilityAsync('visible');
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#0F1419" 
        translucent={false}
      />
      <NavigationContainer>
        <TabNavigatorWithSafeArea />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopWidth: 0,
    elevation: 0,
    backgroundColor: 'transparent',
    paddingTop: 10,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
});
