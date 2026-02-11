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
import { initializeDatabase, storageHelpers } from './utils/storage';
import { registerForPushNotifications } from './services/api';
import AppNavigator, { getIsItemDetailActive } from './navigation/AppNavigator';
import styles from './styles/App.styles';

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
        await initializeDatabase();
        const isFirst = await storageHelpers.getIsFirstLaunch();
        if (isFirst) {
          await storageHelpers.setIsFirstLaunch(false);
          logger.log('App initialized for first time');
        }
        const deviceUID = await storageHelpers.getOrCreateUID();
        setUid(deviceUID);
        logger.log('Device UID:', deviceUID);
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
        <WishlistProvider>
          <AllItemsProvider>
            <InventoryProvider>
              <StatusBar
                barStyle="light-content"
                backgroundColor="#0F1419"
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
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

