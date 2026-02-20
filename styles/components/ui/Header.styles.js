import { StyleSheet } from 'react-native';
import { colors } from '../../../constants/theme';

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
    letterSpacing: 0.5,
    fontWeight: '500',
  },
});

export default styles;
