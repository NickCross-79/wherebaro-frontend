import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import ItemDetailScreen from './screens/ItemDetailScreen';
import WishlistScreen from './screens/WishlistScreen';
import AllItemsScreen from './screens/AllItemsScreen';
import SettingsScreen from './screens/SettingsScreen';
import HomeActive from './assets/icons/icon_home_active.svg';
import HomeInactive from './assets/icons/icon_home_inactive.svg';
import ListActive from './assets/icons/icon_list_active.svg';
import ListInactive from './assets/icons/icon_list_inactive.svg';
import HeartInactive from './assets/icons/icon_heart_inactive.svg';
import SettingsInactive from './assets/icons/icon_settings_inactive.svg';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const WishlistStack = createNativeStackNavigator();
const AllItemsStack = createNativeStackNavigator();

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
          component={HomeStackNavigator}
          options={{
            unmountOnBlur: true,
            tabBarIcon: ({ focused }) => (
              focused ? <HomeActive width={24} height={24} /> : <HomeInactive width={24} height={24} />
            ),
          }}
        />
        <Tab.Screen
          name="Wishlist"
          component={WishlistStackNavigator}
          options={{
            unmountOnBlur: true,
            tabBarIcon: ({ focused }) => (
              <HeartInactive width={24} height={24} />
            ),
          }}
        />
        <Tab.Screen
          name="All Items"
          component={AllItemsStackNavigator}
          options={{
            unmountOnBlur: true,
            tabBarIcon: ({ focused }) => (
              focused ? <ListActive width={24} height={24} /> : <ListInactive width={24} height={24} />
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <SettingsInactive width={24} height={24} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0F1419',
    borderTopWidth: 2,
    borderTopColor: '#1A2332',
    height: 70,
    paddingBottom: 10,
    paddingTop: 10,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
});
