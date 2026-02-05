import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, StatusBar, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import * as NavigationBar from 'expo-navigation-bar';
import BaroScreen from './screens/BaroScreen';
import ItemDetailScreen from './screens/ItemDetailScreen';
import WishlistScreen from './screens/WishlistScreen';
import AllItemsScreen from './screens/AllItemsScreen';
import SettingsScreen from './screens/SettingsScreen';
import FeedbackScreen from './screens/FeedbackScreen';
import { WishlistProvider, useWishlist } from './contexts/WishlistContext';
import { InventoryProvider, useInventory } from './contexts/InventoryContext';
import { AllItemsProvider } from './contexts/AllItemsContext';
import BaroIcon from './assets/icons/icon_baro.svg';
import Ionicons from '@expo/vector-icons/Ionicons';
import { initializeDatabase, storageHelpers } from './utils/storage';

const Tab = createMaterialTopTabNavigator();
const BaroStack = createNativeStackNavigator();
const WishlistStack = createNativeStackNavigator();
const AllItemsStack = createNativeStackNavigator();
const SettingsStack = createNativeStackNavigator();

function BaroStackNavigator() {
  return (
    <BaroStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <BaroStack.Screen name="BaroList" component={BaroScreen} />
      <BaroStack.Screen 
        name="ItemDetail" 
        component={ItemDetailScreen}
        options={{ gestureEnabled: false }}
      />
    </BaroStack.Navigator>
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
      <WishlistStack.Screen 
        name="ItemDetail" 
        component={ItemDetailScreen}
        options={{ gestureEnabled: false }}
      />
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
      <AllItemsStack.Screen 
        name="ItemDetail" 
        component={ItemDetailScreen}
        options={{ gestureEnabled: false }}
      />
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


import { useNavigationState } from '@react-navigation/native';

function TabNavigatorWithSafeArea({ isItemDetailActive }) {
  const insets = useSafeAreaInsets();
  const { getWishlistCount, wishlistIds, wishlistLoaded } = useWishlist();
  const { items, isHere } = useInventory();

  // Calculate badge count - only show wishlist items in current inventory
  const badgeCount = wishlistLoaded && wishlistIds.length > 0 && isHere
    ? getWishlistCount(items)
    : 0;

  const renderTabBar = ({ state, navigation }) => {
    const iconMap = {
      Baro: 'baro',
      Wishlist: 'heart',
      'All Items': 'list',
      Settings: 'settings',
    };

    return (
      <View
        style={{
          ...styles.tabBar,
          paddingBottom: insets.bottom + 10,
          height: insets.bottom + 70,
        }}
      >
        <LinearGradient
          colors={['rgba(15, 20, 25, 0.15)', 'rgba(15, 20, 25, 0.85)', '#0F1419']}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.tabBarContent}>
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={styles.tabItem}
                activeOpacity={0.8}
              >
                <View style={styles.iconWrapper}>
                  {route.name === 'Baro' ? (
                    <BaroIcon
                      width={28}
                      height={28}
                      color={focused ? '#D4A574' : '#5A6B8C'}
                    />
                  ) : (
                    <Ionicons
                      name={iconMap[route.name] || 'ellipse'}
                      size={24}
                      color={focused ? '#D4A574' : '#5A6B8C'}
                    />
                  )}
                  {route.name === 'Wishlist' && badgeCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{badgeCount}</Text>
                    </View>
                  )}
                </View>
                <Text
                  style={[
                    styles.tabBarLabel,
                    { color: focused ? '#D4A574' : '#5A6B8C' },
                  ]}
                >
                  {route.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <Tab.Navigator
      tabBarPosition="bottom"
      screenOptions={({ route }) => ({
        headerShown: false,
        swipeEnabled: !isItemDetailActive,
        animationEnabled: false,
      })}
      tabBar={renderTabBar}
    >
      <Tab.Screen
        name="Baro"
        component={BaroStackNavigator}
        options={{
          unmountOnBlur: true,
        }}
      />
      <Tab.Screen
        name="Wishlist"
        component={WishlistStackNavigator}
        options={{
          unmountOnBlur: true,
        }}
      />
      <Tab.Screen
        name="All Items"
        component={AllItemsStackNavigator}
        options={{
          unmountOnBlur: true,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={{
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [uid, setUid] = useState(null);
  const [isItemDetailActive, setIsItemDetailActive] = useState(false);
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    NavigationBar.setBackgroundColorAsync('#0F1419');
    NavigationBar.setButtonStyleAsync('light');
    NavigationBar.setVisibilityAsync('visible');
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize database
        await initializeDatabase();
        // Initialize app state on first launch
        const isFirstLaunch = await storageHelpers.getIsFirstLaunch();
        if (isFirstLaunch) {
          // Generate and store UID
          await storageHelpers.getOrCreateUID();
          // Set first launch to false
          await storageHelpers.setIsFirstLaunch(false);
          console.log('App initialized for first time');
        }
        // Get and display UID
        const deviceUID = await storageHelpers.getOrCreateUID();
        setUid(deviceUID);
        console.log('Device UID:', deviceUID);
        
        setDbInitialized(true);
      } catch (error) {
        console.error('Error initializing app:', error);
        setDbInitialized(true); // Allow app to continue even if initialization fails
      }
    };
    initializeApp();
  }, []);

  // Helper to check if any stack is currently showing ItemDetail
  const getIsItemDetailActive = (state) => {
    if (!state) return false;
    if (!state.routes) return false;
    for (const route of state.routes) {
      if (route.state && route.state.routes) {
        const nested = route.state;
        const currentNested = nested.routes[nested.index];
        if (currentNested && currentNested.name === 'ItemDetail') {
          return true;
        }
      }
    }
    return false;
  };

  const handleStateChange = (state) => {
    setIsItemDetailActive(getIsItemDetailActive(state));
  };

  if (!dbInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0E1A', padding: 20 }}>
        <Text style={{ color: '#FFFFFF', fontSize: 18, marginBottom: 20 }}>Loading...</Text>
        {uid && (
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#D4A574', fontSize: 12, marginBottom: 4 }}>Device UID</Text>
            <Text style={{ color: '#8B9DC3', fontSize: 10, fontFamily: 'monospace' }}>{uid}</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <WishlistProvider>
          <InventoryProvider>
            <AllItemsProvider>
              <StatusBar 
                barStyle="light-content" 
                backgroundColor="#0F1419" 
                translucent={false}
              />
              <NavigationContainer
                ref={navigationRef}
                onStateChange={handleStateChange}
              >
                <TabNavigatorWithSafeArea isItemDetailActive={isItemDetailActive} />
              </NavigationContainer>
            </AllItemsProvider>
          </InventoryProvider>
        </WishlistProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 0,
    elevation: 0,
    backgroundColor: 'transparent',
    paddingTop: 10,
  },
  tabBarContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -12,
    backgroundColor: '#D4A574',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#0A0E1A',
    fontSize: 10,
    fontWeight: '700',
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
});
