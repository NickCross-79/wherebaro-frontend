import { StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

const styles = StyleSheet.create({
  flex: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  loadingText: {
    color: colors.text,
    fontSize: 18,
    marginBottom: 20,
  },
  loadingUidContainer: {
    alignItems: 'center',
  },
  loadingUidLabel: {
    color: colors.accent,
    fontSize: 12,
    marginBottom: 4,
  },
  loadingUidValue: {
    color: colors.textSecondary,
    fontSize: 10,
    fontFamily: 'monospace',
  },
});

export default styles;
