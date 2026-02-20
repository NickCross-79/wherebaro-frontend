import { StyleSheet } from 'react-native';
import { colors } from '../../../constants/theme';

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textDim,
    marginTop: 8,
  },
});

export default styles;
