import { StyleSheet, Text, View } from 'react-native';

export default function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Baro is not currently visiting</Text>
      <Text style={styles.emptySubtext}>Check back later, Tenno</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    color: '#8B9DC3',
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#5A6B8C',
    marginTop: 8,
  },
});
