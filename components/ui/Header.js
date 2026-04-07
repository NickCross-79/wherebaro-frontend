import { Text, View } from 'react-native';
import { memo } from 'react';
import BaroTimer from '../baro/BaroTimer';
import styles from '../../styles/components/ui/Header.styles';

function Header({ nextArrival, nextLocation, isHere = false, showTitle = true, children }) {
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
          expiredText={isHere ? 'Leaving Soon' : 'Check back soon for Baro\'s next location and time'}
        />
      )}
      {children}
    </View>
  );
}

export default memo(Header);