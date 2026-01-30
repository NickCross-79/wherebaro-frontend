import { StyleSheet, Text, View } from 'react-native';
import BaroTimer from './BaroTimer';
import NewItemShowcase from './NewItemShowcase';

export default function Header({ nextArrival, nextLocation, isHere = false, showTitle = true, newItem, onNewItemPress, children }) {
  return (
    <View style={styles.header}>
      {showTitle && (
        <>
          <Text style={styles.headerTitle}>WHERE BARO</Text>
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

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#121825',
    borderBottomWidth: 2,
    borderBottomColor: '#C89B3C',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#C89B3C',
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8B9DC3',
    marginTop: 4,
    letterSpacing: 1,
  },
});
