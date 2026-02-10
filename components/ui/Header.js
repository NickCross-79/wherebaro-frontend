import { Text, View } from 'react-native';
import { memo } from 'react';
import BaroTimer from '../baro/BaroTimer';
import NewItemShowcase from '../baro/NewItemShowcase';
import styles from '../../styles/components/ui/Header.styles';

function Header({ nextArrival, nextLocation, isHere = false, showTitle = true, newItem, onNewItemPress, children }) {
  return (
    <View style={styles.header}>
      {showTitle && (
        <>
          <Text style={styles.headerTitle}>WHEN BARO</Text>
          <Text style={styles.headerSubtitle}>Void Trader Tracker</Text>
        </>
      )}
      {nextArrival && (
        <BaroTimer
          nextArrival={nextArrival}
          location={nextLocation}
          label={isHere ? 'Leaving In' : 'Next Arrival'}
          expiredText={isHere ? 'Leaving Soon' : 'Arriving Soon'}
        />
      )}
      {newItem && <NewItemShowcase item={newItem} onPress={onNewItemPress} />}
      {children}
    </View>
  );
}

export default memo(Header);