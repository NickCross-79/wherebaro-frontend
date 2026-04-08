import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import BaroScreen from '../screens/BaroScreen';
import ItemDetailScreen from '../screens/ItemDetailScreen';
import WishlistScreen from '../screens/WishlistScreen';
import AllItemsScreen from '../screens/AllItemsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import { useWishlist } from '../contexts/WishlistContext';
import { useInventory } from '../contexts/InventoryContext';
import { useNewVersion } from '../contexts/NewVersionContext';
import BaroIcon from '../assets/icons/icon_baro.svg';
import Ionicons from '@expo/vector-icons/Ionicons';
import PsaFab from '../components/ui/PsaFab';
import styles from '../styles/navigation/AppNavigator.styles';
import { colors, gradients } from '../constants/theme';

// ─── Stack Navigators ──────────────────────────────────────────────

const Tab = createMaterialTopTabNavigator();
const ItemStack = createNativeStackNavigator();
const SettingsStack = createNativeStackNavigator();

const STACK_OPTIONS = { headerShown: false };
const ITEM_DETAIL_OPTIONS = { gestureEnabled: false };

function createItemDetailStack(listName, ListComponent) {
  return function StackNavigator() {
    return (
      <ItemStack.Navigator screenOptions={STACK_OPTIONS}>
        <ItemStack.Screen name={listName} component={ListComponent} />
        <ItemStack.Screen
          name="ItemDetail"
          component={ItemDetailScreen}
          options={ITEM_DETAIL_OPTIONS}
        />
      </ItemStack.Navigator>
    );
  };
}

const BaroStackNavigator = createItemDetailStack('BaroList', BaroScreen);
const WishlistStackNavigator = createItemDetailStack('WishlistList', WishlistScreen);
const AllItemsStackNavigator = createItemDetailStack('AllItemsList', AllItemsScreen);

function SettingsStackNavigator() {
  return (
    <SettingsStack.Navigator screenOptions={STACK_OPTIONS}>
      <SettingsStack.Screen name="SettingsMain" component={SettingsScreen} />
      <SettingsStack.Screen name="Feedback" component={FeedbackScreen} />
    </SettingsStack.Navigator>
  );
}

// ─── Custom Tab Bar ────────────────────────────────────────────────

const ICON_MAP = {
  Baro: 'baro',
  Wishlist: 'heart',
  'All Items': 'list',
  Settings: 'settings',
};

function CustomTabBar({ state, navigation, insets, badgeCount }) {
  const { hasNewVersion } = useNewVersion();
  return (
    <View
      style={[
        styles.tabBar,
        { paddingBottom: insets.bottom + 6, height: insets.bottom + 54 },
      ]}
    >
      <LinearGradient
        colors={gradients.tabBar}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.tabBarContent}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const color = focused ? colors.accent : colors.textSecondary;

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
                  <BaroIcon width={22} height={22} color={color} />
                ) : (
                  <Ionicons
                    name={ICON_MAP[route.name] || 'ellipse'}
                    size={20}
                    color={color}
                  />
                )}
                {route.name === 'Wishlist' && badgeCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badgeCount}</Text>
                  </View>
                )}
                {route.name === 'Settings' && hasNewVersion && (
                  <Ionicons
                    name="alert-circle"
                    size={13}
                    color={colors.accent}
                    style={styles.settingsAlert}
                  />
                )}
              </View>
              <Text style={[styles.tabBarLabel, { color }]}>{route.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Tab Navigator ─────────────────────────────────────────────────

export default function AppNavigator({ isItemDetailActive }) {
  const insets = useSafeAreaInsets();
  const { getWishlistCount, wishlistIds, wishlistLoaded } = useWishlist();
  const { items, isHere } = useInventory();

  const badgeCount =
    wishlistLoaded && wishlistIds.length > 0 && isHere
      ? getWishlistCount(items)
      : 0;

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        tabBarPosition="bottom"
        screenOptions={{
          headerShown: false,
          swipeEnabled: !isItemDetailActive,
          animationEnabled: false,
        }}
        tabBar={(props) => (
          <CustomTabBar {...props} insets={insets} badgeCount={badgeCount} />
        )}
      >
        <Tab.Screen name="Baro" component={BaroStackNavigator} options={{ unmountOnBlur: true }} />
        <Tab.Screen name="Wishlist" component={WishlistStackNavigator} options={{ unmountOnBlur: true }} />
        <Tab.Screen name="All Items" component={AllItemsStackNavigator} options={{ unmountOnBlur: true }} />
        <Tab.Screen name="Settings" component={SettingsStackNavigator} />
      </Tab.Navigator>
      {!isItemDetailActive && <PsaFab />}
    </View>
  );
}

// ─── Navigation helper ─────────────────────────────────────────────

export const getIsItemDetailActive = (state) => {
  if (!state?.routes) return false;
  return state.routes.some((route) => {
    const nested = route.state;
    if (!nested?.routes) return false;
    return nested.routes[nested.index]?.name === 'ItemDetail';
  });
};

