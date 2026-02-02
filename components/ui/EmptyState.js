import { Text, View } from 'react-native';
import styles from '../../styles/components/ui/EmptyState.styles';

export default function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Baro is not currently visiting</Text>
      <Text style={styles.emptySubtext}>Check back later, Tenno</Text>
    </View>
  );
}

