import { Text, View } from 'react-native';
import styles from '../../styles/components/ui/EmptyState.styles';

export default function EmptyState({
  title = 'Baro is not currently visiting',
  subtitle = 'Check back later, Tenno',
}) {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{title}</Text>
      <Text style={styles.emptySubtext}>{subtitle}</Text>
    </View>
  );
}
