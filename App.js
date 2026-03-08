import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { StatusBar, View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import * as NavigationBar from 'expo-navigation-bar';
import logger from './utils/logger';
import { WishlistProvider } from './contexts/WishlistContext';
import { InventoryProvider } from './contexts/InventoryContext';
import { AllItemsProvider } from './contexts/AllItemsContext';
import { UserActionsProvider } from './contexts/UserActionsContext';
import { NewVersionProvider } from './contexts/NewVersionContext';
import { initializeDatabase, storageHelpers } from './utils/storage';
import { registerForPushNotifications } from './services/api';
import AppNavigator, { getIsItemDetailActive } from './navigation/AppNavigator';
import styles from './styles/App.styles';
import { colors } from './constants/theme';

export default function App() {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [uid, setUid] = useState(null);
  const [isItemDetailActive, setIsItemDetailActive] = useState(false);
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    NavigationBar.setBackgroundColorAsync(colors.surface);
    NavigationBar.setButtonStyleAsync('light');
    NavigationBar.setVisibilityAsync('visible');
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initializeDatabase();
        const deviceUID = await storageHelpers.getOrCreateUID();
        setUid(deviceUID);
        logger.log('Device UID:', deviceUID.substring(0, 12) + '...');
        await registerForPushNotifications();
        setDbInitialized(true);
      } catch (error) {
        logger.error('Error initializing app:', error);
        setDbInitialized(true);
      }
    };
    initializeApp();
  }, []);

  if (!dbInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <UserActionsProvider>
        <NewVersionProvider>
        <WishlistProvider>
          <AllItemsProvider>
            <InventoryProvider>
              <StatusBar
                barStyle="light-content"
                backgroundColor={colors.surface}
                translucent={false}
              />
              <NavigationContainer
                ref={navigationRef}
                onStateChange={(state) => setIsItemDetailActive(getIsItemDetailActive(state))}
              >
                <AppNavigator isItemDetailActive={isItemDetailActive} />
              </NavigationContainer>
            </InventoryProvider>
          </AllItemsProvider>
        </WishlistProvider>
        </NewVersionProvider>
        </UserActionsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

